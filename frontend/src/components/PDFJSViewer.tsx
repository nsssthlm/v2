import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress } from '@mui/joy';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';
import axios from 'axios';

// Konfigurera arbetaren för PDF.js med lokal arbetare istället för CDN
// Detta säkerställer att vi använder rätt version och inte är beroende av extern CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

interface PDFJSViewerProps {
  pdfUrl: string;
  filename: string;
}

// Hjälpfunktion för att kontrollera om en URL pekar till en extern domän
const isExternalUrl = (url: string) => {
  if (!url.startsWith('http')) return false;
  try {
    const urlObj = new URL(url);
    return urlObj.hostname !== window.location.hostname;
  } catch (e) {
    return false;
  }
};

// Hjälpfunktion för att validera en PDF arraybuffer
const isPdfArrayBuffer = (buffer: ArrayBuffer): boolean => {
  if (!buffer || buffer.byteLength < 5) return false;
  
  // PDF filer börjar alltid med %PDF
  const signatureBytes = new Uint8Array(buffer, 0, 5);
  const signature = String.fromCharCode.apply(null, Array.from(signatureBytes));
  return signature.startsWith('%PDF');
};

const PDFJSViewer: React.FC<PDFJSViewerProps> = ({ pdfUrl, filename }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Bearbeta URL till ett format som kan visas med PDF.js
  const processedUrl = React.useMemo(() => {
    // Hantera backend URL:er för Replit-miljön
    let finalUrl = pdfUrl;
    
    // Lägg till direct=true parameter för att garantera att vi får binärdata tillbaka
    // Detta säger till backend att vi vill ha raw PDF content, inte JSON
    if (finalUrl.includes('/api/files/web/')) {
      finalUrl = `${finalUrl}${finalUrl.includes('?') ? '&' : '?'}direct=true`;
      console.log("Använda direkt PDF URL via Replit proxy");
    }
    
    // Ersätt alla lokala URL:er (0.0.0.0:8001) med Replit proxy URL
    if (pdfUrl && pdfUrl.includes('0.0.0.0:8001')) {
      finalUrl = pdfUrl.replace(
        'http://0.0.0.0:8001', 
        `${window.location.protocol}//${window.location.host}/proxy/3000`
      );
      console.log("Använder final PDF URL:", finalUrl);
    }
    
    // Om URL:en innehåller /api/files/web/ och project_files, extrahera media-delen
    if (finalUrl.includes('/api/files/web/') && finalUrl.includes('project_files/')) {
      // Extrahera sökvägen från project_files och framåt
      const pathMatch = finalUrl.match(/project_files\/.*\.pdf/);
      if (pathMatch) {
        // Skapa direkt länk till media-filen
        const mediaPath = pathMatch[0];
        // Använd proxy eller direkt URL beroende på miljö
        finalUrl = `${window.location.protocol}//${window.location.host}/proxy/3000/media/${mediaPath}`;
        console.log("Konverterad till direkt media URL:", finalUrl);
      }
    }
    
    return finalUrl;
  }, [pdfUrl]);

  // Använd en separat effekt för att hämta PDF-filen som en arraybuffer
  useEffect(() => {
    let isMounted = true;
    
    const fetchPdf = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Hämtar PDF-data från URL:', processedUrl);
        
        // Använda axios med responseType arraybuffer för att säkerställa binärdata
        const response = await axios.get(processedUrl, {
          responseType: 'arraybuffer',
          // Lägg till headers för att säkerställa att vi får en PDF tillbaka
          headers: {
            'Accept': 'application/pdf',
            'Content-Type': 'application/pdf'
          }
        });
        
        // Validera PDF-datan
        const pdfData = response.data;
        
        if (!isPdfArrayBuffer(pdfData)) {
          console.error('Ogiltig PDF-data mottagen:', pdfData);
          throw new Error('Servern returnerade inte giltig PDF-data');
        }
        
        console.log('PDF hämtad som arraybuffer, storlek:', pdfData.byteLength);
        
        if (isMounted) {
          setPdfBytes(pdfData);
        }
      } catch (err) {
        console.error('Fel vid hämtning av PDF:', err);
        
        // Försök med fetch som fallback
        try {
          console.log('Försöker med fetch som fallback');
          const fetchResponse = await fetch(processedUrl);
          const contentType = fetchResponse.headers.get('content-type');
          
          if (!contentType?.includes('application/pdf')) {
            console.warn('Felaktig Content-Type:', contentType);
          }
          
          const buffer = await fetchResponse.arrayBuffer();
          
          if (!isPdfArrayBuffer(buffer)) {
            throw new Error('Servern returnerade inte giltig PDF-data (i fetch fallback)');
          }
          
          if (isMounted) {
            setPdfBytes(buffer);
          }
        } catch (fetchErr) {
          console.error('Fetch fallback misslyckades:', fetchErr);
          
          if (isMounted) {
            setError(fetchErr instanceof Error 
              ? `Kunde inte ladda PDF: ${fetchErr.message}` 
              : 'Kunde inte ladda PDF-filen');
            setIsLoading(false);
          }
        }
      }
    };
    
    fetchPdf();
    
    return () => {
      isMounted = false;
    };
  }, [processedUrl]);

  // Använd en separat effekt för att rendera PDF:en när bytes är tillgängliga
  useEffect(() => {
    let pdfDoc: pdfjsLib.PDFDocumentProxy | null = null;
    let isMounted = true;
    
    const renderPdf = async () => {
      if (!pdfBytes || !canvasRef.current) return;
      
      try {
        // Ladda dokumentet med PDF.js från arraybuffer
        console.log('Laddar PDF-dokument från arraybuffer');
        pdfDoc = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
        
        if (!isMounted) return;
        
        setNumPages(pdfDoc.numPages);
        await renderPage(pdfDoc, 1);
        setIsLoading(false);
      } catch (err) {
        console.error('Fel vid rendering av PDF:', err);
        
        if (isMounted) {
          // Visa detaljerat felmeddelande
          const errorMessage = err instanceof Error ? err.message : 'Okänt fel vid PDF-rendering';
          setError(`PDF-rendering misslyckades: ${errorMessage}`);
          setIsLoading(false);
        }
      }
    };
    
    const renderPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number) => {
      if (!canvasRef.current) return;
      
      try {
        const page = await pdf.getPage(pageNum);
        
        const viewport = page.getViewport({ scale: 1.0 });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('Kunde inte skapa canvas-kontext');
        }
        
        // Anpassa canvas-storleken till viewporten
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Om container finns, justera skalan för att passa i containern
        if (containerRef.current) {
          const containerWidth = containerRef.current.clientWidth;
          const scale = containerWidth / viewport.width;
          const scaledViewport = page.getViewport({ scale });
          
          canvas.height = scaledViewport.height;
          canvas.width = scaledViewport.width;
          
          await page.render({
            canvasContext: context,
            viewport: scaledViewport
          }).promise;
        } else {
          await page.render({
            canvasContext: context,
            viewport
          }).promise;
        }
        
        setCurrentPage(pageNum);
      } catch (err) {
        console.error('Fel vid rendering av PDF-sida:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Kunde inte rendera PDF-sidan');
        }
      }
    };
    
    if (pdfBytes) {
      renderPdf();
    }
    
    return () => {
      isMounted = false;
      if (pdfDoc) {
        // Frigör PDF-dokument när komponenten avmonteras
        pdfDoc.destroy();
      }
    };
  }, [pdfBytes]);
  
  // Lyssna på storleksändringar i containern
  useEffect(() => {
    if (!containerRef.current || !pdfBytes) return;
    
    const resizeObserver = new ResizeObserver(() => {
      // Uppdatera rendering när containerstorleken ändras
      if (numPages > 0 && !isLoading) {
        const loadPdf = async () => {
          try {
            const pdfDoc = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
            await renderPage(pdfDoc, currentPage);
            pdfDoc.destroy();
          } catch (err) {
            console.error('Fel vid omladdning efter storleksändring:', err);
          }
        };
        
        loadPdf();
      }
    });
    
    resizeObserver.observe(containerRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [numPages, isLoading, currentPage, pdfBytes]);
  
  const renderPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number) => {
    if (!canvasRef.current || !containerRef.current) return;
    
    try {
      const page = await pdf.getPage(pageNum);
      
      const containerWidth = containerRef.current.clientWidth;
      const viewport = page.getViewport({ scale: 1.0 });
      const scale = containerWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale });
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;
      
      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;
      
      await page.render({
        canvasContext: context,
        viewport: scaledViewport
      }).promise;
    } catch (err) {
      console.error('Fel vid rendering:', err);
    }
  };

  return (
    <Box 
      ref={containerRef}
      sx={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'auto',
        bgcolor: '#f5f5f5'
      }}
    >
      {isLoading ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          p: 3
        }}>
          <CircularProgress size="lg" />
          <Typography level="body-sm" sx={{ mt: 2 }}>
            Laddar {filename}...
          </Typography>
        </Box>
      ) : error ? (
        <Box sx={{ 
          textAlign: 'center',
          p: 3,
          maxWidth: '500px'
        }}>
          <Typography level="h3" color="danger" sx={{ mb: 2 }}>
            Kunde inte visa PDF
          </Typography>
          <Typography sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Typography level="body-sm" sx={{ mb: 2 }}>
            Försök använda en direkt länk eller ladda ner filen istället.
          </Typography>
          <Box 
            component="a"
            href={processedUrl}
            target="_blank"
            sx={{
              display: 'inline-block',
              p: 1.5,
              bgcolor: 'primary.500',
              color: 'white',
              borderRadius: 'md',
              textDecoration: 'none',
              '&:hover': {
                bgcolor: 'primary.600'
              }
            }}
          >
            Öppna i ny flik
          </Box>
        </Box>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          width: '100%'
        }}>
          <canvas ref={canvasRef} style={{ maxWidth: '100%' }} />
          
          {numPages > 1 && (
            <Box sx={{ 
              mt: 2, 
              display: 'flex', 
              alignItems: 'center',
              gap: 1
            }}>
              <Typography level="body-sm">
                Sida {currentPage} av {numPages}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default PDFJSViewer;