import { useState, useEffect } from 'react';
import { Box, Typography, Link } from '@mui/joy';

interface PDFEmbedViewerProps {
  pdfUrl: string;
  filename: string;
  width?: string | number;
  height?: string | number;
}

/**
 * PDFEmbedViewer - En komponent för att visa PDF-filer direkt i webbläsaren
 * Använder en kombination av embed, object och iframe för maximal kompatibilitet
 */
const PDFEmbedViewer = ({ pdfUrl, filename, width = '100%', height = '100%' }: PDFEmbedViewerProps) => {
  const [loadFailed, setLoadFailed] = useState(false);
  const [embedAttempt, setEmbedAttempt] = useState(0);
  
  // Om PDF-url:en innehåller en fragment-identifierare (t.ex. #page=1), splittra den
  const urlParts = pdfUrl.split('#');
  const baseUrl = urlParts[0];
  const fragment = urlParts.length > 1 ? '#' + urlParts[1] : '';
  
  // Lägg till en timestamp som query parameter för att förhindra caching
  const urlWithNoCache = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}_t=${Date.now()}${fragment}`;
  
  useEffect(() => {
    setLoadFailed(false);
    setEmbedAttempt(1);
  }, [pdfUrl]);
  
  const handleLoadError = () => {
    if (embedAttempt < 3) {
      // Försök med nästa inbäddningsmetod
      setEmbedAttempt(embedAttempt + 1);
    } else {
      // Om alla metoder misslyckas, visa felmeddelande
      setLoadFailed(true);
    }
  };
  
  return (
    <Box
      sx={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f8f9fa',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {loadFailed ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography level="h4" sx={{ mb: 2 }}>
            Det gick inte att visa PDF-filen
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Din webbläsare kunde inte visa PDF-filen "{filename}".
          </Typography>
          <Link 
            href={pdfUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            sx={{ 
              display: 'inline-block', 
              mt: 2, 
              p: 1.5, 
              bgcolor: 'primary.500', 
              color: 'white',
              borderRadius: 'sm',
              '&:hover': {
                bgcolor: 'primary.600',
                textDecoration: 'none'
              }
            }}
          >
            Öppna PDF i nytt fönster
          </Link>
        </Box>
      ) : embedAttempt === 1 ? (
        // Första försöket: Använd embed tag som är enkel och fungerar bra i många fall
        <embed
          src={urlWithNoCache}
          type="application/pdf"
          width="100%"
          height="100%"
          onError={handleLoadError}
          style={{ border: 'none' }}
        />
      ) : embedAttempt === 2 ? (
        // Andra försöket: Använd object tag som är mer flexibel
        <object
          data={urlWithNoCache}
          type="application/pdf"
          width="100%"
          height="100%"
          onError={handleLoadError}
        >
          <Box component="p" sx={{ p: 2, textAlign: 'center' }}>
            Din webbläsare kan inte visa denna PDF.
            <Link 
              href={pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              sx={{ display: 'block', mt: 1 }}
            >
              Klicka här för att öppna PDF:en
            </Link>
          </Box>
        </object>
      ) : (
        // Tredje försöket: Använd iframe som är mest kompatibel
        <iframe
          src={`${urlWithNoCache}#toolbar=0`}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          title={filename}
          onError={handleLoadError}
          sandbox="allow-same-origin allow-scripts allow-forms"
        />
      )}
    </Box>
  );
};

export default PDFEmbedViewer;