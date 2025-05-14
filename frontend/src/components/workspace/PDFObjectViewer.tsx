import React, { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/joy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PDFObject from 'pdfobject';

interface PDFObjectViewerProps {
  pdfUrl: string;
  title?: string;
}

export default function PDFObjectViewer({ pdfUrl, title }: PDFObjectViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [finalUrl, setFinalUrl] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

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
      console.log('Final PDF URL (auth token hidden):', apiUrl.split('token=')[0] + 'token=HIDDEN');
      
      // Sätt slutlig URL
      setFinalUrl(apiUrl);
      
      // Om containerRef finns, försök att rendera PDF med PDFObject
      if (containerRef.current) {
        const options = {
          height: "100%",
          pdfOpenParams: {
            navpanes: 1,
            toolbar: 1,
            statusbar: 1,
            view: "FitH"
          }
        };
        
        // PDFObject hanterare
        setTimeout(() => {
          if (containerRef.current) {
            const success = PDFObject.embed(apiUrl, containerRef.current, options);
            
            if (success) {
              console.log('PDF successfully embedded');
            } else {
              console.error('PDF could not be embedded, falling back to other methods');
              setError('PDF kunde inte visas. Försök att öppna i nytt fönster.');
            }
            setLoading(false);
          }
        }, 300); // Kort fördröjning för att säkerställa att DOM-elementet är redo
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Fel vid förberedelse av PDF-URL:', err);
      setError('Kunde inte förbereda PDF-URL.');
      setLoading(false);
    }
  }, [pdfUrl]);

  const openInNewTab = () => {
    window.open(finalUrl, '_blank');
  };

  const downloadPDF = () => {
    const a = document.createElement('a');
    a.href = finalUrl;
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
          
          <Box 
            ref={containerRef}
            sx={{ 
              flexGrow: 1, 
              position: 'relative', 
              overflow: 'hidden',
              '& .pdfobject-container': {
                height: '100%',
                width: '100%'
              },
              '& .pdfobject': {
                height: '100%',
                width: '100%',
                border: 'none'
              }
            }}
          >
            {/* PDFObject kommer att injicera PDF-visaren här */}
          </Box>
        </>
      )}
    </Box>
  );
}