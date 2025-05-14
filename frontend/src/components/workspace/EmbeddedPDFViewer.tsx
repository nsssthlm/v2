import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/joy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

interface EmbeddedPDFViewerProps {
  pdfUrl: string;
  title?: string;
}

export default function EmbeddedPDFViewer({ pdfUrl, title }: EmbeddedPDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullUrl, setFullUrl] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    if (!pdfUrl) {
      setError('Ingen PDF-URL tillhandahållen');
      setLoading(false);
      return;
    }
    
    try {
      // Hantera URL-format
      let apiUrl = pdfUrl;
      const baseApiUrl = '/api/';
      
      // Kontrollera och formatera URL:en korrekt
      if (apiUrl.startsWith('/api/')) {
        // URL:en har redan /api/ prefix - använd den direkt
        console.log('URL already starts with /api/, using as is:', apiUrl);
      } else if (apiUrl.startsWith('workspace/')) {
        // Om URL:en börjar med workspace/ (utan slash), lägg till /api/ prefix
        apiUrl = baseApiUrl + apiUrl;
        console.log('Added /api/ prefix. New URL:', apiUrl);
      } else if (apiUrl.startsWith('/workspace/')) {
        // Om URL:en börjar med /workspace/, ta bort / och lägg till /api/
        apiUrl = baseApiUrl + apiUrl.substring(1);
        console.log('Fixed URL format with /api/ prefix. New URL:', apiUrl);
      }
      
      // Lägg till auth token till URL
      const token = localStorage.getItem('access_token');
      if (token) {
        // Om URL redan har parametrar, använd &, annars använd ?
        const separator = apiUrl.includes('?') ? '&' : '?';
        apiUrl = `${apiUrl}${separator}token=${token}`;
      }
      
      // Lägg till no-cache parameter för att förhindra caching
      apiUrl = `${apiUrl}&nocache=${new Date().getTime()}`;
      
      // Logga slutlig URL (men dölj token i loggen)
      console.log('Final embedded PDF URL (auth token hidden):', apiUrl.split('token=')[0] + 'token=HIDDEN');
      
      // Sätt URL för iframe
      setFullUrl(apiUrl);
      setLoading(false);
    } catch (err) {
      console.error('Fel vid förberedelse av PDF-URL:', err);
      setError('Kunde inte förbereda PDF-URL.');
      setLoading(false);
    }
  }, [pdfUrl]);

  const openInNewTab = () => {
    window.open(fullUrl, '_blank');
  };

  const downloadPDF = () => {
    const a = document.createElement('a');
    a.href = fullUrl;
    a.setAttribute('download', title || 'document.pdf');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress size="lg" />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography color="danger" level="body-lg" mb={2}>
            {error}
          </Typography>
          <Button 
            onClick={openInNewTab}
            variant="outlined"
            color="primary"
            size="lg"
            startDecorator={<OpenInNewIcon />}
          >
            Försök öppna PDF i nytt fönster
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: 1, 
            p: 1, 
            borderBottom: '1px solid', 
            borderColor: 'divider'
          }}>
            <Button
              size="sm"
              variant="plain"
              color="neutral"
              startDecorator={<OpenInNewIcon />}
              onClick={openInNewTab}
            >
              Öppna i nytt fönster
            </Button>
            <Button
              size="sm"
              variant="plain"
              color="neutral"
              startDecorator={<FileDownloadIcon />}
              onClick={downloadPDF}
            >
              Ladda ner
            </Button>
          </Box>
          
          <Box sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
            <iframe
              src={fullUrl}
              title={title || "PDF Viewer"}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
                overflow: 'hidden'
              }}
              allow="fullscreen"
              sandbox="allow-same-origin allow-scripts allow-forms"
            />
          </Box>
        </>
      )}
    </Box>
  );
}