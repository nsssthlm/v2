import { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/joy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import api from '../../services/api';

// För PDF.js
import { pdfjs } from 'pdfjs-dist';

// Sätt upp arbetare för PDF.js lokalt
// Detta sätter upp PDF.js arbetare på ett sätt som fungerar med Vite
const pdfjsVersion = '4.0.379'; // Kontrollera att denna version stämmer med installerad version
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;

interface AdvancedPDFViewerProps {
  pdfUrl: string;
  title?: string;
}

export default function AdvancedPDFViewer({ pdfUrl, title }: AdvancedPDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDocument, setPdfDocument] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.5);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Ladda PDF-innehållet med autentisering
  useEffect(() => {
    setLoading(true);
    setError(null);
    setPdfDocument(null);
    
    if (!pdfUrl) {
      setError('Ingen PDF-URL tillhandahållen');
      setLoading(false);
      return;
    }
    
    const loadPDF = async () => {
      try {
        // Förbered URL för API-anrop
        let apiUrl = pdfUrl;
        
        // Kontrollera och rensa URL:en för att undvika dubbla /api/ prefix
        if (apiUrl.startsWith('/api/')) {
          // URL:en har redan /api/ prefix - använd den direkt men ta bort /api/ prefixet eftersom api.get kommer att lägga till det
          apiUrl = apiUrl.substring(5); // Ta bort de första 5 tecknen (/api/)
          console.log('Removed /api/ prefix since Axios will add it. New URL:', apiUrl);
        } else if (apiUrl.startsWith('workspace/')) {
          // Om URL:en börjar med workspace/ (utan slash), använd den direkt
          console.log('URL starts with workspace/, using as is:', apiUrl);
        } else if (apiUrl.startsWith('/workspace/')) {
          // Om URL:en börjar med /workspace/, ta bort den inledande slashen
          apiUrl = apiUrl.substring(1);
          console.log('Removed leading slash from /workspace/, new URL:', apiUrl);
        }
        
        // Logga den slutliga URL:en som används
        console.log('Final API URL for PDF fetch:', apiUrl);
        
        // Hämta PDF-data som array buffer
        const response = await api.get(apiUrl, {
          responseType: 'arraybuffer'
        });
        
        // Ladda PDF med PDF.js
        const loadingTask = pdfjsLib.getDocument({ data: response.data });
        const pdf = await loadingTask.promise;
        
        setPdfDocument(pdf);
        setNumPages(pdf.numPages);
        setLoading(false);
      } catch (err) {
        console.error('Fel vid laddning av PDF:', err);
        setError('Kunde inte ladda PDF-dokumentet. Försök öppna i nytt fönster istället.');
        setLoading(false);
      }
    };
    
    loadPDF();
    
    // Städa upp när komponenten avmonteras
    return () => {
      if (pdfDocument) {
        pdfDocument.destroy().catch(console.error);
      }
    };
  }, [pdfUrl]);

  // Rendera aktuell sida när pdfDocument eller currentPage ändras
  useEffect(() => {
    if (!pdfDocument || !canvasRef.current) return;
    
    const renderPage = async () => {
      try {
        const page = await pdfDocument.getPage(currentPage);
        const viewport = page.getViewport({ scale });
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const context = canvas.getContext('2d');
        if (!context) return;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: context,
          viewport
        };
        
        await page.render(renderContext).promise;
      } catch (err) {
        console.error('Fel vid rendering av PDF-sida:', err);
        setError('Kunde inte rendera PDF-sidan.');
      }
    };
    
    renderPage();
  }, [pdfDocument, currentPage, scale]);

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
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        overflow: 'auto',
        p: 2,
        bgcolor: 'background.level1', 
        borderRadius: 'md'
      }}>
        {loading ? (
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
            <canvas ref={canvasRef} />
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
            {currentPage} / {numPages}
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