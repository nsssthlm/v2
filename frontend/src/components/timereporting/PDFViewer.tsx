import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Stack, CircularProgress } from '@mui/joy';
import { OpenInNew, Download } from '@mui/icons-material';

interface PDFViewerProps {
  pdfUrl: string;
  filename: string;
  onDownload: () => void;
  onOpenInNewTab: () => void;
}

/**
 * En enkel PDF-visare som använder object-taggen för att visa PDF direkt
 */
const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  filename,
  onDownload,
  onOpenInNewTab
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dölj laddningsindikatorn efter en kort stund
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* PDF-visningsområde */}
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
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
              zIndex: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.8)'
            }}
          >
            <CircularProgress />
          </Box>
        )}
        
        <object
          data={pdfUrl}
          type="application/pdf"
          width="100%"
          height="100%"
          style={{ display: 'block' }}
        >
          <Typography sx={{ textAlign: 'center', my: 4 }}>
            Din webbläsare kan inte visa PDF:er direkt.
            <br />
            Använd knapparna nedan för att öppna PDF:en i en ny flik eller ladda ner den.
          </Typography>
        </object>
      </Box>

      {/* Knappar längst ner */}
      <Box 
        sx={{ 
          p: 2, 
          borderTop: '1px solid', 
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Stack direction="row" spacing={2}>
          <Button
            variant="solid"
            color="primary"
            startDecorator={<OpenInNew />}
            onClick={onOpenInNewTab}
          >
            Öppna i ny flik
          </Button>
          <Button
            variant="outlined"
            color="neutral"
            startDecorator={<Download />}
            onClick={onDownload}
          >
            Ladda ner
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default PDFViewer;