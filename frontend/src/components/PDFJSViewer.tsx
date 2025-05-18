import { useEffect, useState, useRef } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/joy';
import * as pdfjsLib from 'pdfjs-dist';

// Konfigurera arbetarfilen för PDF.js
const pdfjsWorkerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerSrc;

interface PDFJSViewerProps {
  pdfUrl: string;
  filename: string;
  width?: string | number;
  height?: string | number;
}

const PDFJSViewer = ({ pdfUrl, filename, width = '100%', height = '100%' }: PDFJSViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [pdfDocument, setPdfDocument] = useState<any>(null);

  // Ladda PDF dokumentet
  useEffect(() => {
    if (!pdfUrl) return;

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Ladda dokumentet
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        
        setPdfDocument(pdf);
        setNumPages(pdf.numPages);
        setCurrentPage(1);
      } catch (err) {
        console.error('Fel vid laddning av PDF:', err);
        setError('Kunde inte ladda PDF-dokumentet.');
      } finally {
        setLoading(false);
      }
    };

    loadPdf();
  }, [pdfUrl]);

  // Rendera aktuell sida
  useEffect(() => {
    if (!pdfDocument || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        setLoading(true);
        const page = await pdfDocument.getPage(currentPage);
        
        // Beräkna skala för att passa container
        const viewport = page.getViewport({ scale });
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const context = canvas.getContext('2d');
        if (!context) return;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Rendera PDF-sidan till canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        await page.render(renderContext).promise;
      } catch (err) {
        console.error('Fel vid rendering av PDF-sida:', err);
        setError('Kunde inte visa PDF-sidan.');
      } finally {
        setLoading(false);
      }
    };

    renderPage();
  }, [pdfDocument, currentPage, scale]);

  // Kontroller för navigering
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const zoomIn = () => {
    setScale(scale => Math.min(scale + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale(scale => Math.max(scale - 0.2, 0.6));
  };

  // Om det finns fel, visa felmeddelande
  if (error) {
    return (
      <Box 
        sx={{ 
          width, 
          height, 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2
        }}
      >
        <Typography level="h4" color="danger" sx={{ mb: 2 }}>
          Fel vid laddning av PDF
        </Typography>
        <Typography>{error}</Typography>
        <Button
          component="a"
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ mt: 2 }}
        >
          Öppna i nytt fönster
        </Button>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        width, 
        height,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* PDF Visningsområde */}
      <Box 
        sx={{ 
          flex: 1, 
          overflow: 'auto', 
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: '#333'
        }}
      >
        {loading && (
          <Box 
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <CircularProgress color="primary" />
            <Typography sx={{ mt: 2, color: 'white' }}>Laddar sida {currentPage}...</Typography>
          </Box>
        )}
        
        <canvas 
          ref={canvasRef} 
          style={{ 
            display: loading ? 'none' : 'block',
            margin: '20px auto',
            backgroundColor: 'white',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}
        ></canvas>
      </Box>

      {/* Kontrollpanel */}
      <Box 
        sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: '#f5f5f5'
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="plain" 
            color="neutral" 
            onClick={zoomOut}
            disabled={loading}
          >
            -
          </Button>
          <Button 
            variant="plain" 
            color="neutral"
            onClick={zoomIn}
            disabled={loading}
          >
            +
          </Button>
          <Typography sx={{ alignSelf: 'center', mx: 1 }}>
            {Math.round(scale * 100)}%
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            variant="plain" 
            color="neutral"
            onClick={prevPage}
            disabled={currentPage <= 1 || loading}
          >
            &lt;
          </Button>
          <Typography sx={{ mx: 2 }}>
            {currentPage} / {numPages}
          </Typography>
          <Button 
            variant="plain" 
            color="neutral"
            onClick={nextPage}
            disabled={currentPage >= numPages || loading}
          >
            &gt;
          </Button>
        </Box>

        <Button
          component="a"
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          size="sm"
          sx={{ 
            bgcolor: '#4caf50', 
            color: 'white',
            '&:hover': { bgcolor: '#3d8b40' }
          }}
        >
          Öppna i nytt fönster
        </Button>
      </Box>
    </Box>
  );
};

export default PDFJSViewer;