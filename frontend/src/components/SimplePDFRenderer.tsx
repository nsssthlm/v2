import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';
import { ZoomIn, ZoomOut, OpenInNew } from '@mui/icons-material';

interface SimplePDFRendererProps {
  pdfUrl: string;
  fileName?: string;
  onClose?: () => void;
}

/**
 * A very simple PDF viewer that uses a direct iframe to display the PDF
 * with minimal controls and fallback options
 */
const SimplePDFRenderer: React.FC<SimplePDFRendererProps> = ({
  pdfUrl,
  fileName = 'Document',
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [scale, setScale] = useState(100);

  // Handle iframe load
  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  // Handle iframe error
  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  // Open PDF in a new tab
  const openInNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  // Simple zoom controls
  const zoomIn = () => setScale(prev => Math.min(prev + 10, 200));
  const zoomOut = () => setScale(prev => Math.max(prev - 10, 50));

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      width: '100%', 
      bgcolor: 'background.paper',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Header */}
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
        
        {/* Simple controls */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button 
            onClick={zoomOut} 
            variant="plain"
            size="sm"
            disabled={scale <= 50}
          >
            <ZoomOut fontSize="small" />
          </Button>
          
          <Typography level="body-sm" sx={{ minWidth: '40px', textAlign: 'center' }}>
            {scale}%
          </Typography>
          
          <Button 
            onClick={zoomIn} 
            variant="plain"
            size="sm"
            disabled={scale >= 200}
          >
            <ZoomIn fontSize="small" />
          </Button>
          
          <Button 
            onClick={openInNewTab}
            variant="outlined"
            size="sm"
            startDecorator={<OpenInNew fontSize="small" />}
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

      {/* PDF content */}
      <Box sx={{ 
        flex: 1, 
        position: 'relative',
        overflow: 'auto'
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
              Kunde inte visa PDF
            </Typography>
            <Typography level="body-md" sx={{ mb: 2 }}>
              Det gick inte att visa dokumentet direkt i applikationen.
            </Typography>
            <Button 
              onClick={openInNewTab}
              variant="solid"
              color="primary"
              startDecorator={<OpenInNew />}
            >
              Öppna i ny flik
            </Button>
          </Box>
        ) : (
          <Box 
            sx={{ 
              height: '100%', 
              width: '100%',
              overflow: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start'
            }}
          >
            <iframe
              src={pdfUrl}
              style={{
                width: `${scale}%`,
                height: `${scale}%`,
                border: 'none',
                transformOrigin: 'top center',
                backgroundColor: '#f5f5f5'
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

export default SimplePDFRenderer;