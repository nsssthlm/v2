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
  
  // Create direct link to backend by removing the Replit proxy parts
  const getDirectUrl = (url: string): string => {
    // Get the part of the URL after /data/
    const match = url.match(/\/data\/(.+)$/);
    if (match && match[1]) {
      return `/api/files/get/${match[1]}`;
    }
    
    // Fallback: try to extract just the filename and use a direct endpoint
    const fileNameMatch = url.match(/([^\/]+\.pdf)(\?|$)/);
    if (fileNameMatch) {
      return `/api/files/direct/${fileNameMatch[1]}`;
    }
    
    // If all else fails, return the original URL
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