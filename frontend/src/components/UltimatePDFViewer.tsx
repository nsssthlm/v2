import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Sheet, 
  CircularProgress
} from '@mui/joy';

// MUI ikoner
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';

interface UltimatePDFViewerProps {
  pdfUrl: string;
  filename?: string;
  onClose?: () => void;
}

/**
 * En extremt pålitlig PDF-visningskomponent som använder flera metoder för att
 * säkerställa att PDF-filen visas korrekt i alla miljöer.
 * 
 * Denna lägger samtliga renderingsmetoder i DOM:en samtidigt men bara en visas,
 * vilket maximerar chansen att PDF:en visas oavsett webbläsare eller miljö.
 */
const UltimatePDFViewer: React.FC<UltimatePDFViewerProps> = ({
  pdfUrl,
  filename = 'PDF-dokument',
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [primaryUrl, setPrimaryUrl] = useState(pdfUrl);
  const [mediaUrl, setMediaUrl] = useState('');
  const [directUrl, setDirectUrl] = useState('');
  const [key, setKey] = useState(Date.now()); // För att tvinga omrendering
  
  // Bearbeta URL för att skapa flera alternativa URL:er
  useEffect(() => {
    if (!pdfUrl) {
      setError('Ingen PDF-URL angiven');
      return;
    }
    
    try {
      console.log('Original PDF URL:', pdfUrl);
      
      // Primär URL - lägg till cache-busting
      const separator = pdfUrl.includes('?') ? '&' : '?';
      const urlWithNocache = `${pdfUrl}${separator}_t=${Date.now()}`;
      setPrimaryUrl(urlWithNocache);
      
      // Sekundär URL - media URL om det är en projektfil
      if (pdfUrl.includes('project_files')) {
        const mediaPattern = /project_files\/(\d{4})\/(\d{2})\/(\d{2})\/([^?]+)/;
        const match = pdfUrl.match(mediaPattern);
        
        if (match) {
          const [_, year, month, day, filename] = match;
          const mediaPath = `/media/project_files/${year}/${month}/${day}/${filename}`;
          setMediaUrl(`${mediaPath}?_t=${Date.now()}`);
          console.log('Media URL skapad:', mediaPath);
        }
      }
      
      // Direkt server URL - om det är en proxy URL
      if (pdfUrl.includes('kirk.replit.dev/proxy')) {
        // Extrahera API path
        const pathParts = pdfUrl.split('/api/');
        if (pathParts.length > 1) {
          const apiPath = `/api/${pathParts[1]}`;
          setDirectUrl(`${apiPath}?_t=${Date.now()}`);
          console.log('Direkt URL skapad:', apiPath);
        }
      }
      
      // Om URL:en innehåller 0.0.0.0, skapa en direkt variant
      if (pdfUrl.includes('0.0.0.0:8001')) {
        const parts = pdfUrl.split('0.0.0.0:8001');
        if (parts.length > 1) {
          setDirectUrl(`${parts[1]}?_t=${Date.now()}`);
          console.log('Direkt URL från 0.0.0.0:', parts[1]);
        }
      }
    } catch (err) {
      console.error('Fel vid URL-bearbetning:', err);
      // Vid fel, använd bara original URL:en
      setPrimaryUrl(pdfUrl);
    }
  }, [pdfUrl]);
  
  // Markera laddning som klar
  const handleLoad = () => {
    console.log('PDF laddad framgångsrikt');
    setLoading(false);
  };
  
  // Ladda om PDF med nya nycklar
  const reloadPdf = () => {
    setLoading(true);
    setError(null);
    setKey(Date.now());
  };
  
  // Öppna i ny flik
  const openInNewTab = () => {
    window.open(primaryUrl, '_blank');
  };
  
  // Ladda ner filen
  const downloadPdf = () => {
    const a = document.createElement('a');
    a.href = primaryUrl;
    a.download = filename || 'document.pdf';
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
      overflow: 'hidden',
      bgcolor: '#f5f5f5'
    }}>
      {/* Header */}
      <Sheet sx={{ 
        p: 2, 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {onClose && (
            <IconButton 
              onClick={onClose} 
              variant="plain" 
              color="neutral"
              size="sm"
            >
              <CloseIcon />
            </IconButton>
          )}
          <Typography level="title-md">{filename}</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            size="sm" 
            variant="plain" 
            startDecorator={<RefreshIcon />}
            onClick={reloadPdf}
          >
            Ladda om
          </Button>
          
          <Button 
            size="sm" 
            variant="plain" 
            startDecorator={<OpenInNewIcon />}
            onClick={openInNewTab}
          >
            Öppna i ny flik
          </Button>
          
          <Button 
            size="sm" 
            variant="plain" 
            startDecorator={<FileDownloadIcon />}
            onClick={downloadPdf}
          >
            Ladda ner
          </Button>
        </Box>
      </Sheet>
      
      {/* Content */}
      <Box sx={{ 
        flex: 1, 
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Laddningsindikator */}
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
            zIndex: 10,
            bgcolor: 'rgba(255,255,255,0.85)'
          }}>
            <CircularProgress size="lg" />
            <Typography level="body-sm" sx={{ mt: 2 }}>
              Laddar PDF...
            </Typography>
          </Box>
        )}
        
        {/* Felmeddelande */}
        {error && (
          <Box sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            textAlign: 'center'
          }}>
            <Typography level="h4" color="danger" sx={{ mb: 2 }}>
              Kunde inte visa PDF-filen
            </Typography>
            <Typography sx={{ mb: 3 }}>
              {error}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                onClick={reloadPdf}
                variant="soft"
                startDecorator={<RefreshIcon />}
              >
                Försök igen
              </Button>
              <Button 
                onClick={openInNewTab}
                variant="solid"
                startDecorator={<OpenInNewIcon />}
              >
                Öppna i ny flik
              </Button>
            </Box>
          </Box>
        )}
        
        {!error && (
          <Box sx={{ 
            position: 'relative', 
            width: '100%', 
            height: '100%',
            overflow: 'hidden'
          }}>
            {/* Visa alla renderingsmetoder samtidigt, men bara en synlig i taget */}
            {/* Primär renderare - iframe */}
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%',
              zIndex: 1
            }}>
              <iframe
                key={`iframe-${key}`}
                src={primaryUrl}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                onLoad={handleLoad}
                title={`${filename} (Primär)`}
                sandbox="allow-same-origin allow-scripts allow-popups"
              />
            </Box>
            
            {/* Sekundär renderare - om vi har en media URL */}
            {mediaUrl && (
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%',
                zIndex: loading ? 2 : 0,
                opacity: loading ? 1 : 0,
                transition: 'opacity 0.3s'
              }}>
                <iframe
                  key={`iframe-media-${key}`}
                  src={mediaUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                  onLoad={handleLoad}
                  title={`${filename} (Media)`}
                  sandbox="allow-same-origin allow-scripts allow-popups"
                />
              </Box>
            )}
            
            {/* Tertiär renderare - om vi har en direkt URL */}
            {directUrl && (
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%',
                zIndex: loading ? 3 : 0,
                opacity: loading ? 1 : 0,
                transition: 'opacity 0.3s'
              }}>
                <iframe
                  key={`iframe-direct-${key}`}
                  src={directUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                  onLoad={handleLoad}
                  title={`${filename} (Direkt)`}
                  sandbox="allow-same-origin allow-scripts allow-popups"
                />
              </Box>
            )}
            
            {/* Object-tag fallback */}
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%',
              zIndex: 0,
              opacity: loading ? 1 : 0,
              visibility: loading ? 'visible' : 'hidden'
            }}>
              <object
                key={`object-${key}`}
                data={primaryUrl}
                type="application/pdf"
                width="100%"
                height="100%"
                onLoad={handleLoad}
              >
                <Typography sx={{ p: 2 }}>
                  Din webbläsare kan inte visa PDF-filer med denna metod.
                </Typography>
              </object>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default UltimatePDFViewer;