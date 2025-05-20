import React, { useEffect, useRef } from 'react';
import { Box, CircularProgress } from '@mui/joy';

interface PDFViewerProps {
  url: string;
  width?: string | number;
  height?: string | number;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, width = '100%', height = '100%' }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    // Skapa en säker PDF-visare
    if (url && iframeRef.current) {
      // Generera en iframe-URL som direkt laddar PDF-filen
      // Vi använder en URL som ger webbläsaren bästa möjligheten att visa PDF-filen
      iframeRef.current.src = url;
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
          height
        }}
      >
        <CircularProgress size="lg" />
      </Box>
    );
  }

  return (
    <Box sx={{ width, height, position: 'relative', overflow: 'hidden' }}>
      <iframe
        ref={iframeRef}
        style={{ 
          width: '100%', 
          height: '100%', 
          border: 'none',
          display: 'block',
          backgroundColor: '#f5f5f5'
        }}
        title="PDF Viewer"
        allowFullScreen
      />
    </Box>
  );
};

export default PDFViewer;