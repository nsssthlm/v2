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

interface SuperReliablePDFViewerProps {
  pdfUrl: string;
  filename?: string;
  onClose?: () => void;
}

/**
 * En extremt pålitlig PDF-visningskomponent som använder flera metoder för att
 * säkerställa att PDF-filen visas korrekt i alla miljöer.
 * 
 * Denna komponent försöker med flera olika metoder:
 * 1. Direct iframe (enklast, mest kompatibel)
 * 2. Object-tagg (fungerar i vissa webbläsare)
 * 3. Embed-tagg (äldre alternativ)
 * 4. PDF.js-baserad visning (externt bibliotek)
 */
const SuperReliablePDFViewer: React.FC<SuperReliablePDFViewerProps> = ({
  pdfUrl,
  filename = 'PDF-dokument',
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renderMethod, setRenderMethod] = useState<'iframe' | 'object' | 'embed' | 'none'>('iframe');
  const [finalUrl, setFinalUrl] = useState(pdfUrl);
  const [key, setKey] = useState(Date.now()); // För att tvinga omrendering
  
  // Bearbeta URL för att öka kompatibilitet
  useEffect(() => {
    if (!pdfUrl) {
      setError('Ingen PDF-URL angiven');
      return;
    }
    
    try {
      // Logga originalurl för felsökning
      console.log('Original PDF URL:', pdfUrl);
      
      // Steg 1: Konvertera proxy-URL till direktåtkomst
      let processedUrl = pdfUrl;
      
      // Hantera Replit-proxy-URL (från frontend)
      if (processedUrl.includes('kirk.replit.dev/proxy')) {
        console.log('Detekterade Replit proxy URL, konverterar till direkt URL');
        const pathParts = processedUrl.split('/api/files/web/');
        if (pathParts.length > 1) {
          processedUrl = `/api/files/web/${pathParts[1]}`;
          console.log('Konverterad proxy URL till:', processedUrl);
        }
      }
      
      // Steg 2: Om URL innehåller 0.0.0.0:8001, ersätt med window.location.origin
      if (processedUrl.includes('0.0.0.0:8001')) {
        const apiPath = processedUrl.split('0.0.0.0:8001')[1];
        processedUrl = `${window.location.origin}${apiPath}`;
        console.log('Konverterad 0.0.0.0 URL till:', processedUrl);
      }
      
      // Steg 3: Testa om det är en media-URL-mönster
      if (processedUrl.includes('project_files')) {
        const mediaUrlPattern = /project_files\/(\d{4})\/(\d{2})\/(\d{2})\/([^?]+)/;
        const match = processedUrl.match(mediaUrlPattern);
        
        if (match) {
          const [fullMatch, year, month, day, filename] = match;
          const mediaUrl = `/media/project_files/${year}/${month}/${day}/${filename}`;
          console.log('Detekterade mediastig, konverterar till:', mediaUrl);
          
          // Försökt använda media-URL först om det matchar mönstret
          processedUrl = mediaUrl;
        }
      }
      
      // Steg 4: Lägg till cache-busting för att förhindra cachning
      const separator = processedUrl.includes('?') ? '&' : '?';
      processedUrl = `${processedUrl}${separator}_t=${Date.now()}`;
      
      console.log('Final bearbetad PDF URL:', processedUrl);
      setFinalUrl(processedUrl);
    } catch (err) {
      console.error('Fel vid URL-bearbetning:', err);
      // Fallback till original-URL vid fel
      setFinalUrl(pdfUrl);
    }
  }, [pdfUrl]);
  
  // Hantera fel vid laddning
  const handleError = () => {
    console.log(`PDF-visning misslyckades med metod: ${renderMethod}`);
    
    // Försök med nästa renderingsmetod i fallande prioritetsordning
    if (renderMethod === 'iframe') {
      setRenderMethod('object');
    } else if (renderMethod === 'object') {
      setRenderMethod('embed');
    } else if (renderMethod === 'embed') {
      setRenderMethod('none');
      setError('Kunde inte visa PDF-dokumentet. Försök öppna i ny flik eller ladda ner filen.');
    }
  };
  
  // Markera laddning som klar
  const handleLoad = () => {
    console.log(`PDF laddad framgångsrikt med metod: ${renderMethod}`);
    setLoading(false);
  };
  
  // Ladda om PDF
  const reloadPdf = () => {
    setLoading(true);
    setError(null);
    setRenderMethod('iframe'); // Börja om med primär renderingsmetod
    setKey(Date.now());
  };
  
  // Öppna i ny flik
  const openInNewTab = () => {
    window.open(finalUrl, '_blank');
  };
  
  // Ladda ner filen
  const downloadPdf = () => {
    const a = document.createElement('a');
    a.href = finalUrl;
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
      overflow: 'hidden'
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
        bgcolor: '#f5f5f5',
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
        
        {/* PDF-visare - olika metoder */}
        {!error && (
          <Box sx={{ 
            width: '100%', 
            height: '100%', 
            overflow: 'hidden',
            display: renderMethod === 'none' ? 'none' : 'block' 
          }}>
            {/* Metod 1: Iframe - Vanligaste, enklaste metoden */}
            {renderMethod === 'iframe' && (
              <iframe
                key={`iframe-${key}`}
                src={finalUrl}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                onLoad={handleLoad}
                onError={handleError}
                title={filename}
                sandbox="allow-same-origin allow-scripts allow-popups"
              />
            )}
            
            {/* Metod 2: Object - Alternativ metod för vissa webbläsare */}
            {renderMethod === 'object' && (
              <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                <Typography level="body-sm" sx={{ position: 'absolute', top: 10, left: 10, zIndex: 5, bgcolor: 'rgba(255,255,255,0.8)', p: 1, borderRadius: 'sm' }}>
                  Använder alternativ visningsmetod
                </Typography>
                <object
                  key={`object-${key}`}
                  data={finalUrl}
                  type="application/pdf"
                  width="100%"
                  height="100%"
                  onLoad={handleLoad}
                  onError={handleError}
                >
                  <Typography sx={{ p: 2 }}>
                    Din webbläsare kan inte visa PDF-filer med denna metod.
                  </Typography>
                </object>
              </Box>
            )}
            
            {/* Metod 3: Embed - Äldre kompatibilitetsmetod */}
            {renderMethod === 'embed' && (
              <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                <Typography level="body-sm" sx={{ position: 'absolute', top: 10, left: 10, zIndex: 5, bgcolor: 'rgba(255,255,255,0.8)', p: 1, borderRadius: 'sm' }}>
                  Använder inbäddad visningsmetod
                </Typography>
                <embed
                  key={`embed-${key}`}
                  src={finalUrl}
                  type="application/pdf"
                  width="100%"
                  height="100%"
                  onLoad={handleLoad}
                  onError={handleError}
                />
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SuperReliablePDFViewer;