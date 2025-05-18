import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist';

// Konfigurera PDF.js worker path manuellt
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFJSDialogProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  filename: string;
}

// Gröna SEB-färgen för knappar och highlights
const SEBGreen = '#007934';

const PDFJSDialog: React.FC<PDFJSDialogProps> = ({ open, onClose, pdfUrl, filename }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Ladda PDF när komponenten monteras eller pdfUrl ändras
  useEffect(() => {
    if (!open) return;
    
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Ladda dokumentet
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        
        setPdfDocument(pdf);
        setNumPages(pdf.numPages);
        setCurrentPage(1);
        setLoading(false);
      } catch (err) {
        console.error('Fel vid laddning av PDF:', err);
        setError('Kunde inte ladda PDF-dokumentet. Försök igen senare.');
        setLoading(false);
      }
    };
    
    loadPdf();
    
    // Städa upp när komponenten avmonteras
    return () => {
      if (pdfDocument) {
        pdfDocument.destroy();
      }
    };
  }, [open, pdfUrl]);
  
  // Rendera aktuell sida när den ändras
  useEffect(() => {
    if (!pdfDocument || !canvasRef.current) return;
    
    const renderPage = async () => {
      try {
        setLoading(true);
        
        // Hämta sidan
        const page = await pdfDocument.getPage(currentPage);
        
        // Beräkna skala för att passa container
        const viewport = page.getViewport({ scale });
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const context = canvas.getContext('2d');
        if (!context) return;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Rendera PDF-sidan till canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        await page.render(renderContext).promise;
        setLoading(false);
      } catch (err) {
        console.error('Fel vid rendering av PDF-sida:', err);
        setError('Kunde inte visa sidan. Försök igen senare.');
        setLoading(false);
      }
    };
    
    renderPage();
  }, [pdfDocument, currentPage, scale]);
  
  // Gå till föregående sida
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Gå till nästa sida
  const nextPage = () => {
    if (pdfDocument && currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Zooma in
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };
  
  // Zooma ut
  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{ 
        '& .MuiDialog-paper': { 
          height: '90vh', 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: '5px'
        } 
      }}
    >
      {/* Header med titel och stängknapp */}
      <DialogTitle 
        sx={{ 
          backgroundColor: SEBGreen, 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2, 
          py: 1
        }}
      >
        <Typography variant="h6" component="div">
          {filename}
        </Typography>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={onClose} 
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      {/* Kontrollknappar */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          p: 1, 
          borderBottom: '1px solid #eee'
        }}
      >
        <Button 
          onClick={prevPage} 
          disabled={currentPage <= 1}
          sx={{ minWidth: '40px', mx: 0.5 }}
          startIcon={<ArrowBackIcon />}
        >
          Föregående
        </Button>
        
        <Typography sx={{ mx: 2 }}>
          Sida {currentPage} av {numPages}
        </Typography>
        
        <Button 
          onClick={nextPage} 
          disabled={!pdfDocument || currentPage >= numPages}
          sx={{ minWidth: '40px', mx: 0.5 }}
          endIcon={<ArrowForwardIcon />}
        >
          Nästa
        </Button>
        
        <Box sx={{ ml: 4, display: 'flex' }}>
          <Button 
            onClick={zoomOut} 
            sx={{ minWidth: '40px', mx: 0.5 }}
            startIcon={<ZoomOutIcon />}
          >
            Zooma ut
          </Button>
          
          <Button 
            onClick={zoomIn} 
            sx={{ minWidth: '40px', mx: 0.5 }}
            startIcon={<ZoomInIcon />}
          >
            Zooma in
          </Button>
        </Box>
      </Box>
      
      {/* PDF innehåll */}
      <DialogContent 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          overflow: 'auto', 
          padding: 2,
          backgroundColor: '#f5f5f5'
        }}
      >
        {loading && <Typography>Laddar...</Typography>}
        
        {error && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
            <Button 
              onClick={() => window.open(pdfUrl, '_blank')} 
              variant="contained" 
              sx={{ mt: 2, backgroundColor: SEBGreen, '&:hover': { backgroundColor: '#005a25' } }}
            >
              Öppna i ny flik
            </Button>
          </Box>
        )}
        
        {!loading && !error && (
          <Box 
            sx={{ 
              mt: 2, 
              boxShadow: 3, 
              display: 'inline-block', 
              backgroundColor: 'white'
            }}
          >
            <canvas ref={canvasRef} />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PDFJSDialog;