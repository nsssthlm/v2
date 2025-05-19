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
    // Om ingen URL, returnera tom sträng
    if (!pdfUrl) return '';
    
    // Hantera backend URL:er för Replit-miljön
    let finalUrl = pdfUrl;
    
    console.log('Bearbetar PDF URL:', pdfUrl);
    
    // Ersätt alla lokala URL:er (0.0.0.0:8001) med Replit proxy URL
    if (pdfUrl.includes('0.0.0.0:8001')) {
      finalUrl = pdfUrl.replace(
        'http://0.0.0.0:8001', 
        `${window.location.protocol}//${window.location.host}/proxy/3000`
      );
      console.log("URL med proxy:", finalUrl);
    }
    
    // Om URL:en innehåller project_files, extrahera sökvägen för vår speciella PDF-endpoint
    if (finalUrl.includes('project_files/')) {
      // Extrahera sökvägen från project_files och framåt
      const pathMatch = finalUrl.match(/project_files\/.*\.pdf/);
      if (pathMatch) {
        const pdfPath = pathMatch[0];
        // Använd vår dedikerade PDF-endpoint som garanterar korrekt Content-Type
        finalUrl = `${window.location.protocol}//${window.location.host}/proxy/3000/api/files/pdf-media/${pdfPath}`;
        console.log("Använder dedikerad PDF-endpoint:", finalUrl);
      }
    }
    
    // Lägg alltid till en tidsstämpel parameter för att undvika cachning
    finalUrl = `${finalUrl}${finalUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
    
    return finalUrl;
  }, [pdfUrl]);

  // Funktion för att skapa en alternativ URL om den första misslyckas
  const createAlternativeUrl = (url: string): string => {
    // Om URL:en innehåller en specifik filnamnsstruktur, skapa alternativa URL:er utan hash-delen
    if (url.includes('project_files/') && url.includes('.pdf')) {
      const parts = url.split('/');
      const filename = parts[parts.length - 1];
      
      // Plocka bort timestamp-parametern om den finns
      const cleanUrl = url.split('?')[0];
      
      // Matcha grundläggande filnamn utan hash (t.ex. BEAst-PDF-Guidelines-2 från BEAst-PDF-Guidelines-2_1r4W7o4.0_1.pdf)
      const baseNameMatch = filename.match(/^([^_]+)/);
      
      if (baseNameMatch) {
        const baseName = baseNameMatch[1];
        // Ersätt filnamnet i sökvägen och returnera en URL direkt till /media/ istället för api-endpointen
        const directory = cleanUrl.substring(0, cleanUrl.lastIndexOf('/'));
        const directoryParts = directory.split('/');
        const date = directoryParts.slice(-3).join('/'); // YYYY/MM/DD
        
        return `${window.location.protocol}//${window.location.host}/proxy/3000/media/project_files/${date}/${baseName}.pdf`;
      }
    }
    return url;
  };

  // Använd en separat effekt för att hämta PDF-filen som en arraybuffer
  useEffect(() => {
    let isMounted = true;
    let attemptCount = 0;
    const maxAttempts = 3;
    
    const fetchPdf = async (url: string) => {
      if (!isMounted || attemptCount >= maxAttempts) return;
      
      attemptCount++;
      try {
        setIsLoading(true);
        
        if (attemptCount > 1) {
          console.log(`Försök ${attemptCount}/${maxAttempts} med alternativ URL:`, url);
        } else {
          console.log('Hämtar PDF-data från URL:', url);
        }
        
        // Använda fetch API istället för axios för bättre hantering av binärfiler
        const fetchResponse = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/pdf',
          }
        });
        
        if (!fetchResponse.ok) {
          console.warn(`Servern svarade med ${fetchResponse.status}: ${fetchResponse.statusText}`);
          throw new Error(`Servern svarade med ${fetchResponse.status}`);
        }
        
        const contentType = fetchResponse.headers.get('content-type');
        if (!contentType?.includes('application/pdf')) {
          console.warn('Servern returnerade oväntad Content-Type:', contentType);
        }
        
        // Läs in binärdatan som arraybuffer
        const buffer = await fetchResponse.arrayBuffer();
        
        if (!buffer || buffer.byteLength < 10) {
          throw new Error('För lite data returnerades');
        }
        
        // Kontrollera om vi fick PDF-data
        if (isPdfArrayBuffer(buffer)) {
          console.log(`PDF hämtad framgångsrikt, storlek: ${buffer.byteLength} bytes`);
          if (isMounted) {
            setPdfBytes(buffer);
          }
        } else {
          throw new Error('Servern returnerade inte giltig PDF-data');
        }
      } catch (err) {
        console.error(`Fel vid hämtning av PDF (försök ${attemptCount}/${maxAttempts}):`, err);
        
        if (attemptCount < maxAttempts) {
          // Prova med ett alternativt URL-format
          if (attemptCount === 1) {
            // Prova med URL utan timestamp
            const urlWithoutTimestamp = url.split('?')[0];
            fetchPdf(urlWithoutTimestamp);
          } else if (attemptCount === 2) {
            // Prova med direkt media-URL
            const alternativeUrl = createAlternativeUrl(url);
            fetchPdf(alternativeUrl);
          }
        } else {
          if (isMounted) {
            setError(`Kunde inte ladda PDF: Försökte ${maxAttempts} gånger men misslyckades. Försök öppna i ny flik.`);
            setIsLoading(false);
          }
        }
      }
    };
    
    fetchPdf(processedUrl);
    
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