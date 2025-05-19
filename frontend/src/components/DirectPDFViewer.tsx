import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';

interface DirectPDFViewerProps {
  pdfUrl: string;
  fileName?: string;
  projectId?: string | number | null;
  onClose?: () => void;
}

const DirectPDFViewer: React.FC<DirectPDFViewerProps> = ({
  pdfUrl,
  fileName = 'Document',
  projectId = null,
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  
  // Instead of trying to modify the URL, we'll use the "Open in new tab" approach
  // This preserves the original URL which seems to be the only one that works
  const getDirectUrl = (url: string): string => {
    // For Replit environment, use the direct URL that was passed
    // We need to convert the URL from proxy format to direct format
    
    // Extract the original backend URL without the Replit proxy part
    if (url.includes('proxy/3000/api')) {
      const originalUrl = url.split('proxy/3000')[1];
      console.log('Original URL extracted:', originalUrl);
      
      // If the URL is for the API, return it as is
      return originalUrl;
    }
    
    // Just return the original URL if we can't transform it
    return url;
  };
  
  // Get a direct backend URL
  const directUrl = getDirectUrl(pdfUrl);
  console.log('Using direct backend URL:', directUrl);
  
  // Handle when iframe loads
  const handleLoad = () => {
    setLoading(false);
  };
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      width: '100%' 
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
            href={directUrl} 
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
        
        <iframe
          src={directUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          onLoad={handleLoad}
          title={fileName}
        />
      </Box>
    </Box>
  );
};

export default DirectPDFViewer;