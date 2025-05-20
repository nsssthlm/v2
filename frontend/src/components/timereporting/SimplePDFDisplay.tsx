import React from 'react';
import { Box, Typography, Button, Stack, CircularProgress } from '@mui/joy';
import { OpenInNew, Download } from '@mui/icons-material';

interface SimplePDFDisplayProps {
  pdfUrl: string;
  filename: string;
  onDownload: () => void;
  onOpenInNewTab: () => void;
}

/**
 * En enkel PDF-visare som använder iframe-elementet för att visa PDF-dokument.
 * Den har också knappar för nedladdning och att öppna i ny flik som fallback.
 */
const SimplePDFDisplay: React.FC<SimplePDFDisplayProps> = ({
  pdfUrl,
  filename,
  onDownload,
  onOpenInNewTab
}) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      // Kontrollera om iframe har laddat korrekt
      if (iframeRef.current) {
        try {
          // Ett försök att komma åt iframe-innehållet, vilket kan misslyckas om PDF inte visas
          const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
          if (!iframeDoc || iframeDoc.body.innerHTML === '') {
            setError(true);
          }
        } catch (e) {
          console.error('Fel vid åtkomst av iframe innehåll:', e);
          setError(true);
        }
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [pdfUrl]);

  return (
    <Box sx={{ 
      height: '100%', 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'relative'
    }}>
      {loading && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 10
          }}
        >
          <CircularProgress />
        </Box>
      )}
      
      {error ? (
        <Box 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            p: 4
          }}
        >
          <Typography level="h3" sx={{ mb: 2 }}>
            Det gick inte att visa PDF direkt
          </Typography>
          <Typography sx={{ mb: 4, textAlign: 'center' }}>
            PDF-filen "{filename}" kunde inte visas direkt i visaren på grund av säkerhetsinställningar i webbläsaren. 
            Du kan öppna den i en ny flik eller ladda ner den istället.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="solid"
              color="primary"
              size="lg"
              startDecorator={<OpenInNew />}
              onClick={onOpenInNewTab}
            >
              Öppna i ny flik
            </Button>
            <Button
              variant="outlined"
              color="neutral"
              size="lg"
              startDecorator={<Download />}
              onClick={onDownload}
            >
              Ladda ner
            </Button>
          </Stack>
        </Box>
      ) : (
        <>
          <Box 
            component="iframe"
            ref={iframeRef}
            src={pdfUrl}
            title={filename}
            sx={{ 
              flexGrow: 1, 
              border: 'none', 
              width: '100%',
              bgcolor: 'background.body'
            }}
            onError={() => setError(true)}
          />
          
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="solid"
                color="primary"
                startDecorator={<OpenInNew />}
                onClick={onOpenInNewTab}
              >
                Öppna i ny flik
              </Button>
              <Button
                variant="outlined"
                color="neutral"
                startDecorator={<Download />}
                onClick={onDownload}
              >
                Ladda ner
              </Button>
            </Stack>
          </Box>
        </>
      )}
    </Box>
  );
};

export default SimplePDFDisplay;