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
        
        // Använd exakt URL från API:et (som i url-fältet från /api/pdf/list/-responsen)
        let apiUrl = pdfUrl;
        
        // Säkerställ att URL:en innehåller protokollet (http/https)
        if (!apiUrl.startsWith('http')) {
          if (apiUrl.startsWith('/')) {
            // Relativ URL, lägg till basdomänen
            apiUrl = `${window.location.origin}${apiUrl}`;
          } else {
            // Lägg till protokoll och domän
            apiUrl = `${window.location.origin}/${apiUrl}`;
          }
        }
        
        // Kontrollera om URL:en faktiskt pekar på API-endpointen (utan att försöka gissa)
        if (!apiUrl.includes('/api/pdf/') && !apiUrl.includes('/api/files/get-file-content/')) {
          // Om URL:en inte pekar på API:et, försök att extrahera ID från filnamnet
          // och använd den korrekta API-endpointen
          const filenameMatch = filename.match(/.*-(\d+)(\.pdf)?/);
          if (filenameMatch && filenameMatch[1]) {
            const fileId = filenameMatch[1];
            console.log('Extraherat fil-ID från filnamn:', fileId);
            apiUrl = `${window.location.origin}/api/files/get-file-content/${fileId}/`;
          }
        }
        
        // Lägg till timestamp för att förhindra caching-problem
        apiUrl = `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
        console.log('Använder exakt API URL för PDF:', apiUrl);
        
        // Ställ in JWT-token för autentisering om tillgänglig
        const options: any = {};
        const token = localStorage.getItem('jwt_token');
        if (token) {
          options.httpHeaders = {
            'Authorization': `Bearer ${token}`
          };
        }
        
        // Skicka direkt till PDF.js utan att gissa eller konstruera URL
        const loadingTask = pdfjsLib.getDocument({
          url: apiUrl,
          ...options,
          withCredentials: true  // Skicka med cookies för sessions-autentisering
        });
        
        const pdf = await loadingTask.promise;
        
        setPdfDocument(pdf);
        setNumPages(pdf.numPages);
        setCurrentPage(1);
        setLoading(false);
      } catch (err) {
        console.error('Misslyckades att ladda PDF från API:', err);
        setError('Kunde inte ladda PDF-dokumentet. Vänligen kontrollera att du är inloggad och har behörighet.');
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