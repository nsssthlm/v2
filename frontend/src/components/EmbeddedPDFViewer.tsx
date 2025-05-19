import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';

interface EmbeddedPDFViewerProps {
  pdfUrl: string;
  filename: string;
  width?: string | number;
  height?: string | number;
}

/**
 * En förbättrad PDF-visare med inbäddad visning
 */
const EmbeddedPDFViewer = ({ 
  pdfUrl, 
  filename, 
  width = '100%', 
  height = '100%' 
}: EmbeddedPDFViewerProps) => {
  // State för att hantera den pågående laddningen
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fullUrl, setFullUrl] = useState<string>('');
  
  // Hantera fullständig URL för PDF-filen
  React.useEffect(() => {
    if (!pdfUrl) {
      setError(true);
      return;
    }
    
    // Kontrollera om URL:en är relativ eller absolut
    if (pdfUrl.startsWith('http')) {
      setFullUrl(pdfUrl);
    } else {
      // Om URL:en är relativ (från API) konvertera till full URL för direktvisning
      const serverBaseUrl = window.location.origin;
      console.log("Använder server URL:", serverBaseUrl);
      
      // Ersätt API-prefixet med media för att få rätt sökväg
      const mediaUrl = pdfUrl.replace('/api/files/web/', '/media/');
      const fullMediaUrl = `${serverBaseUrl}${mediaUrl}`;
      console.log("Använder full URL:", fullMediaUrl);
      setFullUrl(fullMediaUrl);
    }
    
    setLoading(false);
  }, [pdfUrl]);
  
  // Öppna PDF i nytt fönster om användaren vill det
  const openInNewWindow = () => {
    window.open(fullUrl || pdfUrl, '_blank');
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

      {error ? (
        /* Visa felmeddelande om något går fel */
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
          <Typography level="h3" sx={{ mb: 2, color: 'danger.500' }}>
            Kunde inte visa {filename}
          </Typography>
          
          <Typography level="body-md" sx={{ mb: 4, textAlign: 'center' }}>
            Det gick inte att ladda PDF-dokumentet.<br />
            Försök igen eller öppna i en ny flik.
          </Typography>
          
          <Button
            onClick={openInNewWindow}
            variant="solid"
            color="primary"
            size="lg"
            sx={{ mb: 2 }}
          >
            Öppna i ny flik
          </Button>
        </Box>
      ) : loading ? (
        /* Visa laddningsindikator */
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CircularProgress size="lg" />
          <Typography level="body-md" sx={{ mt: 2 }}>
            Laddar {filename}...
          </Typography>
        </Box>
      ) : (
        /* Visa PDF-dokumentet inbäddat */
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            p: 0,
            overflow: 'hidden',
          }}
        >
          <iframe
            src={fullUrl}
            title={filename}
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ 
              border: 'none', 
              flexGrow: 1,
              display: 'block'
            }}
          />
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            pt: 1, 
            pb: 2,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}>
            <Button
              onClick={openInNewWindow}
              variant="soft"
              color="primary"
              size="sm"
            >
              Öppna i ny flik
            </Button>
          </Box>
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

export default EmbeddedPDFViewer;