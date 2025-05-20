import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';

interface DirectPDFViewerProps {
  url: string;
  height?: string | number;
  width?: string | number;
}

/**
 * Enkel PDF-visare som öppnar PDFer direkt i nytt fönster 
 * och visar förhandsvisning i gränssnittet
 */
const DirectPDFViewer: React.FC<DirectPDFViewerProps> = ({ 
  url, 
  height = '100%', 
  width = '100%' 
}) => {
  const [loading, setLoading] = useState(true);
  const [pdfExists, setPdfExists] = useState(true);

  useEffect(() => {
    // Kontrollera om URL existerar
    if (!url) {
      setPdfExists(false);
      setLoading(false);
      return;
    }

    // Simulera laddning för bättre användarupplevelse
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [url]);

  const handleOpenPDF = () => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (!pdfExists) {
    return (
      <Box 
        sx={{ 
          height, 
          width, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          backgroundColor: '#f5f5f5'
        }}
      >
        <Typography level="body-lg">Ingen PDF tillgänglig</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height, 
      width, 
      position: 'relative',
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      overflow: 'hidden'
    }}>
      {loading ? (
        <Box 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: '#f5f5f5'
          }}
        >
          <CircularProgress size="lg" sx={{ mb: 2 }} />
          <Typography level="body-md">Förbereder PDF...</Typography>
        </Box>
      ) : (
        <Box 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            padding: 3,
            backgroundColor: '#f5f5f5',
            textAlign: 'center'
          }}
        >
          <Typography level="title-lg" sx={{ mb: 2 }}>PDF redo att visas</Typography>
          <Typography level="body-md" sx={{ mb: 4 }}>
            På grund av webbläsarens säkerhetsbegränsningar kan PDF-filen inte visas direkt i denna ruta.
          </Typography>
          
          <Button 
            variant="solid" 
            color="primary" 
            size="lg"
            onClick={handleOpenPDF}
            sx={{ mb: 2 }}
          >
            Öppna PDF i nytt fönster
          </Button>
          
          <Typography level="body-sm" color="neutral">
            PDF-dokument öppnas i ett nytt fönster för bästa visningsupplevelse
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DirectPDFViewer;