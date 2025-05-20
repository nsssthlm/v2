import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Stack, CircularProgress } from '@mui/joy';
import { PictureAsPdf, OpenInNew, Download } from '@mui/icons-material';

interface SimplePDFViewerProps {
  pdfUrl: string;
  filename: string;
  fileId?: string; // ID för server-filer som behöver proxy
  isLocal?: boolean; // Om filen är lokal (blob URL) eller från servern
}

/**
 * En förbättrad PDF-visare som använder standardkomponenter för maximal kompatibilitet,
 * med fallback-alternativ om visningen inte fungerar.
 * 
 * Fungerar med både lokala filer (blob URLs) och server-filer som hämtas via proxy.
 */
const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ 
  pdfUrl, 
  filename, 
  fileId,
  isLocal = false 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  // Använd alternativ URL för proxy om det finns ett fileId
  const [proxyUrl, setProxyUrl] = useState<string | null>(null);
  
  // Skapa proxy-URL för server-filer för att lösa CORS-problem
  useEffect(() => {
    if (!isLocal && fileId) {
      // Användning av vår nya backend-proxy för att servera PDF-filer med korrekta headers
      const proxyEndpoint = `/api/files/pdf-proxy/${fileId}/`;
      console.log('Använder proxy-URL för PDF:', proxyEndpoint);
      setProxyUrl(proxyEndpoint);
    } else {
      // Använd original URL för lokala filer (blob URLs från uppladdningar)
      setProxyUrl(null);
    }
  }, [fileId, isLocal, pdfUrl]);
  
  // Slutgiltiga URL att använda (proxy eller original)
  const effectiveUrl = proxyUrl || pdfUrl;

  // Hantera när inläsningen av PDF är klar
  const handleLoad = () => {
    console.log('PDF laddad framgångsrikt:', filename);
    setIsLoading(false);
    setLoadError(false);
  };

  // Hantera fel vid inläsning av PDF
  const handleError = () => {
    console.error('Fel vid laddning av PDF:', filename, 'URL:', effectiveUrl);
    setIsLoading(false);
    setLoadError(true);
  };

  // Ladda ner PDF
  const handleDownload = () => {
    if (isLocal) {
      // För lokala blob URLs, använd standard nedladdningslogik
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // För server-filer, använd ett direkt API-anrop med Content-Disposition: attachment
      window.location.href = effectiveUrl;
    }
  };

  // Öppna PDF i nytt fönster
  const handleOpenInNewTab = () => {
    window.open(effectiveUrl, '_blank', 'noopener,noreferrer');
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
        
        {/* PDF-visning via en enkel iframe med cors-inställningar */}
        {!loadError && (
          <iframe
            src={effectiveUrl}
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