import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';

// Konfigurera PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface ReactPDFViewerProps {
  pdfUrl: string;
  filename: string;
  width?: string | number;
  height?: string | number;
}

const ReactPDFViewer = ({ pdfUrl, filename, width = '100%', height = '100%' }: ReactPDFViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Återställ status när PDF URL ändras
    setLoading(true);
    setError(null);
    setPageNumber(1);
  }, [pdfUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Fel vid laddning av PDF:', error);
    setError(error);
    setLoading(false);
  };

  const changePage = (offset: number) => {
    if (numPages === null) return;
    
    const newPage = pageNumber + offset;
    if (newPage >= 1 && newPage <= numPages) {
      setPageNumber(newPage);
    }
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => setScale(prevScale => Math.min(prevScale + 0.1, 2.0));
  const zoomOut = () => setScale(prevScale => Math.max(prevScale - 0.1, 0.5));
  const resetZoom = () => setScale(1.0);

  return (
    <Box
      sx={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#333',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* PDF-innehåll med scrollbar */}
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          p: 2
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
              alignItems: 'center',
              gap: 2
            }}
          >
            <CircularProgress size="lg" />
            <Typography level="body-md" sx={{ color: 'white' }}>
              Laddar PDF...
            </Typography>
          </Box>
        )}
        
        {error ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              p: 4,
              color: 'white',
              height: '100%'
            }}
          >
            <Typography level="h4" sx={{ mb: 2 }}>
              Det gick inte att visa PDF-filen
            </Typography>
            <Typography sx={{ mb: 2 }}>
              Ett fel uppstod när filen skulle laddas: {error.message}
            </Typography>
            <Button
              component="a"
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                mt: 2,
                bgcolor: 'primary.500',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.600'
                }
              }}
            >
              Öppna PDF i nytt fönster
            </Button>
          </Box>
        ) : (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null} // Vi hanterar egen loading-status
            error={null} // Vi hanterar egna fel
          >
            <Box 
              sx={{ 
                position: 'relative',
                bgcolor: 'white',
                boxShadow: '0 0 10px rgba(0,0,0,0.2)',
                transition: 'transform 0.3s',
                transform: `scale(${scale})`,
                transformOrigin: 'top center',
                mb: 4
              }}
            >
              <Page 
                pageNumber={pageNumber} 
                renderTextLayer={true}
                renderAnnotationLayer={true}
                width={containerRef.current?.clientWidth ? containerRef.current.clientWidth * 0.8 : undefined}
              />
              
              {/* "Nuvarande version" badge */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  zIndex: 2,
                  bgcolor: '#6366f1',
                  color: 'white',
                  fontSize: '0.75rem',
                  py: 0.5,
                  px: 1.5,
                  borderRadius: 'md',
                  fontWeight: 'bold'
                }}
              >
                Nuvarande version
              </Box>
              
              {/* Grön vänster border som i designen */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: '8px',
                  backgroundColor: '#4caf50'
                }}
              />
            </Box>
          </Document>
        )}
      </Box>

      {/* Kontroller längst ner */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 1,
          gap: 1,
          bgcolor: '#222',
          borderTop: '1px solid #444'
        }}
      >
        <Button
          size="sm"
          variant="plain"
          onClick={previousPage}
          disabled={pageNumber <= 1}
          sx={{ 
            bgcolor: '#4caf50', 
            color: 'white',
            '&:hover': { bgcolor: '#3d8b40' },
            borderRadius: 'sm',
            minWidth: '45px',
            width: '45px',
            height: '35px',
            px: 1
          }}
        >
          ←
        </Button>
        
        <Typography
          sx={{
            color: 'white',
            mx: 2,
            fontSize: '0.875rem',
            fontWeight: 'medium'
          }}
        >
          Sida {pageNumber} av {numPages || '?'}
        </Typography>
        
        <Button
          size="sm"
          variant="plain"
          onClick={nextPage}
          disabled={numPages === null || pageNumber >= numPages}
          sx={{ 
            bgcolor: '#4caf50', 
            color: 'white',
            '&:hover': { bgcolor: '#3d8b40' },
            borderRadius: 'sm',
            minWidth: '45px',
            width: '45px',
            height: '35px',
            px: 1
          }}
        >
          →
        </Button>
        
        <Button
          size="sm"
          variant="plain"
          onClick={zoomOut}
          disabled={scale <= 0.5}
          sx={{ 
            bgcolor: '#4caf50', 
            color: 'white',
            borderRadius: 'sm',
            minWidth: '45px',
            width: '45px',
            height: '35px',
            px: 1
          }}
        >
          −
        </Button>
        
        <Button
          size="sm"
          variant="plain"
          onClick={resetZoom}
          sx={{ 
            bgcolor: '#4caf50', 
            color: 'white',
            borderRadius: 'sm',
            height: '35px',
            px: 1.5,
            minWidth: '60px'
          }}
        >
          {Math.round(scale * 100)}%
        </Button>
        
        <Button
          size="sm"
          variant="plain"
          onClick={zoomIn}
          disabled={scale >= 2.0}
          sx={{ 
            bgcolor: '#4caf50', 
            color: 'white',
            borderRadius: 'sm',
            minWidth: '45px',
            width: '45px',
            height: '35px',
            px: 1
          }}
        >
          +
        </Button>
      </Box>
    </Box>
  );
};

export default ReactPDFViewer;