import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';

interface SimplePDFViewerProps {
  pdfUrl: string;
  filename: string;
  width?: string | number;
  height?: string | number;
}

/**
 * En enkel PDF-visare med förbättrad visning som hanterar olika sätt att visa PDF-filer
 */
const SimplePDFViewer = ({ 
  pdfUrl, 
  filename, 
  width = '100%', 
  height = '100%' 
}: SimplePDFViewerProps) => {
  const [showDirectLink, setShowDirectLink] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Använd bara domännamnet från pdfUrl för att undvika CORS-problem
  const [fixedPdfUrl, setFixedPdfUrl] = useState("");
  
  // Fixa URL:en när komponenten laddas
  useEffect(() => {
    // Rensa URL:en och försök generera en som fungerar för iframes
    try {
      // Om URL:en börjar med http://0.0.0.0, ändra den till window.location.origin
      let correctedUrl = pdfUrl;
      
      if (pdfUrl.includes('0.0.0.0:8001')) {
        // Ersätt 0.0.0.0:8001 med aktuella origin för backend
        const parts = pdfUrl.split('/');
        const pathPart = parts.slice(3).join('/');
        correctedUrl = `${window.location.origin}/${pathPart}`;
      }
      
      // För backend API url, använd media-mappen
      if (correctedUrl.includes('/api/files/web/')) {
        // Extrahera filsökvägen
        if (correctedUrl.includes('/project_files/')) {
          const filePathStart = correctedUrl.indexOf('/project_files/');
          const filePath = correctedUrl.substring(filePathStart);
          correctedUrl = `${window.location.origin}/media${filePath}`;
        }
      }
      
      console.log("Försöker använda URL:", correctedUrl);
      setFixedPdfUrl(correctedUrl);
      
      // Kontrollera om URL:en är nåbar
      fetch(correctedUrl, { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            setLoading(false);
          } else {
            console.error("PDF URL gav felstatus:", response.status);
            setError(true);
            setShowDirectLink(true);
          }
        })
        .catch(err => {
          console.error("Kunde inte nå PDF URL:", err);
          setError(true);
          setShowDirectLink(true);
        });
    } catch (err) {
      console.error("Fel vid URL-hantering:", err);
      setError(true);
      setShowDirectLink(true);
    }
    
    // Sätt en timer för att automatiskt visa direktlänken om laddningen tar för lång tid
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false);
        if (!showDirectLink) {
          setShowDirectLink(true);
        }
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [pdfUrl, loading, showDirectLink]);
  
  // Öppna PDF i nytt fönster
  const openPDFInNewWindow = () => {
    window.open(fixedPdfUrl || pdfUrl, '_blank');
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

      {/* PDF innehåll */}
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Inbäddad PDF via object-tag med fallback till iframe */}
        {!error && !showDirectLink && (
          <object
            data={fixedPdfUrl}
            type="application/pdf"
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            onLoad={() => setLoading(false)}
            onError={() => {
              setError(true);
              setShowDirectLink(true);
            }}
          >
            <iframe
              src={fixedPdfUrl}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title={filename}
              onLoad={() => setLoading(false)}
              onError={() => {
                setError(true);
                setShowDirectLink(true);
              }}
            />
          </object>
        )}

        {/* Visa en direktlänk om objektvisaren inte fungerar */}
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
              {error ? 
                "Det uppstod ett problem vid visning av PDF-filen. Använd knappen nedan för att öppna den." : 
                "För att visa PDF-dokumentet, använd knappen nedan."
              }
            </Typography>

            <Button
              onClick={openPDFInNewWindow}
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
            Original URL: {pdfUrl}
          </Typography>
          <Typography level="body-xs" sx={{ wordBreak: 'break-all', mb: 1 }}>
            Fixad URL: {fixedPdfUrl}
          </Typography>
          <Typography level="body-xs" sx={{ mb: 1 }}>
            Laddar: {loading ? 'Ja' : 'Nej'}
          </Typography>
          <Typography level="body-xs" sx={{ mb: 1 }}>
            Fel: {error ? 'Ja' : 'Nej'}
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