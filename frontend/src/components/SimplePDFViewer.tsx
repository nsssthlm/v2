import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';

interface SimplePDFViewerProps {
  pdfUrl: string;
  filename: string;
  width?: string | number;
  height?: string | number;
}

/**
 * En enkel PDF-visare som använder Google Docs Viewer för att visa PDF-filer direkt
 * med fallback till direktlänk om inbäddningen inte fungerar
 */
const SimplePDFViewer = ({ 
  pdfUrl, 
  filename, 
  width = '100%', 
  height = '100%' 
}: SimplePDFViewerProps) => {
  const [loading, setLoading] = useState(true);
  const [embedFailed, setEmbedFailed] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
  // Skapa en Google Docs Viewer URL för PDF-visning
  // Detta bäddar in PDF via Google's tjänst vilket fungerar i alla webbläsare
  const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
  
  // När visaren laddas, dölj laddningsanimationen
  const handleIframeLoad = () => {
    setLoading(false);
  };
  
  // Vid fel med iframe, visa direktlänken istället
  const handleIframeError = () => {
    setEmbedFailed(true);
    setLoading(false);
  };
  
  // Sätt en timer för att kontrollera om laddningen tar för lång tid
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 5000); // 5 sekunders timeout
    
    return () => clearTimeout(timer);
  }, [loading]);

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

      {/* Laddningsindikator */}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            zIndex: 5
          }}
        >
          <CircularProgress size="lg" sx={{ mb: 2 }} />
          <Typography level="body-sm">Laddar PDF...</Typography>
        </Box>
      )}

      {/* PDF innehåll */}
      <Box 
        sx={{
          flex: 1, 
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {!embedFailed ? (
          <iframe
            src={googleDocsViewerUrl}
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
              {filename}
            </Typography>
            
            <Typography level="body-md" sx={{ mb: 4 }}>
              PDF-visaren kunde inte bädda in denna fil direkt.
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
            Google Viewer URL: {googleDocsViewerUrl.substring(0, 50)}...
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