import React from 'react';
import { Box, Typography, Button } from '@mui/joy';

interface SimplePDFViewerProps {
  initialUrl: string;  // Ändrat från pdfUrl till initialUrl för att matcha användningen i FolderPage
  filename: string;
  onClose?: () => void; // Lagt till valfri onClose för att matcha användningen i FolderPage
}

/**
 * En förenklad PDF-visare som använder iframe för bästa kompatibilitet
 */
const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ initialUrl, filename, onClose }) => {
  // Använd URL:en direkt från API-responsen utan att försöka manipulera den
  const processedUrl = React.useMemo(() => {
    // Använd URL:en som den är, men lägg till en cache-busting parameter
    let finalUrl = initialUrl;
    
    // Säkerställ att URL:en innehåller protokollet (http/https)
    if (!finalUrl.startsWith('http')) {
      if (finalUrl.startsWith('/')) {
        // Relativ URL, lägg till basdomänen
        finalUrl = `${window.location.origin}${finalUrl}`;
      } else {
        // Lägg till protokoll och domän
        finalUrl = `${window.location.origin}/${finalUrl}`;
      }
    }
    
    // Lägg till timestamp för att förhindra caching
    finalUrl = `${finalUrl}${finalUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
    console.log("Använder direkt PDF URL utan konvertering:", finalUrl);
    
    return finalUrl;
  }, [initialUrl]);
  
  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <Box sx={{ width: '100%', height: '100%' }}>
        {/* Använd direkt länk i iframe för att visa PDF */}
        <iframe
          src={`${processedUrl}#view=FitH`}
          title={filename}
          width="100%"
          height="100%"
          style={{
            border: 'none', 
            minHeight: '500px',
            background: 'white'
          }}
        />
      </Box>
    
      {/* Fallback-meddelande */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: -1,
          textAlign: 'center',
          p: 3,
          borderRadius: 'md',
          bgcolor: 'background.surface'
        }}
      >
        <Typography level="h3" sx={{ mb: 2 }}>
          Kunde inte visa PDF
        </Typography>
        <Typography sx={{ mb: 3 }}>
          Din webbläsare kunde inte visa PDF-filen direkt.
        </Typography>
        <Button
          component="a"
          href={initialUrl}
          target="_blank"
          variant="solid"
          color="primary"
          size="lg"
        >
          Öppna i ny flik
        </Button>
      </Box>
    </Box>
  );
};

export default SimplePDFViewer;