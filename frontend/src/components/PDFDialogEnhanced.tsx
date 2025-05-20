import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  Sheet
} from '@mui/joy';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DownloadIcon from '@mui/icons-material/Download';
import { fetchAndCreateBlobUrl } from '../pages/files/ProxyPDFService';

interface PDFDialogEnhancedProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  filename: string;
}

const PDFDialogEnhanced = ({ open, onClose, pdfUrl, filename }: PDFDialogEnhancedProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processedPdfUrl, setProcessedPdfUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (!pdfUrl) {
      setError('Ingen PDF URL angiven');
      setLoading(false);
      return;
    }

    // Visa laddningsindikator
    setLoading(true);
    setError(null);

    // Hämta PDF via vår proxy-tjänst för att undvika Mixed Content-fel
    const fetchPdf = async () => {
      try {
        // Använd vår proxy-tjänst för att konvertera HTTP-URL till blob URL
        const safeUrl = await fetchAndCreateBlobUrl(pdfUrl);
        setProcessedPdfUrl(safeUrl);
      } catch (err: any) {
        console.error('Fel vid hämtning av PDF:', err);
        setError(`Kunde inte ladda PDF: ${err.message || 'Okänt fel'}`);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchPdf();
    }

    // Rensa blob URL när komponenten avmonteras eller dialogen stängs
    return () => {
      if (processedPdfUrl && processedPdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(processedPdfUrl);
        setProcessedPdfUrl(null);
      }
    };
  }, [pdfUrl, open]);

  // Hantera stängning av dialogen
  const handleClose = () => {
    // Rensa blob URL och återställ state
    if (processedPdfUrl && processedPdfUrl.startsWith('blob:')) {
      URL.revokeObjectURL(processedPdfUrl);
      setProcessedPdfUrl(null);
    }
    setLoading(true);
    setError(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        p: 1
      }}
    >
      <ModalDialog
        size="lg"
        variant="outlined"
        layout="fullscreen"
        sx={{ 
          width: '100%', 
          height: '100%',
          p: 0,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column'
        }}>
          {/* Header */}
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography level="title-lg">
              {filename}
            </Typography>
            <ModalClose />
          </Box>
          
          {/* Controls */}
          <Box sx={{ 
            p: 1, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'neutral.softBg'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton 
                size="sm" 
                variant="soft"
                onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))}
              >
                <ZoomOutIcon />
              </IconButton>
              <IconButton 
                size="sm" 
                variant="soft"
                onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.1))}
              >
                <ZoomInIcon />
              </IconButton>
              
              <Typography level="body-sm" sx={{ mx: 1 }}>
                {Math.round(zoomLevel * 100)}%
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton 
                size="sm" 
                variant="soft"
                disabled={currentPage <= 1}
                onClick={() => {
                  if (currentPage > 1) {
                    setCurrentPage(prev => prev - 1);
                  }
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
              
              <Typography level="body-sm">
                Sid {currentPage} / {totalPages || '?'}
              </Typography>
              
              <IconButton 
                size="sm" 
                variant="soft"
                disabled={currentPage >= totalPages}
                onClick={() => {
                  if (currentPage < totalPages) {
                    setCurrentPage(prev => prev + 1);
                  }
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>
            
            <Box>
              <IconButton 
                size="sm" 
                variant="soft"
                component="a" 
                href={processedPdfUrl || '#'} 
                download 
                target="_blank"
              >
                <DownloadIcon />
              </IconButton>
            </Box>
          </Box>
          
          {/* PDF Document */}
          <Box 
            sx={{ 
              flex: 1, 
              overflow: 'auto', 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'flex-start',
              p: 2,
              bgcolor: 'grey.100'
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress size="lg" />
              </Box>
            ) : error ? (
              <Sheet 
                variant="outlined" 
                sx={{ p: 4, maxWidth: '600px', textAlign: 'center', m: 'auto' }}
              >
                <Typography level="body-lg" color="danger">
                  {error}
                </Typography>
              </Sheet>
            ) : processedPdfUrl ? (
              <Box 
                sx={{ 
                  width: '100%', 
                  height: '100%', 
                  position: 'relative'
                }}
              >
                <iframe
                  src={`/pdfjs-viewer.html?url=${encodeURIComponent(processedPdfUrl)}`}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    border: 'none', 
                    backgroundColor: '#f5f5f5'
                  }}
                  title="PDF Viewer"
                  allow="fullscreen"
                />
              </Box>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                width: '100%', 
                height: '100%' 
              }}>
                <Typography level="body-lg">Ingen PDF vald</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default PDFDialogEnhanced;