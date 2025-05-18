import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, CircularProgress, Tooltip } from '@mui/joy';

interface SimplePDFViewerProps {
  pdfUrl: string;
  filename: string;
  width?: string | number;
  height?: string | number;
}

/**
 * En PDF-visare som visar PDF direkt i applikationen
 */
const SimplePDFViewer = ({ 
  pdfUrl, 
  filename, 
  width = '100%', 
  height = '100%' 
}: SimplePDFViewerProps) => {
  const [showDebug, setShowDebug] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Testa URL-varianter
  const urlVariants = [
    pdfUrl, // Originalet först
    pdfUrl.replace('0.0.0.0:8001', window.location.host), // Ersätt 0.0.0.0 med host
    pdfUrl.replace('/api/files/web/', '/media/project_files/') // Direkt media-URL
  ];

  // När komponenten laddas, försök visa PDF direkt i iframen
  useEffect(() => {
    // Sätt en timer för att visa laddningsindikatorn i endast 2 sekunder
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [pdfUrl]);

  // Öppna PDF i nytt fönster om användaren klickar på knappen
  const openPDFInNewWindow = () => {
    window.open(pdfUrl, '_blank');
  };
  
  // Hantera framgångsrik laddning av iframe
  const handleIframeLoad = () => {
    setLoading(false);
  };
  
  // Hantera fel vid laddning av iframe
  const handleIframeError = () => {
    setPdfError(true);
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
            bgcolor: 'rgba(255,255,255,0.9)',
            zIndex: 5
          }}
        >
          <CircularProgress size="lg" sx={{ mb: 2 }} />
          <Typography level="body-sm">Laddar PDF...</Typography>
        </Box>
      )}

      {/* PDF innehåll - direktvisning med iframe */}
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Använd object-tag istället för iframe för bättre kompatibilitet med PDF */}
        <object
          ref={iframeRef as any}
          data={pdfUrl}
          type="application/pdf"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block'
          }}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        >
          <Typography level="body-md" sx={{ p: 2 }}>
            Din webbläsare kan inte visa PDF-filer direkt.
            <br />
            Använd knappen "Öppna i nytt fönster" nedan.
          </Typography>
        </object>
        
        {/* Åtgärdsfält med knappar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: '#f8f9fa'
          }}
        >
          <Typography level="body-sm" sx={{ fontWeight: 'bold', ml: 1 }}>
            {filename}
          </Typography>
          
          <Tooltip title="Öppna PDF i ett nytt fönster för bättre läsbarhet">
            <Button
              onClick={openPDFInNewWindow}
              variant="outlined"
              color="primary"
              size="sm"
            >
              Öppna i nytt fönster
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* Debug-knapp i hörnet */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 40,
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
            bottom: 70,
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
          {urlVariants.slice(1).map((url, index) => (
            <Typography key={index} level="body-xs" sx={{ wordBreak: 'break-all', mb: 1 }}>
              Variant {index+1}: {url}
            </Typography>
          ))}
          <Typography level="body-xs" sx={{ mb: 1 }}>
            Laddar: {loading ? 'Ja' : 'Nej'}
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