import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/joy';

interface SimplePDFViewerProps {
  url: string;
  width?: string | number;
  height?: string | number;
  title?: string;
}

/**
 * En helt enkel PDF-visare utan säkerhetsfunktioner
 */
const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ 
  url, 
  width = '100%', 
  height = '100%',
  title = 'PDF Dokument'
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!url) {
      setError('Ingen URL angiven');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Enkel inbäddning av PDF direkt med object-tag
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <object 
            data="${url}" 
            type="application/pdf" 
            width="100%" 
            height="100%"
            style="display: block; border: none;"
          >
            <p>Din webbläsare kan inte visa PDFer. <a href="${url}" target="_blank">Klicka här för att öppna PDF:en</a>.</p>
          </object>
        `;
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Fel vid visning av PDF:', err);
      setError('Kunde inte visa PDF-filen');
      setLoading(false);
    }
  }, [url]);

  // Om ingen URL finns, visa meddelande
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
          border: '1px solid',
          borderColor: 'divider',
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
        position: 'relative', 
        width, 
        height,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 'sm',
        overflow: 'hidden'
      }}
    >
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
            justifyContent: 'center', 
            alignItems: 'center',
            bgcolor: '#f5f5f5',
            zIndex: 2
          }}
        >
          <CircularProgress size="lg" sx={{ mb: 2 }} />
          <Typography level="body-md">Laddar PDF...</Typography>
        </Box>
      )}

      {error && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            bgcolor: '#f5f5f5',
            p: 3
          }}
        >
          <Typography color="danger" level="title-lg" sx={{ mb: 2 }}>
            {error}
          </Typography>
          
          <Button 
            variant="outlined"
            color="primary" 
            onClick={() => window.open(url, '_blank')}
            sx={{ mt: 2 }}
          >
            Öppna i nytt fönster
          </Button>
        </Box>
      )}

      <Box 
        ref={containerRef} 
        sx={{ 
          width: '100%', 
          height: '100%' 
        }}
      />
    </Box>
  );
};

export default SimplePDFViewer;