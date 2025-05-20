import React, { useState } from 'react';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/joy';
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';

interface PDFEmbedProps {
  pdfUrl: string;
  title?: string;
  height?: string | number;
}

/**
 * En enkel PDF-inbäddningskomponent som anpassar sig efter olika webbläsare
 * och miljöer. Om den direkta inbäddningen inte fungerar, erbjuds alternativ
 * för att öppna PDF:en i en ny flik.
 */
const PDFEmbed: React.FC<PDFEmbedProps> = ({ 
  pdfUrl, 
  title, 
  height = '80vh' 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // En direkt länk för att öppna PDF:en i en ny flik
  const openPDFInNewTab = () => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Visa laddningsindikator medan PDF:en laddas */}
      {loading && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 10
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Visa fel-UI om det inte går att visa PDF:en */}
      {error && (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: height,
            padding: 3,
            bgcolor: 'background.level1',
            borderRadius: 'sm'
          }}
        >
          <Typography level="h4" sx={{ mb: 2 }}>
            Kunde inte visa PDF
          </Typography>
          <Typography level="body-md" sx={{ mb: 3, textAlign: 'center' }}>
            Det går inte att visa PDF-dokumentet direkt i webbläsaren.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button 
              variant="solid" 
              color="primary"
              startDecorator={<OpenInNewIcon />}
              onClick={openPDFInNewTab}
            >
              Öppna i ny flik
            </Button>
          </Stack>
        </Box>
      )}

      {/* Direkta visningsmetoden - iframe */}
      {!error && (
        <Box 
          sx={{ 
            height: height, 
            width: '100%', 
            iframe: { 
              width: '100%', 
              height: '100%', 
              border: 'none',
              backgroundColor: 'white',
              borderRadius: 'sm'
            },
          }}
        >
          <iframe 
            src={pdfUrl}
            title={title || "PDF Viewer"}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
          />
        </Box>
      )}
    </Box>
  );
};

export default PDFEmbed;