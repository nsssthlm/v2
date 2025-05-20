import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/joy';

interface EmbeddedPDFViewerProps {
  url: string;
  width?: string | number;
  height?: string | number;
}

const EmbeddedPDFViewer: React.FC<EmbeddedPDFViewerProps> = ({ 
  url, 
  width = '100%', 
  height = '100%' 
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) return;
    
    setLoading(true);
    setError(false);
    
    try {
      // Enkel PDF-visning
      const pdfViewerUrl = `/pdf-viewer/pdf.html?url=${encodeURIComponent(url)}`;
      
      if (iframeRef.current) {
        iframeRef.current.src = pdfViewerUrl;
        
        iframeRef.current.onload = () => {
          setLoading(false);
        };
      }
    } catch (err) {
      console.error('Error embedding PDF:', err);
      setError(true);
      setLoading(false);
    }
  }, [url]);

  if (!url) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          width,
          height,
          bgcolor: '#f5f5f5',
          borderRadius: 'sm'
        }}
      >
        <Typography level="body-lg">Ingen PDF tillgänglig</Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        width, 
        height, 
        position: 'relative', 
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 'sm',
        bgcolor: '#f5f5f5'
      }}
    >
      {loading && (
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          zIndex: 2
        }}>
          <CircularProgress size="lg" />
        </Box>
      )}
      
      {error && (
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',
          p: 3,
          textAlign: 'center'
        }}>
          <Typography level="title-lg" color="danger" sx={{ mb: 2 }}>
            PDF-filen kunde inte visas
          </Typography>
          <Typography level="body-md">
            Det gick inte att visa PDF-filen i rutan.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: 'inherit', 
                textDecoration: 'underline',
                fontWeight: 'bold'
              }}
            >
              Klicka här för att öppna PDF:en
            </a>
          </Box>
        </Box>
      )}
      
      <iframe
        ref={iframeRef}
        style={{ 
          width: '100%', 
          height: '100%', 
          border: 'none',
          display: 'block'
        }}
        title="PDF Viewer"
        allowFullScreen
      />
    </Box>
  );
};

export default EmbeddedPDFViewer;