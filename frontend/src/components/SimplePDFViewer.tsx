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
    // Hantera backend URL:er för Replit-miljön
    let finalUrl = pdfUrl;
    
    // Ersätt alla lokala URL:er (0.0.0.0:8001) med Replit proxy URL
    if (pdfUrl && pdfUrl.includes('0.0.0.0:8001')) {
      finalUrl = pdfUrl.replace(
        'http://0.0.0.0:8001', 
        'https://3eabe322-11fd-420e-9b72-6dc9b22d9093-00-2gpr7cql4w25w.kirk.replit.dev/proxy/3000'
      );
      console.log("Konverterad URL till Replit proxy:", finalUrl);
    }
    
    // Om i Replit-miljö, använd speciell hantering för PDF-filer
    if (window.location.hostname.includes('replit')) {
      // För API-URL från backend, konvertera till media URL för att få direkt åtkomst till filen
      if (finalUrl.includes('/api/files/web/') && finalUrl.includes('project_files/')) {
        // Extrahera sökvägen från project_files och framåt
        const pathMatch = finalUrl.match(/project_files\/.*\.pdf/);
        if (pathMatch) {
          // Skapa direkt länk till media-filen
          const mediaPath = pathMatch[0];
          // Använd proxy eller direkt URL beroende på miljö
          finalUrl = `${window.location.protocol}//${window.location.host}/proxy/3000/media/${mediaPath}`;
          console.log("Konverterad till direkt media URL:", finalUrl);
        } else {
          // Fallback: lägg till direct=true parameter
          finalUrl = `${finalUrl}${finalUrl.includes('?') ? '&' : '?'}direct=true`;
          console.log("Lagt till direct=true parameter (fallback):", finalUrl);
        }
      }
    }
    
    return finalUrl;
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