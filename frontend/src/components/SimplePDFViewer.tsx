import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';

interface SimplePDFViewerProps {
  pdfUrl: string;
  filename: string;
  width?: string | number;
  height?: string | number;
}

/**
 * En enkel PDF-visare som använder direkt länkning för att visa PDF-filer
 */
const SimplePDFViewer = ({ 
  pdfUrl, 
  filename, 
  width = '100%', 
  height = '100%' 
}: SimplePDFViewerProps) => {
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

      {/* PDF iframe */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <object
          data={pdfUrl}
          type="application/pdf"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        >
          <Box 
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              p: 4,
              textAlign: 'center'
            }}
          >
            <Typography level="title-lg" sx={{ mb: 2 }}>
              Det gick inte att visa PDF-filen
            </Typography>
            <Typography sx={{ mb: 2 }}>
              Din webbläsare kunde inte visa PDF-filen "{filename}".
            </Typography>
            <Button
              component="a"
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="solid"
              color="primary"
              size="lg"
            >
              Öppna i nytt fönster
            </Button>
          </Box>
        </object>
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