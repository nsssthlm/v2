import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';
import { Close as CloseIcon, ZoomIn, ZoomOut, FullscreenOutlined } from '@mui/icons-material';

interface NativePDFViewerProps {
  pdfUrl: string;
  fileName?: string;
  onClose?: () => void;
}

/**
 * A simple PDF viewer that uses the browser's native PDF support
 * via <object> tag, which has better compatibility than iframes
 */
const NativePDFViewer: React.FC<NativePDFViewerProps> = ({
  pdfUrl,
  fileName = 'Document',
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [zoom, setZoom] = useState(100);

  // Add timestamp to URL to prevent caching issues
  const pdfUrlWithTimestamp = `${pdfUrl}${pdfUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
  
  // Use effect to handle loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      // After 5 seconds, consider the PDF loaded regardless
      setLoading(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  // Zoom functions
  const zoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const zoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  
  // Open in new tab
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
        
        {/* Controls */}
        <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
          <Button 
            onClick={zoomOut} 
            variant="plain"
            size="sm"
            sx={{ minWidth: '32px', p: '2px' }}
          >
            <ZoomOut fontSize="small" />
          </Button>
          <Typography level="body-sm" sx={{ minWidth: '40px', textAlign: 'center' }}>
            {zoom}%
          </Typography>
          <Button 
            onClick={zoomIn} 
            variant="plain"
            size="sm"
            sx={{ minWidth: '32px', p: '2px' }}
          >
            <ZoomIn fontSize="small" />
          </Button>
          <Button 
            onClick={openInNewTab} 
            variant="plain"
            size="sm"
            sx={{ minWidth: '32px', p: '2px' }}
          >
            <FullscreenOutlined fontSize="small" />
          </Button>
        </Box>
        
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

      {/* PDF container */}
      <Box sx={{ 
        flex: 1, 
        position: 'relative',
        overflow: 'auto',
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

        {/* Using HTML5 object tag which has better browser compatibility for PDFs */}
        <Box sx={{ 
          height: '100%', 
          width: '100%',
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start' 
        }}>
          <object
            data={pdfUrlWithTimestamp}
            type="application/pdf"
            width={`${zoom}%`}
            height="100%"
            style={{ 
              display: 'block',
              border: 'none',
              transformOrigin: 'top center'
            }}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          >
            <Box sx={{ 
              p: 3,
              textAlign: 'center',
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Typography level="title-lg">
                Kan inte visa PDF-filen
              </Typography>
              <Typography level="body-md" sx={{ mt: 1, mb: 3 }}>
                Din webbläsare stödjer inte inbäddade PDF-filer eller så kunde filen inte laddas.
              </Typography>
              <Button 
                onClick={openInNewTab}
                variant="solid"
                color="primary"
              >
                Öppna i ny flik
              </Button>
            </Box>
          </object>
        </Box>
      </Box>
    </Box>
  );
};

export default NativePDFViewer;