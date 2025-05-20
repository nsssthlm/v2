import React, { useEffect, useState, useRef } from 'react';
import {
  Modal,
  ModalDialog,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  Sheet,
  Tabs,
  TabList,
  Tab,
  Button
} from '@mui/joy';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
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
  const [totalPages, setTotalPages] = useState(5); // Kommer uppdateras via PDF-visaren
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeTab, setActiveTab] = useState('detaljer');
  const pdfContainerRef = useRef<HTMLDivElement>(null);

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
        console.log("PDF hämtad och konverterad till blob URL:", safeUrl);
        setLoading(false);
      } catch (err: any) {
        console.error('Fel vid hämtning av PDF:', err);
        setError(`Kunde inte ladda PDF: ${err.message || 'Okänt fel'}`);
        setLoading(false);
      }
    };

    if (open) {
      fetchPdf();

      // Skapa en global funktion som kan anropas från iframe för att uppdatera status
      (window as any).updatePDFStatus = (status: { page: number, totalPages: number }) => {
        setCurrentPage(status.page);
        setTotalPages(status.totalPages);
      };

      // Skapa en global funktion som kan anropas från iframe för att zooma
      (window as any).updateZoomLevel = (zoom: number) => {
        setZoomLevel(Math.round(zoom * 100));
      };
    }

    // Lyssna på Ctrl+Scroll för zoom
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -25 : 25;
        const newZoom = Math.min(300, Math.max(50, zoomLevel + delta));
        setZoomLevel(newZoom);
        
        // Försök kommunicera med iframe för att ändra zoom
        try {
          const iframe = document.querySelector('iframe');
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({ type: 'setZoom', zoom: newZoom / 100 }, '*');
          }
        } catch (e) {
          console.error('Kunde inte kommunicera med PDF-visaren:', e);
        }
      }
    };

    const container = pdfContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    // Rensa blob URL när komponenten avmonteras eller dialogen stängs
    return () => {
      if (processedPdfUrl && processedPdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(processedPdfUrl);
        setProcessedPdfUrl(null);
      }
      
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }

      // Ta bort globala funktioner vid cleanup
      delete (window as any).updatePDFStatus;
      delete (window as any).updateZoomLevel;
    };
  }, [pdfUrl, open, zoomLevel]);

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

  // Funktioner för navigering
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      // Kommunicera med iframe för att ändra sida
      try {
        const iframe = document.querySelector('iframe');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({ type: 'prevPage' }, '*');
        }
      } catch (e) {
        console.error('Kunde inte kommunicera med PDF-visaren:', e);
      }
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      // Kommunicera med iframe för att ändra sida
      try {
        const iframe = document.querySelector('iframe');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({ type: 'nextPage' }, '*');
        }
      } catch (e) {
        console.error('Kunde inte kommunicera med PDF-visaren:', e);
      }
    }
  };

  // Funktioner för zoom
  const zoomIn = () => {
    const newZoom = Math.min(300, zoomLevel + 25);
    setZoomLevel(newZoom);
    // Kommunicera med iframe för att ändra zoom
    try {
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'setZoom', zoom: newZoom / 100 }, '*');
      }
    } catch (e) {
      console.error('Kunde inte kommunicera med PDF-visaren:', e);
    }
  };

  const zoomOut = () => {
    const newZoom = Math.max(50, zoomLevel - 25);
    setZoomLevel(newZoom);
    // Kommunicera med iframe för att ändra zoom
    try {
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'setZoom', zoom: newZoom / 100 }, '*');
      }
    } catch (e) {
      console.error('Kunde inte kommunicera med PDF-visaren:', e);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        p: 1,
        backdropFilter: 'blur(5px)',
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        }
      }}
    >
      <ModalDialog
        size="lg"
        variant="outlined"
        layout="fullscreen"
        sx={{ 
          width: '90%', 
          height: '90%',
          p: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* Header */}
        <Box sx={{ 
          py: 1.5,
          px: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.surface'
        }}>
          {/* Vänstra sidan med stäng och namn */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              variant="plain" 
              onClick={handleClose} 
              size="sm"
              sx={{ color: 'neutral.600' }}
            >
              <CloseIcon />
            </IconButton>
            <Typography level="title-md">
              {filename}
            </Typography>
          </Box>

          {/* Centrerad navigation och zoom */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              size="sm" 
              variant="soft"
              color="primary"
              onClick={prevPage}
              disabled={currentPage <= 1}
            >
              <ChevronLeftIcon />
            </IconButton>
            
            <Typography level="body-sm" sx={{ minWidth: '100px', textAlign: 'center' }}>
              Sida {currentPage} av {totalPages}
            </Typography>
            
            <IconButton 
              size="sm" 
              variant="soft"
              color="primary"
              onClick={nextPage}
              disabled={currentPage >= totalPages}
            >
              <ChevronRightIcon />
            </IconButton>

            <Box sx={{ mx: 1, borderLeft: '1px solid', borderColor: 'divider', height: '24px' }} />
            
            <IconButton 
              size="sm" 
              variant="soft"
              color="success"
              onClick={zoomOut}
            >
              <ZoomOutIcon />
            </IconButton>
            
            <Typography level="body-sm" sx={{ minWidth: '40px', textAlign: 'center' }}>
              {zoomLevel}%
            </Typography>
            
            <IconButton 
              size="sm" 
              variant="soft"
              color="success"
              onClick={zoomIn}
            >
              <ZoomInIcon />
            </IconButton>
          </Box>

          {/* Högra sidan med knappar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="sm"
              variant="soft"
              color="primary"
            >
              Versioner
            </Button>
            
            <Button
              size="sm"
              variant="soft"
              color="neutral"
            >
              Markera område
            </Button>

            <Button
              size="sm"
              variant="solid"
              color="primary"
            >
              Ny version
            </Button>
          </Box>
        </Box>

        {/* Huvud Content */}
        <Box sx={{ 
          display: 'flex', 
          flex: 1,
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* PDF Viewer Container med scrollbarrar */}
          <Box 
            ref={pdfContainerRef}
            sx={{ 
              flexGrow: 1, 
              position: 'relative',
              overflow: 'auto', 
              bgcolor: '#494949', // Mörkare bakgrund som i bilden
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              '&::-webkit-scrollbar': {
                width: '12px',
                height: '12px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#e0e0e0',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#888',
                borderRadius: '6px',
                border: '3px solid #e0e0e0',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                backgroundColor: '#555',
              }
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
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
              <iframe
                src={`/pdfjs-viewer.html?url=${encodeURIComponent(processedPdfUrl)}&zoom=${zoomLevel/100}&parentOrigin=${encodeURIComponent(window.location.origin)}`}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  border: 'none',
                  backgroundColor: 'transparent'
                }}
                title="PDF Viewer"
                allow="fullscreen"
              />
            ) : (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                width: '100%', 
                height: '100%' 
              }}>
                <Typography level="body-lg" sx={{ color: 'white' }}>Ingen PDF vald</Typography>
              </Box>
            )}
            
            {/* Progressbar i botten */}
            <Box sx={{ 
              position: 'absolute', 
              bottom: 8, 
              left: '5%', 
              right: '5%',
              height: '6px', 
              bgcolor: 'success.200',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                width: `${(currentPage / totalPages) * 100}%`, 
                height: '100%', 
                bgcolor: 'success.500' 
              }} />
            </Box>
          </Box>

          {/* Högra sidokolumnen med detaljer */}
          <Box sx={{ 
            width: '300px', 
            minWidth: '300px', 
            borderLeft: '1px solid', 
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Tabs för detaljer/historik/kommentarer */}
            <Tabs 
              value={activeTab} 
              onChange={(_, newValue) => setActiveTab(newValue as string)}
              sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <TabList>
                <Tab value="detaljer">Detaljer</Tab>
                <Tab value="historik">Historik</Tab>
                <Tab value="kommentarer">Kommentar</Tab>
              </TabList>
            </Tabs>

            {/* Tab innehåll */}
            <Box sx={{ 
              overflow: 'auto', 
              flex: 1, 
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              {activeTab === 'detaljer' && (
                <>
                  <Box>
                    <Typography level="title-md" sx={{ mb: 1 }}>PDF Anteckning</Typography>
                    <Sheet variant="outlined" sx={{ p: 2, borderRadius: 'md' }}>
                      <Typography level="body-sm" sx={{ fontWeight: 'bold', mb: 0.5 }}>Skapad av</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Box 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            bgcolor: 'primary.300', 
                            borderRadius: '50%' 
                          }} 
                        />
                        <Typography>user@example.com</Typography>
                        <Typography level="body-xs" sx={{ ml: 'auto' }}>2025-05-20</Typography>
                      </Box>
                    </Sheet>
                  </Box>

                  <Box>
                    <Typography level="body-sm" sx={{ fontWeight: 'bold', mb: 0.5 }}>Deadline</Typography>
                    <Sheet variant="outlined" sx={{ p: 2, borderRadius: 'md' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>22 maj 2025</Typography>
                      </Box>
                    </Sheet>
                  </Box>

                  <Box>
                    <Typography level="body-sm" sx={{ fontWeight: 'bold', mb: 0.5 }}>Granskningspaket</Typography>
                    <Sheet variant="outlined" sx={{ p: 2, borderRadius: 'md' }}>
                      <Typography>K - Granskning BH Hus 3-4</Typography>
                    </Sheet>
                  </Box>

                  <Box>
                    <Typography level="body-sm" sx={{ fontWeight: 'bold', mb: 0.5 }}>Typ</Typography>
                    <Sheet variant="outlined" sx={{ p: 2, borderRadius: 'md' }}>
                      <Typography>Gransknings kommentar</Typography>
                    </Sheet>
                  </Box>

                  <Box>
                    <Typography level="title-md" sx={{ mb: 1 }}>Aktivitet</Typography>
                    <Sheet variant="outlined" sx={{ p: 2, borderRadius: 'md' }}>
                      <Typography level="body-sm" sx={{ fontWeight: 'bold', mb: 1 }}>VERSIONER</Typography>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        p: 1,
                        borderRadius: 'sm',
                        borderLeft: '3px solid',
                        borderColor: 'primary.500',
                        bgcolor: 'primary.50'
                      }}>
                        <Box 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            bgcolor: 'primary.300', 
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }} 
                        >
                          V
                        </Box>
                        <Box>
                          <Typography level="body-sm" sx={{ fontWeight: 'bold' }}>Version 1</Typography>
                          <Typography level="body-xs">user@example.com</Typography>
                        </Box>
                        <Button 
                          size="sm" 
                          variant="soft" 
                          color="primary" 
                          sx={{ ml: 'auto', fontSize: '0.75rem' }}
                        >
                          Visa version
                        </Button>
                      </Box>
                    </Sheet>
                  </Box>
                </>
              )}

              {activeTab === 'historik' && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography>Historik kommer visas här</Typography>
                </Box>
              )}

              {activeTab === 'kommentarer' && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography>Kommentarer kommer visas här</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Statusrad i botten */}
        <Box sx={{ 
          p: 1, 
          borderTop: '1px solid', 
          borderColor: 'divider', 
          bgcolor: 'background.level1',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Button 
            size="sm" 
            variant="soft" 
            color="primary" 
            sx={{ mr: 2 }}
          >
            Nuvarande version
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default PDFDialogEnhanced;