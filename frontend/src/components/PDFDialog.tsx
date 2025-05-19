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
import PDFJSViewer from './PDFJSViewer';

interface PDFDialogProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  filename?: string;
}

const PDFDialog = ({ open, onClose, pdfUrl, filename = 'Dokument' }: PDFDialogProps) => {
  const [activeTab, setActiveTab] = useState<string>('detaljer');
  const [currentZoom, setCurrentZoom] = useState(100);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // Nollställ laddningstillståndet när URL ändras
  useEffect(() => {
    setLoading(true);
  }, [pdfUrl]);

  // Zooma in/ut-funktioner
  const zoomIn = () => {
    setCurrentZoom(prev => Math.min(prev + 10, 200));
  };

  const zoomOut = () => {
    setCurrentZoom(prev => Math.max(prev - 10, 50));
  };

  // Sidbläddringsfunktioner
  const goToNextPage = () => {
    if (pageCount && currentPage < pageCount) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
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
          {/* Toppmeny */}
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
              {/* Kontroller för sidnavigering och zoom */}
              <Button
                size="sm"
                variant="plain"
                onClick={goToPrevPage}
                disabled={currentPage <= 1}
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
                Sida {currentPage} {pageCount ? `av ${pageCount}` : ''}
              </Button>

              <Button
                size="sm"
                variant="plain"
                onClick={goToNextPage}
                disabled={!pageCount || currentPage >= pageCount}
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
                onClick={zoomOut}
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
                {currentZoom}%
              </Button>

              <Button
                size="sm"
                variant="plain"
                onClick={zoomIn}
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
            </Box>
          </Sheet>

          {/* Huvudinnehåll */}
          <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* PDF-visare */}
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
                {/* Version badge */}
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
                  Aktuell version
                </Box>

                {/* PDF-visningskomponent */}
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

                {/* Sidmarkör */}
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
            </Box>

            {/* Sidofält */}
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
              {/* Flikar */}
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

              {/* Flikinnehåll */}
              <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
                {activeTab === 'detaljer' && (
                  <>
                    <Typography level="title-md" sx={{ mb: 2 }}>Dokumentdetaljer</Typography>

                    <Box sx={{ mb: 4 }}>
                      <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                        Filnamn
                      </Typography>
                      <Typography level="body-sm">{filename}</Typography>
                    </Box>

                    <Box sx={{ mb: 4 }}>
                      <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                        Uppladdad av
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                          size="sm" 
                          sx={{ bgcolor: 'primary.400' }}
                        />
                        <Typography level="body-sm">Användare</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 4 }}>
                      <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                        Uppladdningsdatum
                      </Typography>
                      <Typography level="body-sm">{new Date().toLocaleDateString('sv-SE')}</Typography>
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