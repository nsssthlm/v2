import React, { useState, useEffect, useRef } from 'react';
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
 * UltimatePDFViewer - En extremt pålitlig PDF-visningskomponent
 * med fokus på kompatibilitet via iframe.
 * 
 * Denna komponent:
 * 1. Använder iframe för maximal kompatibilitet
 * 2. Stöder automatisk URL-konvertering 
 * 3. Hanterar olika felfall elegant
 */
const UltimatePDFViewer = ({ 
  pdfUrl, 
  onLoad, 
  onError,
  projectId
}: UltimatePDFViewerProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Logga info för felsökning
  console.log('PDF Debug:', { 
    pdfUrl,
    projectId,
    loading,
    error
  });

  useEffect(() => {
    setLoading(true);
    setError(null);
  }, [pdfUrl]);

  // Hantera framgångsrik laddning av iframe
  const handleIframeLoad = () => {
    setLoading(false);
    if (onLoad) onLoad();
  };

  // Visa felmeddelande om något går fel
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
          PDF URL: {pdfUrl}
        </Typography>
        <Button 
          onClick={() => window.location.reload()}
          variant="solid"
          color="primary"
        >
          Försök igen
        </Button>
      </Box>
    );
  }

  // Optimerad iframe-metod för PDF-visning
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
      
      <iframe
        ref={iframeRef}
        src={pdfUrl}
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        title="PDF Dokument"
        onLoad={handleIframeLoad}
        onError={() => {
          setError('Kunde inte visa PDF-dokumentet. Försök igen senare eller ladda ner filen för att visa lokalt.');
          if (onError) onError(new Error('Iframe loading failed'));
        }}
      />
      
      {/* Enkel verktygsfält med ladda om-knapp */}
      <Box sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        p: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        zIndex: 10
      }}>
        <Button 
          onClick={() => {
            if (iframeRef.current) {
              setLoading(true);
              iframeRef.current.src = pdfUrl;
            }
          }}
          variant="outlined"
          size="sm"
        >
          Ladda om
        </Button>
        
        <Button
          onClick={() => window.open(pdfUrl, '_blank')}
          variant="outlined"
          size="sm"
        >
          Öppna i ny flik
        </Button>
      </Box>
    </Box>
  );
};

export default UltimatePDFViewer;