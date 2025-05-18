import React from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/joy';

interface BasicPDFViewerProps {
  pdfUrl: string;
  filename: string;
}

/**
 * En extremt enkel PDF-visare baserad på iframe för maximal kompatibilitet
 */
const BasicPDFViewer: React.FC<BasicPDFViewerProps> = ({ pdfUrl, filename }) => {
  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* PDF-innehållet i iframe */}
      <Box sx={{ 
        flex: 1, 
        position: 'relative',
        '& iframe': {
          width: '100%',
          height: '100%',
          border: 'none'
        }
      }}>
        <iframe 
          src={pdfUrl} 
          title={filename}
          sandbox="allow-same-origin allow-scripts allow-forms"
          allow="fullscreen"
        />
      </Box>
      
      {/* Nedre kontrollfält */}
      <Box sx={{ 
        p: 1.5, 
        display: 'flex', 
        justifyContent: 'center',
        borderTop: '1px solid #e0e0e0',
        bgcolor: '#f5f5f5'
      }}>
        <Button
          variant="solid"
          color="primary"
          component="a"
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ 
            bgcolor: '#4caf50', 
            '&:hover': { 
              bgcolor: '#3d8b40' 
            }
          }}
        >
          Öppna i ny flik
        </Button>
      </Box>
    </Box>
  );
};

export default BasicPDFViewer;