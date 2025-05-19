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

// Konfigurera PDF.js worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

interface SimplePDFViewerProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;  // Exakt URL som kommer direkt från API:et
  filename: string;
}

export default function SimplePDFViewer(props: SimplePDFViewerProps) {
  const { open, onClose, pdfUrl, filename } = props;
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.5);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Ladda PDF när komponenten monteras
  useEffect(() => {
    if (!open) return;
    
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Laddar PDF från exakt URL:', pdfUrl);
        
        // Använd den exakta URL:en som kommer från API:et
        // utan att manipulera eller ändra den
        const options: any = {
          url: pdfUrl,
          withCredentials: true
        };
        
        // Lägg till JWT token för autentisering om tillgänglig
        const token = localStorage.getItem('jwt_token');
        if (token) {
          options.httpHeaders = {
            'Authorization': `Bearer ${token}`
          };
        }
        
        // Ladda PDF:en direkt utan fallbacks eller alternativa metoder
        const loadingTask = pdfjsLib.getDocument(options);
        const pdf = await loadingTask.promise;
        
        setPdfDocument(pdf);
        setNumPages(pdf.numPages);
        setCurrentPage(1);
        setLoading(false);
      } catch (error) {
        console.error('PDF-visningsfel:', error);
        setError(`Kunde inte visa PDF-filen. Felmeddelande: ${(error as Error).message}`);
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
  }, [open, pdfUrl]);

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