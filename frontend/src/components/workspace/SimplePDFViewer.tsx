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
            boxShadow: 'md', 
            borderRadius: 'md',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <canvas id="pdf-canvas" style={{ maxWidth: '100%' }} />
          </Box>
        )}
      </Box>
      
      {/* Controls */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: 2, 
        p: 2,
        borderTop: '1px solid',
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <button 
            onClick={() => changePage(currentPage - 1)} 
            disabled={currentPage <= 1 || loading}
            style={{ 
              padding: '8px 16px',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Föregående
          </button>
          
          <Typography>
            {currentPage} / {numPages}
          </Typography>
          
          <button 
            onClick={() => changePage(currentPage + 1)} 
            disabled={currentPage >= numPages || loading}
            style={{ 
              padding: '8px 16px',
              cursor: currentPage >= numPages ? 'not-allowed' : 'pointer'
            }}
          >
            Nästa
          </button>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <button 
            onClick={() => zoom(-0.1)} 
            disabled={scale <= 0.5 || loading}
            style={{ 
              padding: '8px 16px',
              cursor: scale <= 0.5 ? 'not-allowed' : 'pointer'
            }}
          >
            Zooma ut
          </button>
          
          <button 
            onClick={() => zoom(0.1)} 
            disabled={scale >= 3.0 || loading}
            style={{ 
              padding: '8px 16px',
              cursor: scale >= 3.0 ? 'not-allowed' : 'pointer'
            }}
          >
            Zooma in
          </button>
        </Box>
      </Box>
    </Box>
  );
}