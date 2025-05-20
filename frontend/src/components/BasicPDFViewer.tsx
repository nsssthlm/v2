import React from 'react';
import { Box, Button, Typography } from '@mui/joy';

interface BasicPDFViewerProps {
  pdfUrl: string;
  title?: string;
}

/**
 * En mycket enkel PDF-visningskomponent utan några säkerhetsbegränsningar
 */
const BasicPDFViewer: React.FC<BasicPDFViewerProps> = ({ pdfUrl, title }) => {
  if (!pdfUrl) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        border: '1px solid #ccc'
      }}>
        <Typography>Ingen PDF vald</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      {title && (
        <Typography level="title-lg" sx={{ mb: 1 }}>
          {title}
        </Typography>
      )}
      
      <Box 
        component="iframe" 
        src={pdfUrl}
        sx={{ 
          width: '100%', 
          height: title ? 'calc(100% - 40px)' : '100%', 
          border: 'none'
        }}
      />
      
      <Button
        variant="outlined"
        color="primary"
        onClick={() => window.open(pdfUrl, '_blank')}
        sx={{ position: 'absolute', bottom: 10, right: 10, zIndex: 1000 }}
      >
        Öppna i nytt fönster
      </Button>
    </Box>
  );
};

export default BasicPDFViewer;