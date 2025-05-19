import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Box, Typography, Button, CircularProgress, LinearProgress } from '@mui/joy';
import { 
  ZoomIn, 
  ZoomOut, 
  NavigateBefore, 
  NavigateNext, 
  FullscreenOutlined
} from '@mui/icons-material';
import axios from 'axios';

// Configure PDF.js worker with local file to avoid CORS issues
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

interface AdvancedPDFViewerProps {
  pdfUrl: string;
  fileName?: string;
  onClose?: () => void;
}

const AdvancedPDFViewer: React.FC<AdvancedPDFViewerProps> = ({
  pdfUrl,
  fileName = 'Document',
  onClose
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  // Instead of relying on URL to load the PDF, we'll fetch it first as a blob
  useEffect(() => {
    const fetchPdf = async () => {
      try {
        // Make a direct request to get the PDF
        const response = await axios.get(pdfUrl, { 
          responseType: 'blob',
          // This is important for cross-origin requests in Replit
          withCredentials: true
        });
        
        // Store the blob for rendering
        setPdfBlob(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching PDF:', err);
        setError(err instanceof Error ? err : new Error('Unknown error loading PDF'));
        setLoading(false);
      }
    };

    fetchPdf();
  }, [pdfUrl]);

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
    if (pdfBlob) {
      // Create a URL from the blob and open it
      const blobUrl = URL.createObjectURL(pdfBlob);
      window.open(blobUrl, '_blank');
    } else {
      // Fallback to the original URL if blob isn't available
      window.open(pdfUrl, '_blank');
    }
  };

  // Memo options object to prevent unnecessary reloads
  const options = React.useMemo(() => ({
    cMapUrl: '/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: '/standard_fonts/'
  }), []);

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
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            onClick={goToPrevPage} 
            variant="outlined"
            size="sm"
            disabled={pageNumber <= 1}
          >
            <NavigateBefore fontSize="small" />
          </Button>
          
          <Typography level="body-sm" sx={{ 
            minWidth: '80px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            {pageNumber} / {numPages || '...'}
          </Typography>
          
          <Button 
            onClick={goToNextPage} 
            variant="outlined"
            size="sm"
            disabled={pageNumber >= (numPages || 1)}
          >
            <NavigateNext fontSize="small" />
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button 
            onClick={zoomOut} 
            variant="plain"
            size="sm"
            disabled={scale <= 0.4}
          >
            <ZoomOut fontSize="small" />
          </Button>
          
          <Typography level="body-sm" sx={{ minWidth: '50px', textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </Typography>
          
          <Button 
            onClick={zoomIn} 
            variant="plain"
            size="sm"
            disabled={scale >= 3.0}
          >
            <ZoomIn fontSize="small" />
          </Button>
        </Box>
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
        {/* Show loading indicator */}
        {loading && (
          <Box sx={{ 
            position: 'absolute',
            top: 0, 
            left: 0,
            right: 0,
            zIndex: 10
          }}>
            <LinearProgress />
          </Box>
        )}
        
        {/* Show error state */}
        {error && !pdfBlob ? (
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
          /* Render PDF from blob if available */
          pdfBlob && (
            <Document
              file={pdfBlob}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<CircularProgress />}
              options={options}
            >
              <Box sx={{ p: 2 }}>
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  loading={
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                      <CircularProgress />
                    </Box>
                  }
                />
              </Box>
            </Document>
          )
        )}

        {/* Fallback to iframe if PDF.js fails */}
        {error && !pdfBlob && (
          <Box sx={{ width: '100%', height: '100%', display: 'none' }}>
            <iframe
              src={pdfUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title={fileName}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AdvancedPDFViewer;