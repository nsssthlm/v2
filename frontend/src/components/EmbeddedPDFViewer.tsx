import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';

interface EmbeddedPDFViewerProps {
  pdfUrl: string;
  filename: string;
  width?: string | number;
  height?: string | number;
}

/**
 * En enkel och pålitlig PDF-visare
 */
const EmbeddedPDFViewer = ({ 
  pdfUrl, 
  filename, 
  width = '100%', 
  height = '100%' 
}: EmbeddedPDFViewerProps) => {
  // State för att hantera den pågående laddningen
  const [loading, setLoading] = useState(true);
  
  // Öppna PDF i nytt fönster
  const openInNewWindow = () => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <Box
      sx={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#ffffff'
      }}
    >
      {/* Nuvarande version badge */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 10,
          bgcolor: '#6366f1',
          color: 'white',
          fontSize: '0.75rem',
          py: 0.5,
          px: 1.5,
          borderRadius: 'md',
          fontWeight: 'bold'
        }}
      >
        Nuvarande version
      </Box>

      {/* Huvudinnehåll */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3
        }}
      >
        <Typography level="h3" sx={{ mb: 2 }}>
          {filename}
        </Typography>
        
        <Typography level="body-md" sx={{ mb: 4, textAlign: 'center' }}>
          PDF-dokument finns tillgängligt.<br />
          Klicka på knappen nedan för att öppna dokumentet.
        </Typography>
        
        <Button
          onClick={openInNewWindow}
          variant="solid"
          color="primary"
          size="lg"
          sx={{ mb: 2 }}
        >
          Öppna PDF
        </Button>
      </Box>

      {/* Grön vertikal linje till vänster */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: '8px',
          backgroundColor: '#4caf50'
        }}
      />
    </Box>
  );
};

export default EmbeddedPDFViewer;