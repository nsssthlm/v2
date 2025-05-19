import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/joy';
import { DIRECT_API_URL } from '../config';

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
  
  // Förbereder URL för åtkomst till PDF-filen
  const getDirectUrl = () => {
    // Använd relativ URL (funkar med både HTTP och HTTPS)
    if (pdfUrl.startsWith('/media/')) {
      return pdfUrl;
    }
    
    // Om URL:en är från API, rensa upp den
    if (pdfUrl.includes('/api/files/web/')) {
      const parts = pdfUrl.split('/api/files/web/');
      if (parts.length > 1 && parts[1].includes('/')) {
        const subParts = parts[1].split('/');
        if (subParts.length > 2 && subParts[1] === 'data') {
          // Försök hitta projekt_files delen
          const contentPath = pdfUrl.split('project_files/');
          if (contentPath.length > 1) {
            return `/media/project_files/${contentPath[1]}`;
          }
        }
      }
    }
    
    // I annat fall, skicka tillbaka original-URL:en
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

  // Visa själva PDF-visaren med fallback
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
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          zIndex: 5
        }}>
          <CircularProgress size="lg" sx={{ mb: 2 }} />
          <Typography level="body-sm">
            Laddar dokument...
          </Typography>
        </Box>
      )}
      
      {/* Försök med ett inbäddat iframe direkt mot dokumentkällan */}
      <Box sx={{ 
        height: '100%', 
        width: '100%', 
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Verktygsfält med nedladdningsalternativ */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          p: 1, 
          backgroundColor: '#f0f0f0',
          borderBottom: '1px solid #ddd'
        }}>
          <Button
            onClick={() => window.open(directUrl, '_blank')}
            variant="outlined"
            color="neutral"
            size="sm"
            sx={{ mr: 1 }}
          >
            Öppna i ny flik
          </Button>
          
          <Button
            component="a"
            href={directUrl}
            download
            variant="outlined"
            color="primary"
            size="sm"
          >
            Ladda ner
          </Button>
        </Box>
        
        {/* Försök visa PDF i iframe */}
        <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <iframe
            src={directUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              overflow: 'auto'
            }}
            onLoad={() => {
              setLoading(false);
              if (onLoad) onLoad();
            }}
            onError={(e) => {
              setError('Kunde inte ladda dokumentet i iframe.');
              if (onError) onError(e);
            }}
            title="PDF Viewer"
          />
          
          {/* Visa alltid en knappruta i botten för fallback-åtkomst */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(255,255,255,0.9)',
              p: 2,
              display: 'flex',
              justifyContent: 'center',
              borderTop: '1px solid #ddd'
            }}
          >
            <Typography level="body-sm" sx={{ mr: 2 }}>
              Problem med att se dokumentet?
            </Typography>
            
            <Button
              onClick={() => window.open(directUrl, '_blank')}
              variant="solid"
              color="primary"
              size="sm"
            >
              Öppna i ny flik
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UltimatePDFViewer;