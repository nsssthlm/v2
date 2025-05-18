import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';

interface SimplePDFViewerProps {
  pdfUrl: string;
  filename: string;
  width?: string | number;
  height?: string | number;
}

/**
 * En enkel PDF-visare som använder olika metoder för att visa PDF-filer
 * med fallback-hantering om primär metod misslyckas
 */
const SimplePDFViewer = ({ 
  pdfUrl, 
  filename, 
  width = '100%', 
  height = '100%' 
}: SimplePDFViewerProps) => {
  const [loadFailed, setLoadFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Försök att identifiera om URL:en är giltig vid komponentladdning
  useEffect(() => {
    // Återställ status vid ny URL
    setLoadFailed(false);
    setLoading(true);

    // Enkel kontroll för att se om URL:en är nåbar
    const checkUrl = async () => {
      try {
        const response = await fetch(pdfUrl, { method: 'HEAD' });
        if (!response.ok) {
          console.error('PDF-URL gav felaktig statuskod:', response.status);
          setLoadFailed(true);
        }
      } catch (error) {
        console.error('Kunde inte nå PDF-URL:', error);
        setLoadFailed(false); // Vi vill fortfarande försöka visa via iframe
      } finally {
        setLoading(false);
      }
    };

    checkUrl();
  }, [pdfUrl]);

  // Hantera iframe-laddning
  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setLoadFailed(true);
    setLoading(false);
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

      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 5
          }}
        >
          <CircularProgress size="lg" />
        </Box>
      )}

      {/* PDF innehåll */}
      <Box 
        sx={{
          flex: 1, 
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {!loadFailed ? (
          <object
            data={pdfUrl}
            type="application/pdf"
            width="100%"
            height="100%"
            style={{ 
              border: 'none',
              display: 'block'
            }}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          >
            <iframe
              src={pdfUrl}
              title={filename}
              width="100%"
              height="100%"
              style={{ 
                border: 'none',
                display: 'block'
              }}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              allow="fullscreen"
            />
          </object>
        ) : (
          <Box 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%'
            }}
          >
            <Typography level="title-lg" sx={{ mb: 2 }}>
              Kunde inte visa PDF direkt
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
          </Box>
        )}
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