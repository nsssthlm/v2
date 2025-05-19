import React, { useState, useEffect, useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CircularProgress from '@mui/material/CircularProgress';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist';
import axios from 'axios';

// Konfigurera PDF.js worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

interface DirectPDFViewerProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  filename: string;
  projectId?: number | string | null;
  folderId?: number | string | null;
}

export default function DirectPDFViewer(props: DirectPDFViewerProps) {
  const { open, onClose, pdfUrl, filename, projectId, folderId } = props;
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.5);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Extrahera fil-ID från filnamn eller URL
  const extractFileId = () => {
    let fileId = null;
    
    // Försök extrahera från filnamn (format: namn-ID.pdf)
    if (filename) {
      const filenameMatch = filename.match(/.*-(\d+)(\.pdf)?$/i);
      if (filenameMatch && filenameMatch[1]) {
        fileId = filenameMatch[1];
        console.log('Extraktion från filnamn:', fileId);
        return fileId;
      }
    }
    
    // Försök extrahera från URL (format: /web/namn-ID/data/)
    if (pdfUrl && pdfUrl.includes('/web/')) {
      const webMatch = pdfUrl.match(/\/web\/([^\/]+)\/data\//);
      if (webMatch && webMatch[1]) {
        const parts = webMatch[1].split('-');
        if (parts.length > 1) {
          fileId = parts[parts.length - 1];
          console.log('Extraktion från URL path:', fileId);
          return fileId;
        }
      }
    }
    
    // Försök hitta numeriskt ID direkt i URL
    if (pdfUrl) {
      const idMatch = pdfUrl.match(/\/(\d+)\//);
      if (idMatch && idMatch[1]) {
        fileId = idMatch[1];
        console.log('Extraktion från numeriskt ID i URL:', fileId);
        return fileId;
      }
    }
    
    return null;
  };

  // Ladda PDF-innehåll via direktanrop till API:et
  const loadPdfFromApi = async (fileId: string) => {
    try {
      const apiUrl = `${window.location.origin}/api/files/get-file-content/${fileId}/`;
      console.log('Laddar PDF via API:', apiUrl);
      
      // Hämta PDF som ArrayBuffer via Axios
      const response = await axios.get(apiUrl, {
        responseType: 'arraybuffer',
        withCredentials: true,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
      
      // Ladda PDF från ArrayBuffer
      const pdfData = new Uint8Array(response.data);
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      
      setPdfDocument(pdf);
      setNumPages(pdf.numPages);
      setCurrentPage(1);
      setLoading(false);
      
      return true;
    } catch (error) {
      console.error('Kunde inte hämta PDF via API:', error);
      return false;
    }
  };

  // Ladda PDF från URL
  const loadPdfFromUrl = async (url: string) => {
    try {
      console.log('Laddar PDF från URL:', url);
      
      // Fixa 0.0.0.0:8001 URL:er i Replit-miljön
      let fetchUrl = url;
      if (fetchUrl.includes('0.0.0.0:8001')) {
        const urlPath = new URL(fetchUrl).pathname;
        fetchUrl = `${window.location.origin}${urlPath}`;
        console.log('Konverterad URL:', fetchUrl);
      }
      
      // Lägg till cache-busting
      fetchUrl = `${fetchUrl}${fetchUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
      
      // Konfigurera options för PDF.js
      const options: any = {
        url: fetchUrl,
        withCredentials: true
      };
      
      // Lägg till JWT token om tillgänglig
      const token = localStorage.getItem('jwt_token');
      if (token) {
        options.httpHeaders = {
          'Authorization': `Bearer ${token}`
        };
      }
      
      // Ladda PDF med PDF.js
      const loadingTask = pdfjsLib.getDocument(options);
      const pdf = await loadingTask.promise;
      
      setPdfDocument(pdf);
      setNumPages(pdf.numPages);
      setCurrentPage(1);
      setLoading(false);
      
      return true;
    } catch (error) {
      console.error('Kunde inte ladda PDF från URL:', error);
      return false;
    }
  };

  // Ladda PDF när komponenten monteras
  useEffect(() => {
    if (!open) return;
    
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('PDF original URL:', pdfUrl);
        console.log('Filnamn:', filename);
        
        // Försök hämta fil-ID från filnamn eller URL
        const fileId = extractFileId();
        
        // 1. Om vi har ett fil-ID, försök hämta via API först
        if (fileId) {
          const apiSuccess = await loadPdfFromApi(fileId);
          if (apiSuccess) return;
        }
        
        // 2. Om API-anropet misslyckades eller om vi inte har fil-ID, 
        // försök med direkt URL
        const urlSuccess = await loadPdfFromUrl(pdfUrl);
        if (urlSuccess) return;
        
        // 3. Om båda metoderna misslyckades, visa felmeddelande
        setError('Kunde inte ladda PDF-dokumentet. Försök igen eller kontakta support.');
        setLoading(false);
      } catch (error) {
        console.error('Allmänt fel vid PDF-laddning:', error);
        setError('Ett fel uppstod vid laddning av PDF-dokumentet.');
        setLoading(false);
      }
    };
    
    loadPdf();
    
    // Städa upp när komponenten avmonteras
    return () => {
      if (pdfDocument) {
        pdfDocument.destroy().catch(console.error);
      }
    };
  }, [open, pdfUrl, filename]);

  // Rendera aktuell sida
  useEffect(() => {
    if (!pdfDocument || !canvasRef.current) return;
    
    const renderPage = async () => {
      try {
        const page = await pdfDocument.getPage(currentPage);
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Anpassa vyportens storlek
        const viewport = page.getViewport({ scale });
        const context = canvas.getContext('2d');
        if (!context) return;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Rendera PDF-sidan
        await page.render({
          canvasContext: context,
          viewport
        }).promise;
      } catch (e) {
        console.error('Fel vid rendering av PDF-sida:', e);
        setError('Kunde inte visa PDF-sidan.');
      }
    };
    
    renderPage();
  }, [pdfDocument, currentPage, scale]);

  // Navigeringskontroller
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

  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 3));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.6));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{ 
        '& .MuiDialog-paper': { 
          minWidth: 800,
          maxWidth: '95vw',
          minHeight: 600,
          maxHeight: '90vh'
        } 
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 1 }}>
        <Typography variant="h6" component="div">
          {filename}
        </Typography>
        <IconButton
          edge="end"
          onClick={onClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', padding: 2 }}>
        {/* Navigeringsbar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              startIcon={<ArrowBackIcon />}
              onClick={goToPreviousPage}
              disabled={currentPage <= 1 || loading}
            >
              Föregående
            </Button>
            <Button 
              variant="outlined" 
              endIcon={<ArrowForwardIcon />}
              onClick={goToNextPage}
              disabled={currentPage >= numPages || loading}
            >
              Nästa
            </Button>
          </Box>
          
          <Typography>
            Sida {currentPage} av {numPages}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              startIcon={<ZoomOutIcon />}
              onClick={zoomOut}
              disabled={loading}
            >
              Zooma ut
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<ZoomInIcon />}
              onClick={zoomIn}
              disabled={loading}
            >
              Zooma in
            </Button>
          </Box>
        </Box>
        
        {/* PDF-visningsområde */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          flexGrow: 1,
          bgcolor: 'background.default', 
          borderRadius: 1,
          overflow: 'auto',
          position: 'relative'
        }}>
          {loading && (
            <CircularProgress 
              size={60} 
              sx={{ position: 'absolute', top: '50%', left: '50%', marginTop: -3, marginLeft: -3 }} 
            />
          )}
          
          {error && (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography color="error" gutterBottom>
                {error}
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => window.location.reload()}
              >
                Försök igen
              </Button>
            </Box>
          )}
          
          <canvas 
            ref={canvasRef} 
            style={{ 
              display: loading || error ? 'none' : 'block',
              maxWidth: '100%',
              margin: '0 auto'
            }} 
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
}