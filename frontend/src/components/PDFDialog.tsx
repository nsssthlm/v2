import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Sheet, 
  Modal, 
  ModalDialog,
  Tab,
  TabList,
  Tabs,
  Avatar
} from '@mui/joy';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import UploadIcon from '@mui/icons-material/Upload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PDFJSViewer from './PDFJSViewer';

interface PDFDialogProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  filename: string;
}

// Enkel PDF-visare i dialogruta
const PDFDialog = ({ open, onClose, pdfUrl, filename }: PDFDialogProps) => {
  const [activeTab, setActiveTab] = useState<string>('detaljer');
  const [currentZoom, setCurrentZoom] = useState(100);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  
  // Enkel state för renderingen, de mesta hanteras nu i PDFJSViewer-komponenten  
  useEffect(() => {
    setLoading(false);
    setError(false);
  }, [pdfUrl]);
  
  // Navigeringsfunktioner
  const zoomIn = () => {
    setCurrentZoom(prev => Math.min(prev + 10, 200));
  };
  
  const zoomOut = () => {
    setCurrentZoom(prev => Math.max(prev - 10, 50));
  };

  const goToNextPage = () => {
    if (numPages && currentPage < numPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        variant="outlined"
        sx={{
          width: '90vw',
          height: '90vh',
          maxWidth: '1400px',
          maxHeight: '800px',
          p: 0,
          overflow: 'hidden',
          borderRadius: 'md',
          boxShadow: 'lg'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
          {/* Header */}
          <Sheet 
            variant="plain"
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 1,
              bgcolor: '#f5f5f5', 
              borderBottom: '1px solid #e0e0e0'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton 
                variant="plain" 
                color="neutral" 
                onClick={onClose}
                sx={{ mr: 1 }}
              >
                <CloseIcon />
              </IconButton>
              <Typography level="title-sm" sx={{ fontWeight: 'bold', mr: 2 }}>{filename}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Page navigation & Zoom controls - alla lika breda knappar i grönt */}
              <Button
                size="sm"
                variant="plain"
                sx={{ 
                  bgcolor: '#1976d2', 
                  color: 'white',
                  '&:hover': { bgcolor: '#1565c0' },
                  borderRadius: 'sm',
                  minWidth: '45px',
                  width: '45px',
                  height: '35px',
                  px: 1
                }}
              >
                ←
              </Button>
              
              <Button
                size="sm"
                variant="plain"
                sx={{
                  bgcolor: '#1976d2', 
                  color: 'white',
                  borderRadius: 'sm',
                  height: '35px',
                  px: 1.5,
                  fontSize: '0.875rem',
                  whiteSpace: 'nowrap'
                }}
              >
                Sida 1 av 5
              </Button>
              
              <Button
                size="sm"
                variant="plain"
                sx={{ 
                  bgcolor: '#1976d2', 
                  color: 'white',
                  '&:hover': { bgcolor: '#1565c0' },
                  borderRadius: 'sm',
                  minWidth: '45px',
                  width: '45px',
                  height: '35px',
                  px: 1
                }}
              >
                →
              </Button>
              
              <Button
                size="sm"
                variant="plain"
                sx={{ 
                  bgcolor: '#1976d2', 
                  color: 'white',
                  borderRadius: 'sm',
                  minWidth: '45px',
                  width: '45px',
                  height: '35px',
                  px: 1
                }}
              >
                -
              </Button>
              
              <Button
                size="sm"
                variant="plain"
                sx={{ 
                  bgcolor: '#1976d2', 
                  color: 'white',
                  borderRadius: 'sm',
                  height: '35px',
                  px: 1,
                  fontSize: '0.875rem',
                  minWidth: '50px'
                }}
              >
                100%
              </Button>
              
              <Button
                size="sm"
                variant="plain"
                sx={{ 
                  bgcolor: '#1976d2', 
                  color: 'white',
                  borderRadius: 'sm',
                  minWidth: '45px',
                  width: '45px',
                  height: '35px',
                  px: 1
                }}
              >
                +
              </Button>
              
              {/* Action buttons - samma storlek och stil */}
              <Button
                size="sm"
                variant="plain"
                startDecorator={<BookmarkBorderIcon />}
                sx={{ 
                  bgcolor: '#1976d2', 
                  color: 'white',
                  '&:hover': { bgcolor: '#1565c0' },
                  borderRadius: 'sm',
                  height: '35px',
                  px: 1.5,
                  fontSize: '0.875rem'
                }}
              >
                Versioner
              </Button>
              
              <Button
                size="sm"
                variant="plain"
                sx={{ 
                  bgcolor: '#1976d2', 
                  color: 'white',
                  '&:hover': { bgcolor: '#1565c0' },
                  borderRadius: 'sm',
                  height: '35px',
                  px: 1.5,
                  fontSize: '0.875rem'
                }}
              >
                Markera område
              </Button>
              
              <Button
                size="sm"
                variant="plain"
                startDecorator={<UploadIcon />}
                sx={{ 
                  bgcolor: '#1976d2', 
                  color: 'white',
                  '&:hover': { bgcolor: '#1565c0' },
                  borderRadius: 'sm',
                  height: '35px',
                  px: 1.5,
                  fontSize: '0.875rem'
                }}
              >
                Ny version
              </Button>
            </Box>
          </Sheet>
          
          {/* Main content */}
          <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* PDF Viewer med en grön vertikal linje på vänster sida */}
            <Box 
              sx={{ 
                flex: 1, 
                bgcolor: '#333',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box 
                sx={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: '#333',
                  overflow: 'auto',
                  position: 'relative'
                }}
              >
                {/* "Nuvarande version" badge som i exemplet */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    zIndex: 2,
                    bgcolor: '#6366f1',
                    color: 'white',
                    fontSize: '0.75rem',
                    py: 0.5,
                    px: 1.5,
                    borderRadius: 'md',
                    fontWeight: 'bold'
                  }}
                >
                  Nuvarande version
                </Box>
                
                {/* Visa PDF:en med vår nya komponent */}
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative'
                  }}
                >
                  <PDFJSViewer 
                    pdfUrl={pdfUrl} 
                    filename={filename} 
                  />
                </Box>
                
                {/* Gröna sidramen för designen som matchar bild 2 */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: '8px',
                    backgroundColor: '#1976d2'
                  }}
                />
              </Box>
              
              {/* Progress bar at bottom */}
              <Box 
                sx={{ 
                  position: 'absolute', 
                  bottom: 10, 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  width: '80%',
                  height: 4,
                  bgcolor: '#4b4b4b',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: '100%', 
                    bgcolor: '#1976d2'
                  }}
                />
              </Box>
            </Box>
            
            {/* Sidebar */}
            <Sheet 
              variant="outlined"
              sx={{
                width: 320,
                display: 'flex',
                flexDirection: 'column',
                borderTop: 'none',
                borderBottom: 'none',
                borderRight: 'none',
              }}
            >
              {/* Tabs */}
              <Tabs 
                value={activeTab}
                onChange={(_, value) => setActiveTab(value as string)}
              >
                <TabList sx={{ borderRadius: 0 }}>
                  <Tab value="detaljer">Detaljer</Tab>
                  <Tab value="historik">Historik</Tab>
                  <Tab value="kommentar">Kommentar</Tab>
                </TabList>
              </Tabs>
              
              {/* Tab content */}
              <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
                {activeTab === 'detaljer' && (
                  <>
                    <Typography level="title-md" sx={{ mb: 2 }}>PDF Anteckning</Typography>
                    
                    <Box sx={{ mb: 4 }}>
                      <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                        Skapad av
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                          size="sm" 
                          sx={{ bgcolor: 'primary.400' }}
                        />
                        <Box>
                          <Typography level="body-sm">user@example.com</Typography>
                          <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                            2025-05-16
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 4 }}>
                      <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                        Deadline
                      </Typography>
                      <Typography level="body-sm">22 maj 2025</Typography>
                    </Box>
                    
                    <Box sx={{ mb: 4 }}>
                      <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                        Granskningspaket
                      </Typography>
                      <Typography level="body-sm">K - Granskning BH Hus 3-4</Typography>
                    </Box>
                    
                    <Box sx={{ mb: 4 }}>
                      <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                        Typ
                      </Typography>
                      <Typography level="body-sm">Gransknings kommentar</Typography>
                    </Box>
                    
                    <Box sx={{ mb: 4 }}>
                      <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                        Aktivitet
                      </Typography>
                      <Button
                        variant="outlined"
                        color="neutral"
                        fullWidth
                        sx={{ mt: 1 }}
                      >
                        VERSIONER
                      </Button>
                    </Box>
                  </>
                )}
                
                {activeTab === 'historik' && (
                  <>
                    <Typography level="title-md" sx={{ mb: 2 }}>Versionshistorik</Typography>
                    <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                      Ingen versionshistorik tillgänglig för detta dokument.
                    </Typography>
                  </>
                )}
                
                {activeTab === 'kommentar' && (
                  <>
                    <Typography level="title-md" sx={{ mb: 2 }}>Kommentarer</Typography>
                    <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                      Inga kommentarer har lagts till än.
                    </Typography>
                  </>
                )}
              </Box>
            </Sheet>
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default PDFDialog;