import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress } from '@mui/joy';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';

// Konfigurera arbetaren för PDF.js
// @ts-ignore: TS2345
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFJSViewerProps {
  pdfUrl: string;
  filename: string;
}

const PDFJSViewer: React.FC<PDFJSViewerProps> = ({ pdfUrl, filename }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Bearbeta URL till ett format som kan visas med PDF.js
  const processedUrl = React.useMemo(() => {
    // Hantera backend URL:er för Replit-miljön
    let finalUrl = pdfUrl;
    
    // Ersätt alla lokala URL:er (0.0.0.0:8001) med Replit proxy URL
    if (pdfUrl && pdfUrl.includes('0.0.0.0:8001')) {
      finalUrl = pdfUrl.replace(
        'http://0.0.0.0:8001', 
        'https://3eabe322-11fd-420e-9b72-6dc9b22d9093-00-2gpr7cql4w25w.kirk.replit.dev/proxy/3000'
      );
      console.log("Konverterad URL till Replit proxy:", finalUrl);
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

  useEffect(() => {
    let pdfDoc: pdfjsLib.PDFDocumentProxy | null = null;
    let isMounted = true;
    
    const loadPdf = async () => {
      if (!canvasRef.current) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Laddar PDF från URL:', processedUrl);
        
        // Använd fetch för att hämta PDF-filen som en arraybuffer
        const response = await fetch(processedUrl);
        if (!response.ok) {
          throw new Error(`Kunde inte hämta PDF: ${response.status} ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        console.log('PDF hämtad som arraybuffer, storlek:', arrayBuffer.byteLength);
        
        // Ladda dokumentet med PDF.js
        pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        if (!isMounted) return;
        
        setNumPages(pdfDoc.numPages);
        await renderPage(pdfDoc, 1);
        setIsLoading(false);
      } catch (err) {
        console.error('Fel vid laddning av PDF:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Kunde inte ladda PDF');
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
    
    loadPdf();
    
    return () => {
      isMounted = false;
      if (pdfDoc) {
        // Frigör PDF-dokument när komponenten avmonteras
        pdfDoc.destroy();
      }
    };
  }, [processedUrl]);
  
  // Lyssna på storleksändringar i containern
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      // Uppdatera rendering när containerstorleken ändras
      if (numPages > 0 && !isLoading) {
        const loadPdf = async () => {
          try {
            const pdfDoc = await pdfjsLib.getDocument(processedUrl).promise;
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
  }, [numPages, isLoading, currentPage, processedUrl]);
  
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