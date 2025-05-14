import { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/joy';
import * as pdfjs from 'pdfjs-dist';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

// Konfigurera arbetaren för PDF.js
// PDF.js globala inställningar
const DEFAULT_URL = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface SimplePDFViewerProps {
  pdfUrl: string;
  title?: string;
}

export default function SimplePDFViewer({ pdfUrl, title }: SimplePDFViewerProps) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState<PDFPageProxy | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0);

  // Ladda PDF
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const loadPdf = async () => {
      try {
        // Vi måste använda den nya API-URLen som vi skapade för att kringgå X-Frame-Options
        // Användning av HTTP istället för HTTPS kan orsaka problem med PDF.js
        const loadingTask = pdfjs.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        setPdf(pdf);
        setNumPages(pdf.numPages);
        
        // Ladda första sidan
        if (pdf) {
          const page = await pdf.getPage(1);
          setPage(page);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Fel vid laddning av PDF:', err);
        setError('Kunde inte ladda PDF-filen. Försök med att öppna den i ett nytt fönster istället.');
        setLoading(false);
      }
    };
    
    loadPdf();
    
    // Rensa vid unmount
    return () => {
      if (page) {
        page.cleanup();
      }
      if (pdf) {
        pdf.destroy();
      }
    };
  }, [pdfUrl]);

  // Rendera sidan
  useEffect(() => {
    if (!page) return;
    
    const canvas = document.getElementById('pdf-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const viewport = page.getViewport({ scale });
    
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    
    page.render(renderContext);
  }, [page, scale]);

  // Byt sida
  const changePage = async (newPage: number) => {
    if (!pdf) return;
    if (newPage < 1 || newPage > numPages) return;
    
    try {
      setLoading(true);
      if (page) {
        page.cleanup();
      }
      
      const newPageObj = await pdf.getPage(newPage);
      setPage(newPageObj);
      setCurrentPage(newPage);
      setLoading(false);
    } catch (err) {
      console.error('Fel vid byte av sida:', err);
      setError('Kunde inte ladda sidan.');
      setLoading(false);
    }
  };

  // Zooma
  const zoom = (delta: number) => {
    setScale(prev => Math.max(0.5, Math.min(3.0, prev + delta)));
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
            boxShadow: 'md', 
            borderRadius: 'md',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <canvas id="pdf-canvas" style={{ maxWidth: '100%' }} />
          </Box>
        )}
      </Box>
      
      {/* Controls */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: 2, 
        p: 2,
        borderTop: '1px solid',
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <button 
            onClick={() => changePage(currentPage - 1)} 
            disabled={currentPage <= 1 || loading}
            style={{ 
              padding: '8px 16px',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Föregående
          </button>
          
          <Typography>
            {currentPage} / {numPages}
          </Typography>
          
          <button 
            onClick={() => changePage(currentPage + 1)} 
            disabled={currentPage >= numPages || loading}
            style={{ 
              padding: '8px 16px',
              cursor: currentPage >= numPages ? 'not-allowed' : 'pointer'
            }}
          >
            Nästa
          </button>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <button 
            onClick={() => zoom(-0.1)} 
            disabled={scale <= 0.5 || loading}
            style={{ 
              padding: '8px 16px',
              cursor: scale <= 0.5 ? 'not-allowed' : 'pointer'
            }}
          >
            Zooma ut
          </button>
          
          <button 
            onClick={() => zoom(0.1)} 
            disabled={scale >= 3.0 || loading}
            style={{ 
              padding: '8px 16px',
              cursor: scale >= 3.0 ? 'not-allowed' : 'pointer'
            }}
          >
            Zooma in
          </button>
        </Box>
      </Box>
    </Box>
  );
}