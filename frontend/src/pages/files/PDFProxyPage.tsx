import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button } from '@mui/joy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { fetchAndCreateBlobUrl } from './ProxyPDFService';

/**
 * Denna sida fungerar som en proxy för att visa PDF-filer via PDF.js
 * Den löser mixed-content problem genom att ladda PDF-filen i samma domän
 */
const PDFProxyPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processedPdfUrl, setProcessedPdfUrl] = useState<string | null>(null);
  
  // Hämta URL och returnera-URL från parametrarna
  const pdfUrl = searchParams.get('url');
  const returnPath = searchParams.get('return') || '/folders';
  const title = searchParams.get('title') || 'PDF Dokument';

  useEffect(() => {
    if (!pdfUrl) {
      setError('Ingen PDF URL angiven');
      setLoading(false);
      return;
    }

    // Hämta PDF via vår proxy-tjänst för att undvika Mixed Content-fel
    const fetchPdf = async () => {
      try {
        setLoading(true);
        // Använd vår proxy-tjänst för att konvertera HTTP-URL till blob URL
        const safeUrl = await fetchAndCreateBlobUrl(pdfUrl);
        setProcessedPdfUrl(safeUrl);
      } catch (err: any) {
        console.error('Fel vid hämtning av PDF:', err);
        setError(`Kunde inte ladda PDF: ${err.message || 'Okänt fel'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPdf();

    // Rensa blob URL när komponenten avmonteras
    return () => {
      if (processedPdfUrl && processedPdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(processedPdfUrl);
      }
    };
  }, [pdfUrl]);

  if (error) {
    return (
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Typography level="h3">Ett fel uppstod</Typography>
        <Typography>{error}</Typography>
        <Button 
          startDecorator={<ArrowBackIcon />}
          onClick={() => navigate(returnPath)}
        >
          Tillbaka
        </Button>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size="lg" />
        <Typography level="body-md">Laddar PDF-visare...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        gap: 2
      }}>
        <Button 
          variant="outlined"
          startDecorator={<ArrowBackIcon />}
          onClick={() => navigate(returnPath)}
        >
          Tillbaka
        </Button>
        <Typography level="title-lg">{title}</Typography>
      </Box>
      
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        {processedPdfUrl && (
          <iframe
            src={`/pdfjs-viewer.html?url=${encodeURIComponent(processedPdfUrl)}`}
            style={{ 
              width: '100%', 
              height: '100%', 
              border: 'none',
              position: 'absolute',
              top: 0,
              left: 0,
              backgroundColor: '#f5f5f5'
            }}
            title="PDF Viewer"
            allow="fullscreen"
          />
        )}
      </Box>
    </Box>
  );
};

export default PDFProxyPage;