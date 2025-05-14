import { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/joy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import api from '../../services/api';

interface SimplePDFViewerProps {
  pdfUrl: string;
  title?: string;
}

export default function SimplePDFViewer({ pdfUrl, title }: SimplePDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Ladda PDF-innehållet med autentisering
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    if (!pdfUrl) {
      setError('Ingen PDF-URL tillhandahållen');
      setLoading(false);
      return;
    }
    
    // Använd axios för att hämta PDF-filen med autentisering
    const fetchPdf = async () => {
      try {
        // Skapa korrekt URL för backend-begäran
        let apiUrl = pdfUrl;
        
        // Om URL:en inte börjar med /api/, lägg till det
        if (!pdfUrl.startsWith('/api/')) {
          // Om URL:en börjar med /workspace/, lägg till /api före
          if (pdfUrl.startsWith('/workspace/')) {
            apiUrl = `/api${pdfUrl}`;
          }
        }
        
        // Ta bort eventuella http://0.0.0.0:8001/api prefix 
        apiUrl = apiUrl.replace(/^http:\/\/0\.0\.0\.0:8001\/api/, '/api');
            
        console.log('Fetching PDF from URL:', apiUrl);
        
        // Ladda ner PDF som blob med autentiserade begäran
        const response = await api.get(apiUrl, {
          responseType: 'blob'
        });
        
        // Skapa en blob URL från responsen
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        setObjectUrl(url);
        setLoading(false);
      } catch (err) {
        console.error('Fel vid hämtning av PDF:', err);
        setError('Kunde inte ladda PDF-dokumentet. Försök öppna i nytt fönster istället.');
        setLoading(false);
      }
    };
    
    fetchPdf();
    
    // Rensa blob URL när komponenten avmonteras
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [pdfUrl]);

  // Hantera iframe fel
  const handleIframeError = () => {
    console.error('Kunde inte ladda PDF i iframe');
    setError('Kunde inte ladda PDF-dokumentet. Försök öppna i nytt fönster istället.');
    setLoading(false);
  };

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        p: 2 
      }}>
        <Typography color="danger" level="body-lg">
          {error}
        </Typography>
        <Button 
          onClick={() => window.open(pdfUrl, '_blank')}
          variant="outlined"
          color="primary"
          size="sm"
          startDecorator={<OpenInNewIcon />}
          sx={{ mt: 2 }}
        >
          Öppna i nytt fönster
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%' 
    }}>
      {/* PDF viewer */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        overflow: 'auto',
        p: 2 
      }}>
        {loading ? (
          <CircularProgress size="lg" />
        ) : (
          <Box sx={{ 
            width: '100%',
            height: '100%',
            boxShadow: 'md', 
            borderRadius: 'md',
            backgroundColor: 'white',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {objectUrl ? (
              <iframe
                ref={iframeRef}
                src={objectUrl}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  border: 'none',
                  backgroundColor: 'white',
                  minHeight: '600px',
                  maxWidth: '100%',
                  display: 'block', // Säkerställ att iframe visas i block-läge
                  margin: 0,
                  padding: 0
                }}
                onError={handleIframeError}
                title={title || "PDF Dokument"}
                sandbox="allow-same-origin allow-scripts"
                allow="fullscreen"
              />
            ) : (
              <Typography level="body-md">
                Laddar PDF-innehåll...
              </Typography>
            )}
          </Box>
        )}
      </Box>
      
      {/* Controls */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        p: 2,
        borderTop: '1px solid',
        borderColor: 'divider'
      }}>
        <Button 
          onClick={() => window.open(pdfUrl, '_blank')}
          variant="outlined"
          color="primary"
          size="sm"
          startDecorator={<OpenInNewIcon />}
        >
          Öppna i nytt fönster
        </Button>
      </Box>
    </Box>
  );
}