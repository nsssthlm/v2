import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist';

// Konfigurera PDF.js worker - använd en mer stabil konfiguration
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;
}

interface PDFViewerProps {
  pdfUrl: string;
  title?: string;
  className?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, title, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.5);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Ladda PDF när pdfUrl ändras
  useEffect(() => {
    if (!pdfUrl) return;
    
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Laddar PDF från:', pdfUrl);
        
        // Lägg till token om tillgänglig
        const options: any = {
          url: pdfUrl,
          withCredentials: true,
        };
        
        const token = localStorage.getItem('jwt_token');
        if (token) {
          options.httpHeaders = {
            'Authorization': `Bearer ${token}`
          };
        }
        
        // Ladda PDF-dokument
        const loadingTask = pdfjsLib.getDocument(options);
        const pdf = await loadingTask.promise;
        
        setPdfDocument(pdf);
        setNumPages(pdf.numPages);
        setCurrentPage(1);
        setLoading(false);
      } catch (e) {
        console.error('Fel vid laddning av PDF:', e);
        setError(`Kunde inte ladda PDF: ${(e as Error).message || 'Okänt fel'}`);
        setLoading(false);
      }
    };
    
    loadPdf();
    
    return () => {
      // Städa upp vid avmonterad komponent
      if (pdfDocument) {
        pdfDocument.destroy().catch(console.error);
      }
    };
  }, [pdfUrl]);

  // Rendering av aktuell sida
  useEffect(() => {
    if (!pdfDocument || !canvasRef.current) return;
    
    const renderPage = async () => {
      try {
        const page = await pdfDocument.getPage(currentPage);
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const viewport = page.getViewport({ scale });
        const context = canvas.getContext('2d');
        if (!context) return;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context,
          viewport
        }).promise;
      } catch (e) {
        console.error('Fel vid rendering av PDF-sida:', e);
        setError('Kunde inte visa PDF-sidan.');
      }
    };
    
    renderPage();
  }, [pdfDocument, currentPage, scale]);

  // Navigeringskontroller
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.6));
  };

  return (
    <Box className={className} sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {title && (
        <Typography level="h4" sx={{ mb: 2 }}>{title}</Typography>
      )}
      
      {/* Kontrollpanel */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={goToPreviousPage}
            disabled={currentPage <= 1 || loading}
          >
            Föregående
          </Button>
          <Button
            variant="outlined"
            onClick={goToNextPage}
            disabled={currentPage >= numPages || loading}
          >
            Nästa
          </Button>
        </Box>
        
        <Typography sx={{ alignSelf: 'center' }}>
          Sida {currentPage} av {numPages}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={zoomOut}
            disabled={loading}
          >
            Zooma ut
          </Button>
          <Button
            variant="outlined"
            onClick={zoomIn}
            disabled={loading}
          >
            Zooma in
          </Button>
        </Box>
      </Box>
      
      {/* PDF-visningsområde */}
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'neutral.outlinedBorder',
          borderRadius: 'sm',
          p: 2,
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          bgcolor: 'background.level1',
          overflow: 'auto'
        }}
      >
        {loading && (
          <CircularProgress
            size="lg"
            sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          />
        )}
        
        {error && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography color="danger" mb={2}>{error}</Typography>
            <Button
              color="primary"
              onClick={() => window.location.reload()}
            >
              Försök igen
            </Button>
          </Box>
        )}
        
        <canvas
          ref={canvasRef}
          style={{
            display: loading || error ? 'none' : 'block',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
          }}
        />
      </Box>
    </Box>
  );
};

export default PDFViewer;