import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, LinearProgress } from '@mui/joy';
import { Close as CloseIcon, ZoomIn, ZoomOut, FullscreenOutlined } from '@mui/icons-material';

interface BasicEmbeddedPDFViewerProps {
  pdfUrl: string;
  fileName?: string;
  onClose?: () => void;
}

/**
 * A basic PDF viewer that directly embeds the PDF in an iframe or object tag
 * with fallbacks if direct embedding doesn't work
 */
const BasicEmbeddedPDFViewer: React.FC<BasicEmbeddedPDFViewerProps> = ({
  pdfUrl,
  fileName = 'Document',
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [zoom, setZoom] = useState(100);

  // Attempt to load the PDF
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        // After 5 seconds, if still loading, assume there might be an issue
        // but don't show error yet
        console.log('PDF is taking a long time to load');
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [loading]);

  // Handle iframe load success
  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  // Handle iframe load error
  const handleError = () => {
    setLoading(false);
    setError(true);
    console.error('Failed to load PDF:', pdfUrl);
  };

  // Zoom in/out functions
  const zoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const zoomOut = () => setZoom(prev => Math.max(prev - 25, 50));

  // Open PDF in fullscreen
  const openFullscreen = () => {
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
        
        {/* Zoom controls */}
        <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
          <Button 
            onClick={zoomOut} 
            variant="plain"
            size="sm"
            disabled={zoom <= 50}
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
            disabled={zoom >= 200}
            sx={{ minWidth: '32px', p: '2px' }}
          >
            <ZoomIn fontSize="small" />
          </Button>
          <Button 
            onClick={openFullscreen} 
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

      {/* PDF display area */}
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
              Kunde inte visa PDF
            </Typography>
            <Typography level="body-md" sx={{ mb: 2 }}>
              Det gick inte att visa dokumentet direkt i applikationen.
            </Typography>
            <Button 
              onClick={() => window.open(pdfUrl, '_blank')}
              variant="solid"
              color="primary"
            >
              Öppna PDF i ny flik
            </Button>
          </Box>
        ) : (
          <Box sx={{ 
            height: '100%', 
            width: '100%', 
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Try embedding with iframe first */}
            <iframe
              src={pdfUrl}
              style={{
                width: `${zoom}%`,
                height: `${zoom}%`,
                border: 'none',
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0
              }}
              onLoad={handleLoad}
              onError={handleError}
              title={fileName}
              sandbox="allow-scripts allow-same-origin"
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default BasicEmbeddedPDFViewer;