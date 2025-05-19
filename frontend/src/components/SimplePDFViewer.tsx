import React from 'react';
import { Box, Typography, Button } from '@mui/joy';

interface SimplePDFViewerProps {
  pdfUrl: string;
  filename: string;
}

/**
 * En förenklad PDF-visare som använder iframe för bästa kompatibilitet
 */
const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ pdfUrl, filename }) => {
  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <Box sx={{ width: '100%', height: '100%' }}>
        <iframe
          src={pdfUrl}
          title={filename}
          width="100%"
          height="100%"
          style={{
            border: 'none',
            minHeight: '500px'
          }}
        />
      </Box>
    
      {/* Fallback-meddelande */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: -1,
          textAlign: 'center',
          p: 3,
          borderRadius: 'md',
          bgcolor: 'background.surface'
        }}
      >
        <Typography level="h3" sx={{ mb: 2 }}>
          Kunde inte visa PDF
        </Typography>
        <Typography sx={{ mb: 3 }}>
          Din webbläsare kunde inte visa PDF-filen direkt.
        </Typography>
        <Button
          component="a"
          href={pdfUrl}
          target="_blank"
          variant="solid"
          color="primary"
          size="lg"
        >
          Öppna i ny flik
        </Button>
      </Box>
    </Box>
  );
};

export default SimplePDFViewer;