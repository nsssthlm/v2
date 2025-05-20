import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/joy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LaunchIcon from '@mui/icons-material/Launch';

interface SimpleURLViewerProps {
  pdfUrl: string;
  title?: string;
}

export default function SimpleURLViewer({ pdfUrl, title }: SimpleURLViewerProps) {
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
      
      // Enkel URL utan token
      console.log('PDF URL:', apiUrl);
      
      // Sätt URL för iframe
      setFullUrl(apiUrl);
      setLoading(false);
      
      // Öppna PDF direkt i nytt fönster
      window.open(apiUrl, '_blank');
    } catch (err) {
      console.error('Fel vid förberedelse av PDF-URL:', err);
      setError('Kunde inte förbereda PDF-URL.');
      setLoading(false);
    }
  }, [pdfUrl]);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
      p: 4
    }}>
      {loading ? (
        <CircularProgress size="lg" />
      ) : error ? (
        <Box sx={{ textAlign: 'center' }}>
          <Typography color="danger" level="body-lg" mb={2}>
            {error}
          </Typography>
          <Button 
            onClick={() => window.open(pdfUrl, '_blank')}
            variant="outlined"
            color="primary"
            size="lg"
            startDecorator={<OpenInNewIcon />}
          >
            Försök öppna PDF manuellt
          </Button>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center' }}>
          <Typography level="h3" mb={1}>{title || "PDF"}</Typography>
          <Typography level="body-md" mb={3}>
            PDF-filen har öppnats i ett nytt fönster.
          </Typography>
          
          <Button 
            onClick={() => window.open(fullUrl, '_blank')}
            variant="solid"
            color="primary"
            size="lg"
            startDecorator={<LaunchIcon />}
          >
            Öppna PDF igen
          </Button>
          
          <Typography level="body-sm" mt={4} mb={2} color="neutral">
            Vill du istället ladda ner filen?
          </Typography>
          
          <Button 
            onClick={() => {
              const a = document.createElement('a');
              a.href = fullUrl;
              a.setAttribute('download', title || 'document.pdf');
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
            variant="outlined"
            color="neutral"
            size="md"
          >
            Ladda ner PDF
          </Button>
        </Box>
      )}
    </Box>
  );
}