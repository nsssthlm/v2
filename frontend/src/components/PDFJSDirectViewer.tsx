import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, CircularProgress, LinearProgress } from '@mui/joy';
import { Close as CloseIcon, ZoomIn, ZoomOut, FullscreenOutlined, 
        NavigateBefore, NavigateNext } from '@mui/icons-material';

interface PDFJSDirectViewerProps {
  pdfUrl: string;
  fileName?: string;
  onClose?: () => void;
}

/**
 * PDFJSDirectViewer - Renders a PDF using a direct iframe to the PDF
 * with a backup approach that opens it in a new window if embedding fails
 */
const PDFJSDirectViewer: React.FC<PDFJSDirectViewerProps> = ({
  pdfUrl,
  fileName = 'Document',
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Set a timeout to detect loading failures
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log('PDF is taking too long to load, preparing fallback option');
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [loading]);
  
  // Handle successful loading
  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };
  
  // Handle loading error
  const handleError = () => {
    setLoading(false);
    setError(true);
    console.error('Failed to load PDF in iframe');
  };
  
  // Open PDF in a new window
  const openInNewWindow = () => {
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
      {/* Header with controls */}
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
            onClick={openInNewWindow} 
            variant="outlined"
            size="sm"
            startDecorator={<FullscreenOutlined fontSize="small" />}
          >
            Öppna i ny flik
          </Button>
          
          {onClose && (
            <Button 
              startDecorator={<CloseIcon />}
              onClick={onClose} 
              variant="plain"
              size="sm"
            >
              Stäng
            </Button>
          )}
        </Box>
      </Box>

      {/* PDF viewer area */}
      <Box sx={{ 
        flex: 1, 
        position: 'relative',
        overflow: 'hidden'
      }}>
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

        {/* First attempt: Direct iframe to the PDF */}
        {!error ? (
          <iframe
            ref={iframeRef}
            src={pdfUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            onLoad={handleLoad}
            onError={handleError}
            title={fileName}
            sandbox="allow-same-origin allow-scripts"
          />
        ) : (
          // Show error and fallback options
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
              Kan inte visa PDF-filen
            </Typography>
            <Typography level="body-md" sx={{ mb: 2 }}>
              Det gick inte att visa dokumentet direkt i applikationen.
            </Typography>
            <Button 
              onClick={openInNewWindow}
              variant="solid"
              color="primary"
              size="lg"
              startDecorator={<FullscreenOutlined />}
            >
              Öppna i ny flik
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PDFJSDirectViewer;