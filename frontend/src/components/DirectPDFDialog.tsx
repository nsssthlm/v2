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
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface DirectPDFDialogProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  filename: string;
  projectId?: number | string | null;
  folderId?: number | string | null;
}

const DirectPDFDialog: React.FC<DirectPDFDialogProps> = ({ open, onClose, pdfUrl, filename, projectId, folderId }) => {
  // Använd blå färg
  const BlueColor = '#1976d2';
  const hoverBlueColor = '#1565c0';
  
  // Logga information om mapp och projekt för felsökning
  console.log('PDF Dialog öppnas med projektId:', projectId, 'och mappId:', folderId);
  
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Ladda PDF när komponenten monteras eller pdfUrl ändras
  useEffect(() => {
    if (!open) return;
    
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('PDF original URL:', pdfUrl);
        
        // Använd den ursprungliga URL:en som kommer från API:et
        // Vi behöver inte modifiera den eftersom backend redan ger oss korrekt URL
        let formattedUrl = pdfUrl;
        
        // Säkerställ att URL:en innehåller protokollet (http/https)
        if (!formattedUrl.startsWith('http')) {
          if (formattedUrl.startsWith('/')) {
            // Relativ URL, lägg till basdomänen
            formattedUrl = `${window.location.origin}${formattedUrl}`;
          } else {
            // Lägg till protokoll och domän
            formattedUrl = `${window.location.origin}/${formattedUrl}`;
          }
        }
        
        // Lägg till timestamp för att förhindra caching-problem
        formattedUrl = `${formattedUrl}${formattedUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
        console.log('Använder formaterad PDF URL:', formattedUrl);
        
        // Ladda dokumentet direkt
        const loadingTask = pdfjsLib.getDocument(formattedUrl);
        const pdf = await loadingTask.promise;
        
        setPdfDocument(pdf);
        setNumPages(pdf.numPages);
        setCurrentPage(1);
        setLoading(false);
        
      } catch (err) {
        console.error('Fel vid laddning av PDF (försök 1):', err);
        
        // Fallback 1: Försök att konstruera en mer direkt URL
        try {
          // Extrahera filnamnet från URL:en
          const urlParts = pdfUrl.split('/');
          const fileName = urlParts[urlParts.length - 1]?.split('?')[0];
          console.log('PDF original URL:', pdfUrl);
          
          if (fileName && fileName.endsWith('.pdf')) {
            // Försök 1: Använd direkt PDF-endpoint
            const dateParts = urlParts.filter(part => /^\d{4}\/\d{2}\/\d{2}$/.test(part));
            const datePathSegment = dateParts.length > 0 ? dateParts[0] : '';
            const directPdfUrl1 = `${window.location.protocol}//${window.location.host}/proxy/3000/pdf/${datePathSegment ? datePathSegment + '/' : ''}${fileName}?t=${Date.now()}`;
            console.log('1. Använder direkt PDF-endpoint:', directPdfUrl1);
            
            try {
              console.log('Första försök att hämta PDF-data från URL:', directPdfUrl1);
              const fallbackTask1 = pdfjsLib.getDocument(directPdfUrl1);
              const pdf = await fallbackTask1.promise;
              
              setPdfDocument(pdf);
              setNumPages(pdf.numPages);
              setCurrentPage(1);
              setLoading(false);
              return; // Avsluta om detta lyckas
            } catch (err1) {
              console.error('Fel vid hämtning av PDF (försök 1/4):', err1);
              
              // Fallback 1: Använd pdf-finder med exakt matchning
              console.log('Fallback 1: Använder pdf-finder med exact match', fileName);
              const directPdfUrl2 = `${window.location.protocol}//${window.location.host}/proxy/3000/pdf-finder/?filename=${fileName}&stream=true`;
              console.log('Provar alternativ URL (1):', directPdfUrl2);
              
              try {
                console.log('Försök 2/4: Alternativ URL:', directPdfUrl2);
                const fallbackTask2 = pdfjsLib.getDocument(directPdfUrl2);
                const pdf = await fallbackTask2.promise;
                
                setPdfDocument(pdf);
                setNumPages(pdf.numPages);
                setCurrentPage(1);
                setLoading(false);
                return; // Avsluta om detta lyckas
              } catch (err2) {
                console.error('Fel vid hämtning av PDF (försök 2/4):', err2);
                
                // Fallback 2: Använd exakt sökväg med datum
                const datePath = dateParts.length > 0 ? dateParts[0] : '';
                console.log('Fallback 2: Använder exakt sökväg med datum', `${datePath}/${fileName}`);
                const directPdfUrl3 = `${window.location.protocol}//${window.location.host}/proxy/3000/pdf/${datePath}/${fileName}`;
                console.log('Provar alternativ URL (2):', directPdfUrl3);
                
                try {
                  console.log('Försök 3/4: Alternativ URL:', directPdfUrl3);
                  const fallbackTask3 = pdfjsLib.getDocument(directPdfUrl3);
                  const pdf = await fallbackTask3.promise;
                  
                  setPdfDocument(pdf);
                  setNumPages(pdf.numPages);
                  setCurrentPage(1);
                  setLoading(false);
                  return; // Avsluta om detta lyckas
                } catch (err3) {
                  console.error('Fel vid hämtning av PDF (försök 3/4):', err3);
                  
                  // Fallback 3: Använd direct media API
                  console.log('Fallback 3: Använder direct media API', fileName);
                  const directPdfUrl4 = `${window.location.protocol}//${window.location.host}/proxy/3000/direct/media/project_files/${datePath}/${fileName}`;
                  console.log('Provar alternativ URL (3):', directPdfUrl4);
                  
                  try {
                    console.log('Försök 4/4: Alternativ URL:', directPdfUrl4);
                    const fallbackTask4 = pdfjsLib.getDocument(directPdfUrl4);
                    const pdf = await fallbackTask4.promise;
                    
                    setPdfDocument(pdf);
                    setNumPages(pdf.numPages);
                    setCurrentPage(1);
                    setLoading(false);
                    return; // Avsluta om detta lyckas
                  } catch (err4) {
                    console.error('Fel vid hämtning av PDF (försök 4/4):', err4);
                    // Alla försök har misslyckats
                  }
                }
              }
            }
          }
        } catch (allFailedErr) {
          console.error('Samtliga försök att hämta PDF misslyckades:', allFailedErr);
        }
        
        // Om vi når hit har båda försöken misslyckats
        setError('Kunde inte ladda PDF-dokumentet. Försök igen senare eller öppna i ny flik.');
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
          flexDirection: 'column'
        } 
      }}
    >
      <DialogTitle 
        sx={{ 
          backgroundColor: BlueColor, 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px'
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
          borderBottom: '1px solid #eee',
          gap: 1
        }}
      >
        <Button 
          onClick={prevPage} 
          disabled={currentPage <= 1}
          sx={{ 
            bgcolor: BlueColor, 
            color: 'white',
            '&:hover': { bgcolor: hoverBlueColor },
            minWidth: '45px',
            height: '35px',
            borderRadius: 'sm',
            px: 1,
            '&.Mui-disabled': {
              bgcolor: 'action.disabledBackground',
              color: 'action.disabled'
            }
          }}
        >
          ←
        </Button>
        
        <Button
          sx={{
            bgcolor: BlueColor, 
            color: 'white',
            height: '35px',
            px: 1.5,
            fontSize: '0.875rem',
            whiteSpace: 'nowrap'
          }}
        >
          Sida {currentPage} av {numPages || "?"}
        </Button>
        
        <Button 
          onClick={nextPage} 
          disabled={!pdfDocument || currentPage >= numPages}
          sx={{ 
            bgcolor: BlueColor, 
            color: 'white',
            '&:hover': { bgcolor: hoverBlueColor },
            minWidth: '45px',
            height: '35px',
            borderRadius: 'sm',
            px: 1,
            '&.Mui-disabled': {
              bgcolor: 'action.disabledBackground',
              color: 'action.disabled'
            }
          }}
        >
          →
        </Button>
        
        <Button
          onClick={zoomOut}
          sx={{ 
            bgcolor: BlueColor, 
            color: 'white',
            minWidth: '45px',
            height: '35px',
            borderRadius: 'sm',
            px: 1
          }}
        >
          -
        </Button>
        
        <Button
          sx={{ 
            bgcolor: BlueColor, 
            color: 'white',
            height: '35px',
            px: 1.5,
            fontSize: '0.875rem',
            minWidth: '60px'
          }}
        >
          {Math.round(scale * 100)}%
        </Button>
        
        <Button
          onClick={zoomIn}
          sx={{ 
            bgcolor: BlueColor, 
            color: 'white',
            minWidth: '45px',
            height: '35px',
            borderRadius: 'sm',
            px: 1
          }}
        >
          +
        </Button>
      </Box>
      
      <DialogContent sx={{ 
        padding: 0, 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        position: 'relative',
        overflow: 'auto'
      }}>
        {loading && (
          <Box sx={{ 
            position: 'absolute', 
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <CircularProgress sx={{ color: BlueColor }} />
            <Typography>Laddar PDF...</Typography>
          </Box>
        )}
        
        {error && (
          <Box sx={{ 
            p: 3, 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <Typography color="error">{error}</Typography>
            <Button 
              onClick={() => window.open(pdfUrl, '_blank')} 
              variant="contained" 
              sx={{ mt: 2, backgroundColor: BlueColor, '&:hover': { backgroundColor: hoverBlueColor } }}
            >
              Öppna i ny flik
            </Button>
          </Box>
        )}
        
        {!loading && !error && (
          <Box sx={{ 
            mt: 2, 
            boxShadow: 3, 
            display: 'inline-block', 
            backgroundColor: 'white',
            position: 'relative'
          }}>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: '8px',
                backgroundColor: BlueColor
              }}
            />
            <canvas ref={canvasRef} />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DirectPDFDialog;