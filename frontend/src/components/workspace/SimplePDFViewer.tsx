import { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/joy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface SimplePDFViewerProps {
  pdfUrl: string;
  title?: string;
}

export default function SimplePDFViewer({ pdfUrl, title }: SimplePDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Enkel timer för laddningsindikator
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [pdfUrl]);

  // Hantera iframe fel
  const handleIframeError = () => {
    console.error('Kunde inte ladda PDF i iframe');
    setError('Kunde inte ladda PDF-dokumentet. Försök öppna i nytt fönster istället.');
    setLoading(false);
  };

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        p: 2 
      }}>
        <Typography color="danger" level="body-lg">
          {error}
        </Typography>
        <Button 
          onClick={() => window.open(pdfUrl, '_blank')}
          variant="outlined"
          color="primary"
          size="sm"
          startDecorator={<OpenInNewIcon />}
          sx={{ mt: 2 }}
        >
          Öppna i nytt fönster
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%' 
    }}>
      {/* PDF viewer */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        overflow: 'auto',
        p: 2 
      }}>
        {loading ? (
          <CircularProgress size="lg" />
        ) : (
          <Box sx={{ 
            width: '100%',
            height: '100%',
            boxShadow: 'md', 
            borderRadius: 'md',
            backgroundColor: 'white',
            overflow: 'hidden'
          }}>
            <iframe
              ref={iframeRef}
              src={pdfUrl}
              style={{ 
                width: '100%', 
                height: '100%', 
                border: 'none' 
              }}
              onError={handleIframeError}
              title={title || "PDF Dokument"}
            />
          </Box>
        )}
      </Box>
      
      {/* Controls */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        p: 2,
        borderTop: '1px solid',
        borderColor: 'divider'
      }}>
        <Button 
          onClick={() => window.open(pdfUrl, '_blank')}
          variant="outlined"
          color="primary"
          size="sm"
          startDecorator={<OpenInNewIcon />}
        >
          Öppna i nytt fönster
        </Button>
      </Box>
    </Box>
  );
}