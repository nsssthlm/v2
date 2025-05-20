import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, Button, Stack } from '@mui/joy';
import { OpenInNew } from '@mui/icons-material';

interface EmbeddedPDFViewerProps {
  pdfUrl: string;
  height?: string | number;
  width?: string | number;
}

/**
 * En komponent som visar PDF direkt i dialogrutan,
 * med flera olika metoder för att säkerställa kompatibilitet
 * med olika webbläsare och miljöer.
 */
const EmbeddedPDFViewer: React.FC<EmbeddedPDFViewerProps> = ({
  pdfUrl,
  height = '100%',
  width = '100%'
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Kontrollera om URL:en är giltig
    const checkUrl = async () => {
      try {
        // Säkerställ att vi har en URL att arbeta med
        if (!pdfUrl) {
          setError(true);
          setLoading(false);
          return;
        }

        // Vänta lite innan vi döljer laddningsindikatorn
        // för att säkerställa att PDF:en har tid att laddas
        const timer = setTimeout(() => {
          setLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
      } catch (err) {
        console.error('Fel vid laddning av PDF:', err);
        setError(true);
        setLoading(false);
      }
    };

    checkUrl();
  }, [pdfUrl]);

  // Om det uppstår ett fel, visa ett felmeddelande och en knapp för att öppna i ny flik
  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: height,
          p: 3
        }}
      >
        <Typography level="h3" sx={{ mb: 2 }}>
          Kunde inte visa PDF direkt
        </Typography>
        <Typography sx={{ mb: 3, textAlign: 'center' }}>
          Det gick inte att visa PDF-filen direkt i dialogrutan. Prova att öppna den i en ny flik.
        </Typography>
        <Button
          variant="solid"
          color="primary"
          startDecorator={<OpenInNew />}
          onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
        >
          Öppna i ny flik
        </Button>
      </Box>
    );
  }

  // Konstruera dataURL för Base64-metoden om pdfUrl är en faktisk URL (inte en data-URL)
  // Detta förutsätter att pdfUrl är en absolut URL eller en relativ URL till en server
  // som hanterar CORS korrekt
  const embedUrl = pdfUrl.startsWith('data:') ? pdfUrl : pdfUrl;

  return (
    <Box sx={{ position: 'relative', height: height, width: width }}>
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
            zIndex: 10
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <Box
        sx={{
          height: '100%',
          width: '100%',
          overflow: 'hidden'
        }}
      >
        {/* METOD 1: Använd embed-taggen (fungerar bra i många miljöer) */}
        <embed
          src={embedUrl+"#toolbar=0&navpanes=0"}
          type="application/pdf"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
        
        {/* METOD 2: Alternativ metod med iframe som backup (visas om embed inte fungerar) */}
        <Box
          sx={{
            mt: 2,
            display: loading ? 'none' : 'block',
            iframe: {
              width: '100%',
              height: 'calc(100% - 40px)',
              border: 'none'
            }
          }}
        >
          {/* Visa en knapp för att öppna i ny flik som en fallback-lösning */}
          <Stack 
            direction="row" 
            spacing={2} 
            sx={{ 
              mt: 2, 
              display: 'flex', 
              justifyContent: 'center' 
            }}
          >
            <Button
              size="sm"
              variant="outlined" 
              color="neutral"
              startDecorator={<OpenInNew />}
              onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
            >
              Öppna PDF i ny flik om den inte visas korrekt
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default EmbeddedPDFViewer;