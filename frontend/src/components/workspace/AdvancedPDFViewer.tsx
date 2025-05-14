import { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/joy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import api from '../../services/api';

// För PDF.js
import * as pdfjsLib from 'pdfjs-dist';
import { pdfjs } from 'react-pdf';

// Sätt upp arbetare för PDF.js (via react-pdf som redan har konfigurerat arbetare)
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface AdvancedPDFViewerProps {
  pdfUrl: string;
  title?: string;
}

import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

export default function AdvancedPDFViewer({ pdfUrl, title }: AdvancedPDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.5);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fullPdfUrl, setFullPdfUrl] = useState<string>('');

  // Förbered URL för PDF-visning
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
      
      // Kontrollera och rensa URL:en för att undvika dubbla /api/ prefix
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
      
      // Lägg till auth token till URL för att undvika CORS-problem
      const token = localStorage.getItem('access_token');
      if (token) {
        // Om URL redan har parametrar, använd &, annars använd ?
        const separator = apiUrl.includes('?') ? '&' : '?';
        apiUrl = `${apiUrl}${separator}token=${token}`;
      }
      
      // Logga slutlig URL (men dölj token i loggen)
      console.log('Final PDF URL (auth token hidden):', apiUrl.split('token=')[0] + 'token=HIDDEN');
      
      setFullPdfUrl(apiUrl);
      setLoading(false);
    } catch (err) {
      console.error('Fel vid förberedelse av PDF-URL:', err);
      setError('Kunde inte förbereda PDF-URL.');
      setLoading(false);
    }
  }, [pdfUrl]);

  // Hanterar framgångsrik inläsning av dokument
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    console.log('PDF document loaded successfully with', numPages, 'pages');
  }
  
  // Hanterar fel vid dokumentinläsning
  function onDocumentLoadError(error: Error) {
    console.error('Error loading PDF document:', error);
    setError(`Kunde inte ladda PDF-dokumentet: ${error.message}`);
    setLoading(false);
  }

  // Navigera mellan sidor
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Zooma in/ut
  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 3.0));
  };
  
  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
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
      {/* PDF-visningsområde */}
      <Box 
        ref={containerRef}
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          overflow: 'auto',
          p: 2,
          bgcolor: 'background.level1', 
          borderRadius: 'md'
        }}
      >
        {loading && !fullPdfUrl ? (
          <CircularProgress size="lg" sx={{ my: 4 }} />
        ) : (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              boxShadow: 'md', 
              borderRadius: 'md',
              bgcolor: 'white',
              overflow: 'auto',
              p: 1,
              width: '100%',
              maxWidth: '100%',
              height: '100%'
            }}
          >
            <Document
              file={fullPdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<CircularProgress />}
              error={
                <Typography color="danger" level="body-md">
                  Kunde inte ladda dokumentet
                </Typography>
              }
            >
              <Page 
                pageNumber={currentPage}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                loading={<CircularProgress />}
                error={
                  <Typography color="danger" level="body-md">
                    Kunde inte visa sidan
                  </Typography>
                }
              />
            </Document>
          </Box>
        )}
      </Box>
      
      {/* Kontrollknappar */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: 2,
        p: 2,
        borderTop: '1px solid',
        borderColor: 'divider'
      }}>
        <Button 
          onClick={zoomOut}
          variant="outlined"
          color="neutral"
          size="sm"
          disabled={loading || scale <= 0.5}
        >
          Zooma ut
        </Button>
        
        <Button 
          onClick={zoomIn}
          variant="outlined"
          color="neutral"
          size="sm"
          disabled={loading || scale >= 3.0}
        >
          Zooma in
        </Button>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1, 
          mx: 2
        }}>
          <Button 
            onClick={goToPreviousPage}
            variant="outlined"
            color="primary"
            size="sm"
            disabled={loading || currentPage <= 1}
          >
            Föregående
          </Button>
          
          <Typography>
            {currentPage} / {numPages || 1}
          </Typography>
          
          <Button 
            onClick={goToNextPage}
            variant="outlined"
            color="primary"
            size="sm"
            disabled={loading || currentPage >= numPages}
          >
            Nästa
          </Button>
        </Box>
        
        <Button 
          onClick={() => window.open(fullPdfUrl || pdfUrl, '_blank')}
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