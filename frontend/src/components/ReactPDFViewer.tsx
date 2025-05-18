import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Box, Button, Typography, CircularProgress, IconButton } from '@mui/joy';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Konfigurera worker path för PDFjs
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface ReactPDFViewerProps {
  pdfUrl: string;
  filename: string;
  width?: string | number;
  height?: string | number;
}

const ReactPDFViewer = ({ 
  pdfUrl, 
  filename, 
  width = '100%', 
  height = '100%' 
}: ReactPDFViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1.0);

  // Hantera dokumentladdning
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setLoading(false);
    setError(true);
  };

  // Navigeringsfunktioner
  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    if (numPages) {
      setPageNumber(prev => Math.min(prev + 1, numPages));
    }
  };

  // Zoomfunktioner
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  return (
    <Box
      sx={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#333'
      }}
    >
      {/* "Nuvarande version" badge */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 10,
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

      {/* Visa loading spinner under laddning */}
      {loading && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}
        >
          <CircularProgress size="lg" />
          <Typography level="body-lg" sx={{ color: 'white' }}>
            Laddar PDF...
          </Typography>
        </Box>
      )}

      {/* Visa felmeddelande om PDF inte kunde laddas */}
      {error ? (
        <Box 
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            p: 4,
            color: 'white',
            textAlign: 'center'
          }}
        >
          <Typography level="title-lg" sx={{ mb: 2 }}>
            Det gick inte att visa PDF-filen
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Din webbläsare kunde inte visa PDF-filen "{filename}".
          </Typography>
          <Button
            component="a"
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="solid"
            color="primary"
            size="lg"
          >
            Öppna i nytt fönster
          </Button>
        </Box>
      ) : (
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'flex-start',
          bgcolor: 'white',
          p: 4
        }}>
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            noData={null}
            error={null}
          >
            <Page 
              pageNumber={pageNumber} 
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading={null}
              error={null}
              width={Math.min(window.innerWidth * 0.7, 800)}
            />
          </Document>
          
          {/* Grön vertikal linje till vänster */}
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
      )}
      
      {/* Navigationskontroller längst ned */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 1.5,
          px: 2,
          bgcolor: '#222',
          borderTop: '1px solid #444'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
          <IconButton
            onClick={zoomOut}
            disabled={scale <= 0.5}
            sx={{ color: 'white' }}
            size="sm"
          >
            <ZoomOutIcon />
          </IconButton>
          
          <Typography sx={{ color: 'white', mx: 2 }}>
            {Math.round(scale * 100)}%
          </Typography>
          
          <IconButton
            onClick={zoomIn}
            disabled={scale >= 3}
            sx={{ color: 'white' }}
            size="sm"
          >
            <ZoomInIcon />
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            sx={{ color: 'white' }}
            size="sm"
          >
            <ArrowBackIcon />
          </IconButton>
          
          <Typography sx={{ color: 'white', mx: 2 }}>
            Sida {pageNumber} av {numPages || '?'}
          </Typography>
          
          <IconButton
            onClick={goToNextPage}
            disabled={!numPages || pageNumber >= numPages}
            sx={{ color: 'white' }}
            size="sm"
          >
            <ArrowForwardIcon />
          </IconButton>
        </Box>
        
        <Button
          component="a"
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          size="sm"
          variant="solid"
          color="primary"
          sx={{ ml: 4 }}
        >
          Öppna i helskärm
        </Button>
      </Box>
    </Box>
  );
};

export default ReactPDFViewer;