import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';

interface SimpleIFramePDFViewerProps {
  pdfUrl: string;
  filename: string;
}

/**
 * En enkel PDF-visare som använder iframe för att visa PDF-filer
 */
const SimpleIFramePDFViewer = ({ pdfUrl, filename }: SimpleIFramePDFViewerProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      {loading && (
        <Box 
          sx={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}
        >
          <CircularProgress />
          <Typography>Laddar PDF...</Typography>
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
            textAlign: 'center',
            p: 3
          }}
        >
          <Typography level="h3" sx={{ mb: 2 }}>
            Kunde inte visa PDF-fil
          </Typography>
          <Typography sx={{ mb: 3 }}>
            Det gick inte att visa "{filename}". Prova att öppna filen i ett nytt fönster.
          </Typography>
          <Button 
            component="a" 
            href={pdfUrl} 
            target="_blank" 
            variant="solid"
            color="primary"
          >
            Öppna i nytt fönster
          </Button>
        </Box>
      ) : (
        <iframe 
          src={pdfUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
          title={filename}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </Box>
  );
};

export default SimpleIFramePDFViewer;