import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/joy';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist';

// Konfigurera PDF.js worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

/**
 * DirectPDFView - Fristående PDF-visare
 * 
 * En helt fristående komponent som visar PDF-filer direkt från API genom URL:en
 * Nås via: /view-pdf/:id 
 */
const DirectPDFView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.5);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>('Dokument');

  // Ladda PDF vid komponentmontering
  useEffect(() => {
    if (!id) {
      setError('Inget PDF-ID specificerat i URL:en');
      setLoading(false);
      return;
    }

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Använd den exakta API-URL:en som du specificerat
        const pdfUrl = `/api/pdf/${id}/content/`;
        console.log('Laddar PDF direkt från:', pdfUrl);
        
        // Skapa token för autentisering om tillgänglig
        const token = localStorage.getItem('jwt_token');
        const options: any = {
          url: pdfUrl,
          withCredentials: true
        };
        
        if (token) {
          options.httpHeaders = {
            'Authorization': `Bearer ${token}`
          };
        }
        
        // Ladda PDF-filen direkt med PDF.js
        const loadingTask = pdfjsLib.getDocument(options);
        const pdf = await loadingTask.promise;
        
        setPdfDocument(pdf);
        setNumPages(pdf.numPages);
        setCurrentPage(1);
        
        // Försök hämta filnamn från Content-Disposition headern
        try {
          const response = await fetch(pdfUrl, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            credentials: 'include'
          });
          
          const contentDisposition = response.headers.get('Content-Disposition');
          if (contentDisposition) {
            const matches = /filename="([^"]+)"/.exec(contentDisposition);
            if (matches && matches[1]) {
              setFilename(matches[1]);
            }
          }
        } catch (e) {
          console.warn('Kunde inte hämta filnamn:', e);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Fel vid laddning av PDF:', error);
        setError(`Kunde inte visa PDF-filen. ${(error as any).message || 'Ett okänt fel uppstod.'}`);
        setLoading(false);
      }
    };
    
    loadPdf();
    
    // Städa upp när komponenten avmonteras
    return () => {
      if (pdfDocument) {
        pdfDocument.destroy().catch(console.error);
      }
    };
  }, [id]);

  // Rendera aktuell sida
  useEffect(() => {
    if (!pdfDocument || !canvasRef.current) return;
    
    const renderPage = async () => {
      try {
        const page = await pdfDocument.getPage(currentPage);
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Anpassa vyportens storlek
        const viewport = page.getViewport({ scale });
        const context = canvas.getContext('2d');
        if (!context) return;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Rendera PDF-sidan
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
    setScale(prevScale => Math.min(prevScale + 0.2, 3));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.6));
  };

  return (
    <Box sx={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', p: 2 }}>
      {/* Sidhuvud */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography level="h4">
          {filename}
        </Typography>
        <Button onClick={() => navigate(-1)}>Tillbaka</Button>
      </Box>
      
      {/* Navigeringsfält */}
      <Stack 
        direction="row" 
        spacing={2} 
        sx={{ 
          mb: 2, 
          p: 1, 
          bgcolor: 'background.level1', 
          borderRadius: 'sm',
          justifyContent: 'space-between' 
        }}
      >
        <Stack direction="row" spacing={1}>
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
          <Typography sx={{ display: 'flex', alignItems: 'center', mx: 2 }}>
            Sida {currentPage} av {numPages}
          </Typography>
        </Stack>
        
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={zoomOut} disabled={loading}>
            Zooma ut
          </Button>
          <Button variant="outlined" onClick={zoomIn} disabled={loading}>
            Zooma in
          </Button>
        </Stack>
      </Stack>
      
      {/* PDF-visningsområdet */}
      <Box sx={{ 
        flexGrow: 1, 
        position: 'relative', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        bgcolor: '#f5f5f5',
        overflow: 'auto',
        p: 2
      }}>
        {loading && (
          <CircularProgress size="lg" />
        )}
        
        {error && (
          <Box sx={{ textAlign: 'center', maxWidth: 500 }}>
            <Typography level="h4" color="danger" gutterBottom>
              Fel vid laddning av PDF
            </Typography>
            <Typography gutterBottom>
              {error}
            </Typography>
            <Button 
              variant="solid" 
              color="primary" 
              onClick={() => window.location.reload()}
              sx={{ mt: 2 }}
            >
              Försök igen
            </Button>
          </Box>
        )}
        
        <canvas 
          ref={canvasRef} 
          style={{ 
            display: loading || error ? 'none' : 'block',
            maxWidth: '100%',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }} 
        />
      </Box>
    </Box>
  );
};

export default DirectPDFView;