import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';

interface FallbackPDFViewerProps {
  pdfUrl: string;
  fileName?: string;
  projectId?: string | number | null;
  onClose?: () => void;
}

/**
 * A simplified PDF viewer that uses the direct raw PDF URL 
 * and provides options for manual viewing if embedding fails
 */
const FallbackPDFViewer: React.FC<FallbackPDFViewerProps> = ({
  pdfUrl,
  fileName = 'Document',
  projectId = null,
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  React.useEffect(() => {
    // Set a timeout to assume loading failure after 5 seconds
    const timeout = setTimeout(() => {
      if (loading) {
        setError('PDF could not be loaded. Please try the direct link instead.');
      }
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [loading]);
  
  // Handle when iframe loads
  const handleLoad = () => {
    setLoading(false);
    setError(null);
  };
  
  // Handle iframe error
  const handleError = () => {
    setLoading(false);
    setError('Failed to load PDF. Try using the direct link instead.');
  };
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      width: '100%', 
      bgcolor: 'background.paper'
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: 2,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography level="h4">{fileName}</Typography>
        <Box>
          <Button 
            component="a" 
            href={pdfUrl} 
            target="_blank" 
            variant="outlined" 
            sx={{ mr: 1 }}
          >
            Open in New Tab
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="plain">
              Close
            </Button>
          )}
        </Box>
      </Box>
      
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
            bottom: 0, 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2
          }}>
            <CircularProgress />
          </Box>
        )}
        
        {error ? (
          <Box sx={{ 
            p: 3, 
            textAlign: 'center',
            color: 'danger.500'
          }}>
            <Typography level="h4">Error Loading PDF</Typography>
            <Typography>{error}</Typography>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
              <Typography level="body-sm">
                You can try the following options:
              </Typography>
              <Button 
                component="a" 
                href={pdfUrl} 
                target="_blank" 
                variant="solid" 
                color="primary"
                sx={{ width: '200px', margin: '0 auto' }}
              >
                Open PDF Directly
              </Button>
              <Button 
                onClick={() => window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}`, '_blank')}
                variant="outlined"
                sx={{ width: '200px', margin: '0 auto' }}
              >
                View in Google Docs
              </Button>
            </Box>
          </Box>
        ) : (
          <iframe
            src={pdfUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            onLoad={handleLoad}
            onError={handleError}
            title={fileName}
          />
        )}
      </Box>
    </Box>
  );
};

export default FallbackPDFViewer;