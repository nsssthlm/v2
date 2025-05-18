import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';

interface SimplePDFViewerProps {
  pdfUrl: string;
  filename: string;
  width?: string | number;
  height?: string | number;
}

/**
 * En enkel PDF-visare som använder inbäddad iframe för att visa PDF-filer
 */
const SimplePDFViewer = ({ 
  pdfUrl, 
  filename, 
  width = '100%', 
  height = '100%' 
}: SimplePDFViewerProps) => {
  const [showDirectLink, setShowDirectLink] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  // Försök att visa direkt med iframe, använd direkt länk som reserv
  useEffect(() => {
    // Sätt en timer för att avgöra om iFrame laddas korrekt eller inte
    const timer = setTimeout(() => {
      if (!iframeLoaded) {
        setShowDirectLink(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [iframeLoaded]);

  // Hanterare för när iFrame laddas
  const handleIframeLoad = () => {
    setIframeLoaded(true);
  };

  // Hanterare för när iFrame får fel
  const handleIframeError = () => {
    setIframeError(true);
    setShowDirectLink(true);
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

      {/* PDF innehåll */}
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Direkt inbäddad PDF via iframe - enklaste och mest pålitliga metoden */}
        <iframe
          src={pdfUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: showDirectLink ? 'none' : 'block'
          }}
          title={filename}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />

        {/* Visa en direktlänk om iframe inte fungerar */}
        {showDirectLink && (
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
              {filename}
            </Typography>

            <Typography level="body-md" sx={{ mb: 4 }}>
              PDF-filen kunde inte visas direkt i appen. Använd knappen nedan för att öppna den.
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

      {/* Debug-knapp i hörnet */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          zIndex: 10
        }}
      >
        <Button
          variant="plain"
          color="neutral"
          size="sm"
          onClick={() => setShowDebug(prev => !prev)}
        >
          {showDebug ? 'Dölj info' : 'Visa debug info'}
        </Button>
      </Box>

      {/* Debug information */}
      {showDebug && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 40,
            right: 8,
            width: 300,
            p: 2,
            bgcolor: '#f5f5f5',
            borderRadius: 'md',
            maxWidth: '100%',
            overflow: 'hidden',
            zIndex: 10,
            boxShadow: 'sm'
          }}
        >
          <Typography level="body-sm" sx={{ fontWeight: 'bold', mb: 1 }}>
            Debug information:
          </Typography>
          <Typography level="body-xs" sx={{ wordBreak: 'break-all', mb: 1 }}>
            PDF URL: {pdfUrl}
          </Typography>
          <Typography level="body-xs" sx={{ mb: 1 }}>
            iFrame laddad: {iframeLoaded ? 'Ja' : 'Nej'}
          </Typography>
          <Typography level="body-xs" sx={{ mb: 1 }}>
            iFrame fel: {iframeError ? 'Ja' : 'Nej'}
          </Typography>
          <Typography level="body-xs" sx={{ mb: 1 }}>
            Visar direktlänk: {showDirectLink ? 'Ja' : 'Nej'}
          </Typography>
          <Typography level="body-xs" sx={{ mb: 1 }}>
            Origin: {window.location.origin}
          </Typography>
        </Box>
      )}

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