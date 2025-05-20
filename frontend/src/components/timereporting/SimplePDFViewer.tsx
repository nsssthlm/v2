import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/joy';

interface SimplePDFViewerProps {
  pdfUrl: string;
  width?: string | number;
  height?: string | number;
}

/**
 * Enkel PDF-visningskomponent som stödjer flera olika metoder för att visa PDF
 * för maximal kompatibilitet mellan olika webbläsare.
 */
const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ 
  pdfUrl, 
  width = '100%', 
  height = '600px' 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fallbackMode, setFallbackMode] = useState(false);

  useEffect(() => {
    // Kontrollera om URL:en finns
    if (!pdfUrl) {
      setError('Ingen PDF-URL angiven');
      setLoading(false);
      return;
    }

    // Försök att förvalidera URL:en
    const checkUrl = async () => {
      try {
        const response = await fetch(pdfUrl, { method: 'HEAD' });
        if (!response.ok) {
          setError(`Kunde inte ladda PDF: ${response.status} ${response.statusText}`);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Kunde inte förvalidera PDF-URL:', err);
        // Fortsätt ändå, URL:en kan vara giltig trots HEAD-felet
      }
    };

    checkUrl();
  }, [pdfUrl]);

  const handleLoadError = () => {
    console.log('PDF-visning misslyckades, försöker med fallback-läge');
    setFallbackMode(true);
    setLoading(false);
  };

  const handleLoadSuccess = () => {
    setLoading(false);
  };

  // Om PDF:en inte kan laddas via iframe/object, visa denna fallback
  const renderFallback = () => (
    <Box 
      sx={{ 
        height: height, 
        width: width, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: 3,
        backgroundColor: '#f8f8f8'
      }}
    >
      <Typography level="h4" sx={{ mb: 2 }}>
        PDF kunde inte visas direkt
      </Typography>
      <Typography sx={{ mb: 3, textAlign: 'center' }}>
        Din webbläsare kunde inte visa PDF-dokumentet direkt.
      </Typography>
      <Button 
        component="a" 
        href={pdfUrl} 
        target="_blank"
        rel="noopener noreferrer"
        variant="solid"
        color="primary"
      >
        Öppna PDF i ny flik
      </Button>
    </Box>
  );

  // Huvudsaklig rendering
  return (
    <Box sx={{ position: 'relative', width: width, height: height }}>
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
            backgroundColor: 'rgba(255,255,255,0.7)',
            zIndex: 1
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
            alignItems: 'center' 
          }}
        >
          <Typography color="danger" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button 
            component="a" 
            href={pdfUrl} 
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            color="neutral"
          >
            Försök öppna i ny flik
          </Button>
        </Box>
      ) : fallbackMode ? (
        renderFallback()
      ) : (
        // Primär PDF-visning med iframe
        <iframe
          src={pdfUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
          onLoad={handleLoadSuccess}
          onError={handleLoadError}
          title="PDF Viewer"
        />
      )}
    </Box>
  );
};

export default SimplePDFViewer;