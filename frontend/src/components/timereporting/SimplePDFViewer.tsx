import React, { useState } from 'react';
import { Box, Typography, Button, Stack, CircularProgress } from '@mui/joy';
import { PictureAsPdf, OpenInNew, Download } from '@mui/icons-material';

interface SimplePDFViewerProps {
  pdfUrl: string;
  filename: string;
}

/**
 * En enkel PDF-visare som använder standardkomponenter för maximal kompatibilitet,
 * med fallback-alternativ om visningen inte fungerar.
 */
const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ pdfUrl, filename }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Hantera när inläsningen av PDF är klar
  const handleLoad = () => {
    setIsLoading(false);
    setLoadError(false);
  };

  // Hantera fel vid inläsning av PDF
  const handleError = () => {
    setIsLoading(false);
    setLoadError(true);
  };

  // Ladda ner PDF
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Öppna PDF i nytt fönster
  const handleOpenInNewTab = () => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Huvuddelen med PDF-visning */}
      <Box sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Laddningsindikator */}
        {isLoading && (
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
              bgcolor: 'rgba(255,255,255,0.8)',
              zIndex: 10
            }}
          >
            <CircularProgress size="lg" />
          </Box>
        )}
        
        {/* Felmeddelande om PDF inte kan laddas */}
        {loadError && (
          <Box 
            sx={{ 
              height: '100%',
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 4,
              textAlign: 'center'
            }}
          >
            <PictureAsPdf 
              sx={{ fontSize: 80, color: 'primary.main', opacity: 0.7, mb: 3 }}
            />
            
            <Typography level="h4" sx={{ mb: 2 }}>
              {filename}
            </Typography>
            
            <Typography sx={{ mb: 4, color: 'text.secondary' }}>
              PDF-filen kunde inte visas i dialogrutan på grund av webbläsarens säkerhetsinställningar.
              <br />
              Använd knapparna nedan för att visa dokumentet.
            </Typography>
            
            <Stack direction="row" spacing={2}>
              <Button 
                variant="solid" 
                color="primary"
                size="lg"
                startDecorator={<OpenInNew />}
                onClick={handleOpenInNewTab}
              >
                Öppna i ny flik
              </Button>
              
              <Button 
                variant="outlined" 
                color="neutral"
                size="lg"
                startDecorator={<Download />}
                onClick={handleDownload}
              >
                Ladda ner
              </Button>
            </Stack>
          </Box>
        )}
        
        {/* PDF-visning via en enkel iframe */}
        {!loadError && (
          <iframe
            src={pdfUrl}
            style={{ 
              width: '100%', 
              height: '100%', 
              border: 'none',
              display: loadError ? 'none' : 'block'
            }}
            title={filename}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
      </Box>
      
      {/* Knappar längst ner */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'center', 
          borderTop: '1px solid', 
          borderColor: 'divider'
        }}
      >
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="primary"
            startDecorator={<OpenInNew />}
            onClick={handleOpenInNewTab}
          >
            Öppna i ny flik
          </Button>
          
          <Button
            variant="outlined"
            color="neutral"
            startDecorator={<Download />}
            onClick={handleDownload}
          >
            Ladda ner
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default SimplePDFViewer;