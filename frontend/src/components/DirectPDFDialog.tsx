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
  
  // Hämta aktivt projekt från localStorage om det inte finns i props
  const effectiveProjectId = projectId || (() => {
    try {
      // Försök först med direkta projektlistan från sessionslagring
      const currentProjectJson = sessionStorage.getItem('currentProject');
      if (currentProjectJson) {
        try {
          const currentProject = JSON.parse(currentProjectJson);
          console.log('Använder aktivt projekt från sessionStorage:', currentProject);
          return currentProject.id;
        } catch (e) {
          console.error('Fel vid parsning av aktivt projekt från session:', e);
        }
      }
      
      // Fallback till localStorage
      const savedProject = localStorage.getItem('activeProject');
      if (savedProject) {
        const parsed = JSON.parse(savedProject);
        console.log('Använder sparat projekt från localStorage:', parsed);
        return parsed.id;
      }
    } catch (e) {
      console.error('Fel vid läsning av lokalt sparat projekt:', e);
    }
    return "12"; // Använd standardprojekt om inget annat hittas
  })();
  
  console.log('Effektivt projektId för PDF-visning:', effectiveProjectId);
  
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
        
        // Försök hitta fil-ID från URL-delar
        let fileId = null;
        let fetchUrl = pdfUrl;
        
        // Extrahera fil-ID från URL-path
        if (pdfUrl.includes('/web/')) {
          // Format: /api/files/web/test-ID/data/
          const matches = pdfUrl.match(/\/web\/([^\/]+)\/data\//);
          if (matches && matches[1]) {
            const parts = matches[1].split('-');
            if (parts.length > 1) {
              fileId = parts[parts.length - 1];
              console.log('Extraherat fil-ID från URL path:', fileId);
            }
          }
        }
        
        // Extrahera från filnamn om vi inte hittade ID från URL
        if (!fileId && filename) {
          const filenameMatch = filename.match(/.*-(\d+)(\.pdf)?$/i);
          if (filenameMatch && filenameMatch[1]) {
            fileId = filenameMatch[1];
            console.log('Extraherat fil-ID från filnamn:', fileId);
          }
        }
        
        // Använd fil-ID för att hämta direkt från API
        if (fileId) {
          // Skapa en direkt API URL med projektID baserat på logs från användarens skärmbild
          const apiUrl = `${window.location.origin}/api/files/get-file-content/${fileId}/?project_id=${effectiveProjectId}`;
          
          // Skapa en direkt URL till media-katalogen baserad på faktiska URL:er i systemet
          // Från skärmavbilden ser vi ett mönster där direkt URL används 
          let mediaUrl = null;
          let directUrl = null;
          
          // URL direkt till filen om vi vet filnamnet
          if (filename) {
            console.log('Använder filnamn för direktåtkomst:', filename);
            directUrl = `${window.location.origin}/api/files/get-data/${filename}?project_id=${effectiveProjectId}`;
          }
          
          // FRÅN LOGS: Ser följande mönster
          // https://3d0eb322-114e-428e-9b72-6dc9b22e9017-00.2ep.7cu1e4x25w.rtrk.replit.d.8001/pdf/2025/05/19/BEAst-PDF-Guidelines-2_T5uulEt.0_1.pdf
          const realMediaUrl = `${window.location.origin}/api/files/web/999-67/data/${fileId}`;
          
          // Använd även direct endpoints baserat på loggar
          console.log('Testar att använda nya URL alternativ:');
          console.log('- Direct API URL:', realMediaUrl);
          
          if (directUrl) {
            console.log('- Direct URL med filnamn:', directUrl);
          }
          
          console.log('Använder direkt API URL med projektID:', apiUrl);
          console.log('Alternativ direkt media URL:', mediaUrl);
          
          try {
            // Konfigurera options för PDF.js
            const options: any = {
              withCredentials: true
            };
            
            // Lägg till JWT token om tillgänglig
            const token = localStorage.getItem('jwt_token');
            if (token) {
              options.httpHeaders = {
                'Authorization': `Bearer ${token}`
              };
            }
            
            // Skapa en array med URL:er att försöka med
            const urlsToTry = [
              `${apiUrl}?t=${Date.now()}`, // API URL
              realMediaUrl, // URL från loggar
              directUrl, // Direkt URL med filnamn 
              pdfUrl // Ursprunglig URL
            ].filter(url => url); // Filtrera bort null/undefined
            
            console.log('PDF-förfrågan kommer att testas med dessa URL:er i följd:', urlsToTry);
            
            // Försök med varje URL i tur och ordning
            let loadError = null;
            let loadedPdf = null;
            
            for (const url of urlsToTry) {
              try {
                console.log('Försöker ladda PDF från URL:', url);
                const pdfTask = pdfjsLib.getDocument({
                  url,
                  ...options
                });
                
                loadedPdf = await pdfTask.promise;
                console.log('PDF laddad framgångsrikt från:', url);
                break; // Avsluta loopen om vi lyckades ladda PDF:en
              } catch (err) {
                console.warn(`Kunde inte ladda PDF från ${url}:`, err);
                loadError = err;
                // Fortsätt med nästa URL
              }
            }
            
            // Om vi lyckades ladda en PDF, uppdatera state
            if (loadedPdf) {
              setPdfDocument(loadedPdf);
              setNumPages(loadedPdf.numPages);
              setCurrentPage(1);
              setLoading(false);
              return; // Avsluta tidigt om laddningen lyckades
            } 
            
            // Om vi når hit så misslyckades alla försök
            throw loadError || new Error('Kunde inte ladda PDF från någon av de försökta URL:erna');
          } catch (apiError) {
            console.error('Kunde inte hämta PDF via någon av de tillgängliga metoderna:', apiError);
          }
        }
        
        // Om vi inte kunde hämta via API, försök direkt med URL
        console.log('Försöker med direkt URL:', fetchUrl);
        
        // Hantera 0.0.0.0:8001 URL:er i Replit-miljön
        if (fetchUrl.includes('0.0.0.0:8001')) {
          const urlPath = new URL(fetchUrl).pathname;
          fetchUrl = `${window.location.origin}${urlPath}`;
          console.log('Konverterad URL för Replit-miljö:', fetchUrl);
        }
        
        // Ställ in JWT-token för autentisering om tillgänglig
        const options: any = {};
        const token = localStorage.getItem('jwt_token');
        if (token) {
          options.httpHeaders = {
            'Authorization': `Bearer ${token}`
          };
        }
        
        // Om vi har ett fil-ID, använd det som fallback om den direkta URL:en inte fungerar
        if (fileId) {
          // Skapa en absolut URL till vår direkta API-endpoint
          const directApiUrl = `${window.location.origin}/api/files/get-file-content/${fileId}/`;
          console.log('Fallback API URL baserad på fil-ID:', directApiUrl);
          
          try {
            console.log('Försöker hämta PDF med fil-ID från API:', directApiUrl);
            
            // Försök ladda via API:et först (ofta snabbare och mer pålitligt)
            const directTask = pdfjsLib.getDocument({
              url: `${directApiUrl}?t=${Date.now()}`,
              ...options,
              withCredentials: true
            });
            
            const pdf = await directTask.promise;
            setPdfDocument(pdf);
            setNumPages(pdf.numPages);
            setCurrentPage(1);
            setLoading(false);
            return; // Avsluta tidigt om det lyckas
          } catch (apiErr) {
            console.warn('Kunde inte hämta PDF via API:', apiErr);
            // Fortsätt med den ursprungliga URL:en som fallback
          }
        }
        
        // Om vi kommer hit, försök med den ursprungliga URL:en som fallback
        console.log('Använder ursprunglig URL som fallback:', fetchUrl);
        
        // Se till att vi har en giltig URL för att hämta PDF:en
        const finalUrl = fetchUrl.includes('http') ? fetchUrl : `${window.location.origin}${fetchUrl}`;
        console.log('Final URL för PDF-hämtning:', finalUrl);
        
        const loadingTask = pdfjsLib.getDocument({
          url: finalUrl,
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