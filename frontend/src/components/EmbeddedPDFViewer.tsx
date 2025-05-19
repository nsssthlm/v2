import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';

interface EmbeddedPDFViewerProps {
  pdfUrl: string;
  filename: string;
  width?: string | number;
  height?: string | number;
}

/**
 * En förbättrad PDF-visare med direkt visning av PDF-innehåll
 */
const EmbeddedPDFViewer = ({ 
  pdfUrl, 
  filename, 
  width = '100%', 
  height = '100%' 
}: EmbeddedPDFViewerProps) => {
  // State för att hantera den pågående laddningen och visning
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fullUrl, setFullUrl] = useState<string>('');
  const [showDirectView, setShowDirectView] = useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  
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
      try {
        // Om det är en API URL, använd den direkt för att se PDF:en
        setFullUrl(pdfUrl);
        console.log("Använder API URL direkt:", pdfUrl);
      } catch (err) {
        console.error("Kunde inte formatera PDF URL:", err);
        setError(true);
      }
    }
    
    setLoading(false);
  }, [pdfUrl]);
  
  // Växla mellan förhandsvisning och direkt visning
  const toggleDirectView = () => {
    setShowDirectView(!showDirectView);
  };
  
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

      {/* Visa antingen direkt PDF-visning eller förhandsvisningsinfo */}
      {showDirectView ? (
        /* Direktvisning av PDF */
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            p: 0,
            width: '100%',
            height: '100%',
            position: 'relative'
          }}
        >
          <iframe 
            src={`${pdfUrl}#view=FitH&toolbar=1&navpanes=1`}
            title={filename}
            width="100%"
            height="100%"
            style={{
              border: 'none',
              flexGrow: 1,
              minHeight: '500px'
            }}
            ref={iframeRef}
          />
          
          <Box sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 100
          }}>
            <Button
              onClick={toggleDirectView}
              variant="solid"
              color="neutral"
              size="sm"
              sx={{ px: 2, py: 0.5 }}
            >
              Tillbaka till förhandsvisning
            </Button>
          </Box>
        </Box>
      ) : (
        /* Förhandsvisning med info om dokumentet */
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
          <Box sx={{ 
            width: '70%', 
            maxWidth: '400px', 
            mb: 3,
            p: 3,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 'md',
            bgcolor: 'background.surface'
          }}>
            <Typography level="h3" sx={{ mb: 2, textAlign: 'center' }}>
              {filename}
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: 'success.300'
                }} />
                <Typography level="body-sm">PDF-dokument tillgängligt</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: 'primary.300'
                }} />
                <Typography level="body-sm">Senaste versionen</Typography>
              </Box>
            </Box>
            
            <Typography level="body-md" sx={{ mb: 3, textAlign: 'center' }}>
              Detta PDF-dokument kan visas direkt i webbläsaren.
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                onClick={toggleDirectView}
                variant="solid"
                color="primary"
                size="lg"
                sx={{ px: 4 }}
              >
                Visa dokument
              </Button>
              
              <Button
                onClick={openInNewWindow}
                variant="outlined"
                color="neutral"
                size="lg"
              >
                Öppna i ny flik
              </Button>
            </Box>
          </Box>
          
          {/* Miniatyrvisning av PDF (simulerad) */}
          <Box sx={{ 
            width: '200px', 
            height: '260px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 'md',
            bgcolor: 'background.surface',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer'
          }}
          onClick={toggleDirectView}
          >
            <Typography level="body-sm" sx={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              color: 'text.tertiary',
              fontWeight: 'bold'
            }}>
              PDF Förhandsgranskning
            </Typography>
            
            {/* Simulerad PDF-sida */}
            <Box sx={{ 
              width: '90%', 
              height: '90%',
              display: 'flex',
              flexDirection: 'column',
              p: 1,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'sm',
              bgcolor: '#fff'
            }}>
              {/* Simulera lite innehåll */}
              <Box sx={{ width: '80%', height: 8, mb: 1, bgcolor: '#ddd', borderRadius: 'sm' }} />
              <Box sx={{ width: '90%', height: 6, mb: 1, bgcolor: '#ddd', borderRadius: 'sm' }} />
              <Box sx={{ width: '70%', height: 6, mb: 2, bgcolor: '#ddd', borderRadius: 'sm' }} />
              <Box sx={{ width: '85%', height: 6, mb: 1, bgcolor: '#ddd', borderRadius: 'sm' }} />
              <Box sx={{ width: '75%', height: 6, mb: 2, bgcolor: '#ddd', borderRadius: 'sm' }} />
              <Box sx={{ width: '90%', height: 6, mb: 1, bgcolor: '#ddd', borderRadius: 'sm' }} />
              <Box sx={{ width: '60%', height: 6, mb: 2, bgcolor: '#ddd', borderRadius: 'sm' }} />
              <Box sx={{ width: '80%', height: 6, bgcolor: '#ddd', borderRadius: 'sm' }} />
            </Box>
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