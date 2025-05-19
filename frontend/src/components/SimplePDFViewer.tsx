import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';
import { FullscreenOutlined, Refresh } from '@mui/icons-material';
import axios from 'axios';

interface SimplePDFViewerProps {
  pdfUrl: string;
  fileName?: string;
  onClose?: () => void;
}

/**
 * A very simple PDF viewer that uses an iframe with direct URL
 * This removes all the complexity and works reliably in most browsers
 */
const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({
  pdfUrl,
  fileName = 'Document',
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if URL is valid
  useEffect(() => {
    const checkUrl = async () => {
      try {
        await axios.head(pdfUrl, { 
          withCredentials: true 
        });
        setLoading(false);
      } catch (err) {
        console.error('Error checking PDF URL:', err);
        setError('Could not access the PDF file');
        setLoading(false);
      }
    };
    
    checkUrl();
  }, [pdfUrl]);

  // Function to retry loading
  const retryLoading = () => {
    setError(null);
    setLoading(true);
    
    const checkUrl = async () => {
      try {
        await axios.head(pdfUrl, { 
          withCredentials: true 
        });
        setLoading(false);
      } catch (err) {
        console.error('Error checking PDF URL:', err);
        setError('Could not access the PDF file');
        setLoading(false);
      }
    };
    
    checkUrl();
  };

  // Open in new tab function
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
      borderRadius: 'sm',
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
            onClick={retryLoading} 
            variant="outlined"
            size="sm"
            startDecorator={<Refresh fontSize="small" />}
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
            transform: 'translate(-50%, -50%)'
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
        
        {!error && !loading && (
          <iframe 
            src={pdfUrl} 
            width="100%" 
            height="100%" 
            style={{ border: 'none' }}
            title={fileName}
          />
        )}
      </Box>
    </Box>
  );
};

export default SimplePDFViewer;