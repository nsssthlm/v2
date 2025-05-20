import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Button, Stack, CircularProgress } from '@mui/joy';
import { PictureAsPdf, OpenInNew, Download } from '@mui/icons-material';

interface EmbeddedPDFViewerProps {
  pdfUrl: string;
  filename: string;
  fileId?: string;
  isLocal?: boolean;
}

/**
 * En enkel direkt-inbäddad PDF-visare med objektelement
 */
const EmbeddedPDFViewer: React.FC<EmbeddedPDFViewerProps> = ({
  pdfUrl,
  filename,
  fileId,
  isLocal = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const objectRef = useRef<HTMLObjectElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // För att hantera när PDF-objekt laddas
  useEffect(() => {
    // Återställ laddningsstatus när URL ändras
    setIsLoading(true);
    setLoadError(false);
    
    // Sätt en timer för att kontrollera om PDF laddas inom rimlig tid
    const loadTimer = setTimeout(() => {
      if (isLoading) {
        console.log('PDF-laddningstid överskreds, försöker med alternativa metoder...');
        if (objectRef.current) {
          // Kontrollera om objektet faktiskt har laddat innehåll
          try {
            const hasContent = objectRef.current.clientHeight > 50;
            if (!hasContent) {
              setLoadError(true);
            }
          } catch (e) {
            console.error('Kunde inte kontrollera PDF-objektet:', e);
            setLoadError(true);
          }
        }
      }
    }, 5000); // 5 sekunder timeout
    
    return () => {
      clearTimeout(loadTimer);
    };
  }, [pdfUrl, isLoading]);

  // Hantera när inläsningen är klar 
  const handleLoad = () => {
    console.log('PDF laddad framgångsrikt:', filename);
    setIsLoading(false);
    setLoadError(false);
  };

  // Hantera fel vid inläsning av PDF
  const handleError = () => {
    console.error('Fel vid laddning av PDF:', filename);
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
      // För server-filer, öppna direktlänk
      window.location.href = pdfUrl;
    }
  };

  // Öppna PDF i nytt fönster
  const handleOpenInNewTab = () => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* PDF-visningsområde */}
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
              PDF-filen kunde inte visas direkt i dialogrutan på grund av webbläsarens säkerhetsinställningar.
              <br />
              Använd knapparna nedan för att visa dokumentet på ett annat sätt.
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

        {/* Primär metod: Visa PDF inline med objekt-element */}
        {!loadError && (
          <object
            ref={objectRef}
            data={pdfUrl}
            type="application/pdf"
            style={{ 
              width: '100%', 
              height: '100%', 
              display: loadError ? 'none' : 'block'
            }}
            onLoad={handleLoad}
            onError={handleError}
          >
            {/* Fallback till iframe om object inte fungerar */}
            <iframe
              ref={iframeRef}
              src={`${pdfUrl}#toolbar=0`}
              style={{ 
                width: '100%', 
                height: '100%', 
                border: 'none'
              }}
              title={filename}
              onLoad={handleLoad}
              onError={handleError}
            >
              <Typography>
                Din webbläsare kan inte visa PDF-filer inline. 
                <Button onClick={handleOpenInNewTab}>Öppna i nytt fönster</Button>
              </Typography>
            </iframe>
          </object>
        )}
      </Box>
      
      {/* Kontrollpanel längst ner */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'center', 
          borderTop: '1px solid', 
          borderColor: 'divider',
          bgcolor: 'background.surface'
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

export default EmbeddedPDFViewer;