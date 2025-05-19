import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalDialog,
  Box,
  Button,
  CircularProgress,
  Typography,
  IconButton
} from '@mui/joy';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

interface SimplePDFDialogProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  filename: string;
}

/**
 * Enkel PDF-dialogkomponent som visar PDF:er direkt från URL
 */
const SimplePDFDialog: React.FC<SimplePDFDialogProps> = ({
  open,
  onClose,
  pdfUrl,
  filename
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  
  // Hämta PDF:en när komponenten öppnas
  useEffect(() => {
    if (!open) return;
    
    const loadPdf = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Försöker hämta PDF från URL:', pdfUrl);
        
        // Skapa lista med URL:er att prova
        const dateMatch = pdfUrl.match(/(\d{4})\/(\d{2})\/(\d{2})\/([^/]+)$/);
        const filenameMatch = pdfUrl.match(/\/([^/]+\.pdf)$/);
        
        const urlsToTry = [
          pdfUrl,
          // Om URL:en innehåller en datum-sökväg, skapa en media URL
          dateMatch ? `/media/project_files/${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}/${dateMatch[4]}` : null,
          // Om det är en API-url, försök med en media-direkt URL
          pdfUrl.includes('/api/') && filenameMatch ? `/media/project_files/${filenameMatch[1]}` : null,
          // Sista försök - extrahera bara filnamnet och pröva det direkt
          filenameMatch ? `/media/${filenameMatch[1]}` : null
        ].filter(Boolean) as string[];
        
        // Lägg till URL med tilläggsparametrar för att undvika cache-problem
        urlsToTry.push(`${pdfUrl}?t=${Date.now()}`);
        
        console.log('Testar följande URL:er:', urlsToTry);
        
        let pdfBlob = null;
        
        // Försök med varje URL tills en fungerar
        for (const url of urlsToTry) {
          try {
            const response = await fetch(url);
            
            if (response.ok) {
              const blob = await response.blob();
              const contentType = blob.type;
              
              console.log(`Fick svar med innehållstyp: ${contentType} från URL: ${url}`);
              
              if (contentType === 'application/pdf' || contentType === '' || url.endsWith('.pdf')) {
                pdfBlob = blob;
                console.log(`Lyckades hämta PDF från: ${url}`);
                break;
              } else {
                console.warn(`Förväntade PDF, fick: ${contentType} från ${url}`);
              }
            } else {
              console.warn(`HTTP-fel från ${url}: ${response.status} ${response.statusText}`);
            }
          } catch (err) {
            console.error(`Fel vid anrop till ${url}:`, err);
          }
        }
        
        if (pdfBlob) {
          // Skapa en blobbURL för att visa PDF:en
          const blobUrl = URL.createObjectURL(pdfBlob);
          setPdfBlobUrl(blobUrl);
          setLoading(false);
        } else {
          throw new Error('Kunde inte hämta PDF från någon av de försökta URL:erna');
        }
      } catch (err) {
        console.error('Fel vid PDF-laddning:', err);
        setError('Kunde inte ladda PDF-filen. Testa att ladda ned den och öppna lokalt.');
        setLoading(false);
      }
    };
    
    loadPdf();
    
    // Rensa blobbURL när komponenten avmonteras
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [open, pdfUrl]);
  
  // Öppna i ny flik
  const openInNewTab = () => {
    window.open(pdfUrl, '_blank');
  };
  
  // Hämta PDF
  const downloadPdf = () => {
    // Om vi har en lokal blobURL, använd den för nedladdning
    if (pdfBlobUrl) {
      const a = document.createElement('a');
      a.href = pdfBlobUrl;
      a.download = filename || 'document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Annars använd original-URL
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        sx={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          width: '90vw',
          height: '90vh',
          p: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 1,
            bgcolor: 'primary.500',
            color: 'white',
            borderTopLeftRadius: 'var(--Joy-radius-sm)',
            borderTopRightRadius: 'var(--Joy-radius-sm)'
          }}
        >
          <Typography level="title-md" sx={{ pl: 1 }}>
            {filename || 'PDF Dokument'}
          </Typography>
          
          <Box sx={{ display: 'flex' }}>
            <Button
              variant="soft"
              color="neutral"
              size="sm"
              sx={{ mr: 1, bgcolor: 'white', color: 'primary.600' }}
              startDecorator={<DownloadIcon />}
              onClick={downloadPdf}
            >
              Hämta
            </Button>
            
            <IconButton
              variant="plain"
              color="neutral"
              size="sm"
              onClick={onClose}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        
        {/* Innehåll */}
        <Box
          sx={{
            flex: 1,
            bgcolor: 'grey.100',
            position: 'relative',
            overflow: 'auto'
          }}
        >
          {/* Laddningsindikator */}
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}
            >
              <CircularProgress />
              <Typography level="body-sm">Laddar PDF...</Typography>
            </Box>
          )}
          
          {/* Felmeddelande */}
          {error && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                p: 3,
                textAlign: 'center'
              }}
            >
              <Typography level="h3" color="danger">
                Kunde inte ladda PDF
              </Typography>
              <Typography level="body-md" sx={{ mb: 2 }}>
                {error}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  onClick={openInNewTab}
                  variant="solid"
                  color="primary"
                >
                  Öppna i ny flik
                </Button>
                <Button
                  onClick={downloadPdf}
                  variant="outlined"
                >
                  Ladda ned
                </Button>
              </Box>
            </Box>
          )}
          
          {/* PDF-visare */}
          {pdfBlobUrl && !loading && !error && (
            <iframe
              src={pdfBlobUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              title={filename || 'PDF Document'}
            />
          )}
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default SimplePDFDialog;