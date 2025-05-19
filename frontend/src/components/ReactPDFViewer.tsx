import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Box, Typography, Button, CircularProgress, ButtonGroup } from '@mui/joy';
import { 
  ZoomIn, 
  ZoomOut, 
  NavigateBefore, 
  NavigateNext, 
  FullscreenExitOutlined,
  FullscreenOutlined
} from '@mui/icons-material';

// Set up worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface ReactPDFViewerProps {
  pdfUrl: string;
  fileName?: string;
  onClose?: () => void;
}

const ReactPDFViewer: React.FC<ReactPDFViewerProps> = ({ 
  pdfUrl, 
  fileName = 'Document',
  onClose 
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Functions to handle document loading
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError(error);
    setLoading(false);
  };

  // Navigation functions
  const goToPrevPage = () => {
    setPageNumber(page => Math.max(page - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(page => Math.min(page + 1, numPages || 1));
  };

  // Zoom functions
  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.4));
  };

  // Function to open PDF in a new tab
  const openInNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      width: '100%', 
      bgcolor: 'background.paper',
      borderRadius: 'md',
      overflow: 'hidden'
    }}>
      {/* Header with filename and controls */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 1,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography level="title-md" sx={{ 
          flexGrow: 1, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {fileName}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            onClick={openInNewTab} 
            variant="outlined"
            size="sm"
            startDecorator={<FullscreenOutlined fontSize="small" />}
          >
            Öppna i ny flik
          </Button>
          
          {onClose && (
            <Button 
              onClick={onClose} 
              variant="plain"
              size="sm"
            >
              Stäng
            </Button>
          )}
        </Box>
      </Box>

      {/* Controls for navigation and zoom */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        gap: 2
      }}>
        <ButtonGroup size="sm" variant="outlined">
          <Button 
            onClick={goToPrevPage} 
            disabled={pageNumber <= 1}
          >
            <NavigateBefore />
          </Button>
          <Button 
            onClick={goToNextPage} 
            disabled={pageNumber >= (numPages || 1)}
          >
            <NavigateNext />
          </Button>
        </ButtonGroup>
        
        <Typography level="body-sm">
          Sida {pageNumber} av {numPages || '...'}
        </Typography>
        
        <ButtonGroup size="sm" variant="outlined">
          <Button onClick={zoomOut} disabled={scale <= 0.4}>
            <ZoomOut />
          </Button>
          <Button sx={{ minWidth: '64px' }}>
            {Math.round(scale * 100)}%
          </Button>
          <Button onClick={zoomIn} disabled={scale >= 3.0}>
            <ZoomIn />
          </Button>
        </ButtonGroup>
      </Box>

      {/* PDF document */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
        bgcolor: 'grey.100',
        position: 'relative'
      }}>
        {loading && (
          <Box sx={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10
          }}>
            <CircularProgress />
          </Box>
        )}
        
        {error ? (
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            p: 3,
            gap: 2
          }}>
            <Typography level="title-lg" color="danger">
              Kunde inte ladda PDF
            </Typography>
            <Typography level="body-md" sx={{ mb: 2 }}>
              Det gick inte att visa dokumentet direkt i applikationen.
            </Typography>
            <Button 
              onClick={openInNewTab}
              variant="solid"
              color="primary"
              size="lg"
              startDecorator={<FullscreenOutlined />}
            >
              Öppna i ny flik
            </Button>
          </Box>
        ) : (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<CircularProgress />}
            options={{
              cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
              cMapPacked: true,
            }}
          >
            <Box sx={{ p: 2 }}>
              <Page 
                pageNumber={pageNumber} 
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Box>
          </Document>
        )}
      </Box>
    </Box>
  );
};

export default ReactPDFViewer;