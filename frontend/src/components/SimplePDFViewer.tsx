import React from 'react';
import { Box, Typography, Button } from '@mui/joy';

interface SimplePDFViewerProps {
  pdfUrl: string;
  filename: string;
}

/**
 * En förenklad PDF-visare som använder iframe för bästa kompatibilitet
 */
const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ pdfUrl, filename }) => {
  // Bearbeta URL till ett format som kan visas i iframe
  const processedUrl = React.useMemo(() => {
    // För API-URL från backend, konvertera till media URL för direkt nedladdning
    if (pdfUrl && pdfUrl.includes('/api/files/web/')) {
      // Endast för Replit-miljö, anpassa URL för att få direkt åtkomst till API
      if (window.location.hostname.includes('replit')) {
        // Använd en direkt URL till PDF-filen via API:et
        return `${pdfUrl}?direct=true`;
      }
    }
    return pdfUrl;
  }, [pdfUrl]);
  
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
          href={pdfUrl}
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