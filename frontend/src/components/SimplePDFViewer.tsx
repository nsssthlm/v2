import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';

interface SimplePDFViewerProps {
  pdfUrl: string;
  filename: string;
  width?: string | number;
  height?: string | number;
}

/**
 * En enkel PDF-visare som använder en direktlänk för att visa PDF-filer
 * med tydlig felhantering och alternativet att öppna i nytt fönster
 */
const SimplePDFViewer = ({ 
  pdfUrl, 
  filename, 
  width = '100%', 
  height = '100%' 
}: SimplePDFViewerProps) => {
  const [showDirectLink, setShowDirectLink] = useState(true);

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
      {/* "Nuvarande version" badge */}
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

      {/* PDF innehåll */}
      <Box 
        sx={{
          flex: 1, 
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 3
        }}
      >
        <Box 
          sx={{ 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%'
          }}
        >
          <Typography level="title-lg" sx={{ mb: 2 }}>
            {filename}
          </Typography>
          
          <Typography level="body-md" sx={{ mb: 4 }}>
            För att visa detta PDF-dokument, använd knappen nedan.
          </Typography>
          
          <Button
            component="a"
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="solid"
            color="primary"
            size="lg"
            sx={{ mb: 2 }}
          >
            Öppna PDF i nytt fönster
          </Button>
          
          {/* Debug information */}
          <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 'md', maxWidth: '100%', overflow: 'hidden' }}>
            <Typography level="body-sm" sx={{ fontWeight: 'bold', mb: 1 }}>
              Debug information (för utvecklare):
            </Typography>
            <Typography level="body-xs" sx={{ wordBreak: 'break-all', mb: 1 }}>
              PDF URL: {pdfUrl}
            </Typography>
            <Typography level="body-xs" sx={{ mb: 1 }}>
              Filnamn: {filename}
            </Typography>
            <Typography level="body-xs" sx={{ mb: 1 }}>
              Origin: {window.location.origin}
            </Typography>
          </Box>
        </Box>
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

export default SimplePDFViewer;