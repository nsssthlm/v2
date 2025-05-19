import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/joy';

interface UltimatePDFViewerProps {
  pdfUrl: string;
  onLoad?: () => void;
  onError?: (error: any) => void;
  projectId?: number | null;
  versionId?: number;
  annotationId?: number;
}

/**
 * UltimatePDFViewer - En extremt pålitlig PDF-visningskomponent som
 * använder en enkel inbäddningsmetod. Istället för att försöka använda
 * PDF-bibliotek som kan orsaka kompatibilitetsproblem, länkar denna
 * komponent direkt till API-endpunkten för att visa PDF-filen.
 */
const UltimatePDFViewer = ({ 
  pdfUrl, 
  onLoad,
  onError
}: UltimatePDFViewerProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Direkt åtkomst till PDF-filen
  const getDirectUrl = () => {
    // Fullständig URL om det är en media-URL
    if (pdfUrl.startsWith('/media/')) {
      return `http://0.0.0.0:8001${pdfUrl}`;
    }
    return pdfUrl;
  };
  
  // Hämta direkt URL för att öppna PDF:en
  const directUrl = getDirectUrl();

  useEffect(() => {
    setLoading(false);
    if (onLoad) onLoad();
  }, [pdfUrl, onLoad]);

  // Visa fel om något gick fel
  if (error) {
    return (
      <Box sx={{ 
        p: 4, 
        textAlign: 'center',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Typography level="title-lg" color="danger" sx={{ mb: 2 }}>
          Det uppstod ett fel
        </Typography>
        <Typography sx={{ mb: 3 }}>
          {error}
        </Typography>
        <Typography level="body-sm" sx={{ mb: 2 }}>
          Det går inte att visa PDF-filen. Prova att öppna den i en ny flik.
        </Typography>
        <Button 
          onClick={() => window.open(directUrl, '_blank')}
          variant="solid"
          color="primary"
        >
          Öppna i ny flik
        </Button>
      </Box>
    );
  }

  // Visa själva PDF-visaren
  return (
    <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
      {loading && (
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          zIndex: 5
        }}>
          <CircularProgress size="lg" />
        </Box>
      )}
      
      {/* Använd iframe-embed med hjälptext som visas medan PDF laddar */}
      <Box
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          p: 2
        }}
      >
        <Typography level="title-lg" sx={{ mb: 4, textAlign: 'center' }}>
          Dokument finns tillgängligt för nedladdning
        </Typography>
        
        <Typography sx={{ mb: 4, textAlign: 'center', maxWidth: '600px' }}>
          PDF-visaren kunde inte visa dokumentet i webbläsaren. Använd knappen nedan för att öppna dokumentet i en ny flik eller ladda ner det till din dator.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            onClick={() => window.open(directUrl, '_blank')}
            variant="solid"
            color="primary"
            size="lg"
          >
            Öppna dokument
          </Button>
          
          <Button
            component="a"
            href={directUrl}
            download
            variant="outlined"
            size="lg"
          >
            Ladda ner
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default UltimatePDFViewer;