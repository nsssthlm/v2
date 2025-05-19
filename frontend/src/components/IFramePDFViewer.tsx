import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';
import { FullscreenOutlined } from '@mui/icons-material';
import axios from 'axios';

interface IFramePDFViewerProps {
  pdfUrl: string;
  fileName?: string;
  onClose?: () => void;
}

/**
 * A PDF viewer that uses an iframe to display PDFs
 * This approach works better with cross-origin policies
 */
const IFramePDFViewer: React.FC<IFramePDFViewerProps> = ({
  pdfUrl,
  fileName = 'Document',
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(Date.now());
  
  // Function to validate URL before trying to display it
  useEffect(() => {
    const checkUrl = async () => {
      try {
        // Just check if the URL is accessible, don't download the whole file
        await axios.head(pdfUrl, { withCredentials: true });
        setLoading(false);
      } catch (err) {
        console.error('Error accessing PDF URL:', err);
        setError('Could not access the PDF file. It may be blocked by CORS policy or not exist.');
        setLoading(false);
      }
    };
    
    checkUrl();
  }, [pdfUrl]);

  // Open in new tab function
  const openInNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  // Function to reload the iframe
  const reloadIframe = () => {
    setLoading(true);
    setError(null);
    setIframeKey(Date.now()); // This forces the iframe to reload
    setTimeout(() => setLoading(false), 1000); // Give it time to load
  };

  // Split into base and query parameters to avoid CORS issues
  const fixUrl = (url: string) => {
    try {
      // For URLs with proxies or special patterns for Replit
      if (url.includes('/proxy/')) {
        return url;
      }
      
      // For direct backend URLs
      if (url.startsWith('http://0.0.0.0')) {
        // Replace local IP with domain name
        const hostname = window.location.hostname;
        return url.replace('http://0.0.0.0:8001', `https://${hostname}/api`);
      }
      
      return url;
    } catch (e) {
      console.error('Error processing URL:', e);
      return url;
    }
  };

  const finalUrl = fixUrl(pdfUrl);
  console.log('Using iFrame with URL:', finalUrl);

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
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            onClick={openInNewTab} 
            variant="outlined"
            size="sm"
            startDecorator={<FullscreenOutlined fontSize="small" />}
          >
            Öppna i ny flik
          </Button>
          
          <Button 
            onClick={reloadIframe} 
            variant="outlined"
            size="sm"
          >
            Ladda om
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

      {/* PDF Viewer Area */}
      <Box sx={{ 
        flex: 1, 
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'grey.100'
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
        
        {error && (
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
              {error || 'Det gick inte att visa dokumentet direkt i applikationen.'}
            </Typography>
            <Button 
              onClick={openInNewTab}
              variant="solid"
              color="primary"
              startDecorator={<FullscreenOutlined />}
            >
              Öppna i ny flik
            </Button>
          </Box>
        )}
        
        {!error && (
          <iframe
            key={iframeKey}
            src={finalUrl}
            style={{ 
              width: '100%', 
              height: '100%', 
              border: 'none',
              display: 'block'
            }}
            title={fileName}
            sandbox="allow-same-origin allow-scripts allow-forms"
            onLoad={() => setLoading(false)}
            onError={() => {
              setError('Failed to load PDF in iframe');
              setLoading(false);
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default IFramePDFViewer;