import { useState } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/joy';

interface SimplePDFReactViewerProps {
  pdfUrl: string;
  filename: string;
  width?: string | number;
  height?: string | number;
}

/**
 * En enkel PDF-visare som använder iframe för att visa PDF-filer
 */
const SimplePDFReactViewer = ({ 
  pdfUrl, 
  filename, 
  width = '100%', 
  height = '100%' 
}: SimplePDFReactViewerProps) => {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setLoadError(true);
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
        bgcolor: '#333'
      }}
    >
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
          <CircularProgress size="lg" />
          <Typography color="white">Laddar PDF...</Typography>
        </Box>
      )}

      {loadError ? (
        <Box 
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            p: 4,
            color: 'white',
            textAlign: 'center'
          }}
        >
          <Typography level="h4" sx={{ mb: 2 }}>
            Det gick inte att visa PDF-filen
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Din webbläsare kunde inte visa PDF-filen "{filename}".
          </Typography>
          <Button
            component="a"
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ 
              mt: 2,
              bgcolor: 'primary.500',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.600'
              }
            }}
          >
            Öppna PDF i nytt fönster
          </Button>
        </Box>
      ) : (
        <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
          {/* "Nuvarande version" badge */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 2,
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
          
          {/* Iframe för PDF-visningen */}
          <iframe
            src={`${pdfUrl}#view=FitH&navpanes=0`}
            width="100%"
            height="100%"
            style={{ 
              border: 'none',
              background: 'white',
              display: 'block'
            }}
            title={filename}
            onLoad={handleLoad}
            onError={handleError}
          />
          
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
      )}
      
      {/* Kontroller längst ner */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 1,
          bgcolor: '#222',
          borderTop: '1px solid #444'
        }}
      >
        <Button
          component="a"
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          size="sm"
          sx={{ 
            bgcolor: '#4caf50', 
            color: 'white',
            '&:hover': { 
              bgcolor: '#3d8b40',
              textDecoration: 'none'
            }
          }}
        >
          Öppna i helskärm
        </Button>
      </Box>
    </Box>
  );
};

export default SimplePDFReactViewer;