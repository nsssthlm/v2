import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Sheet, 
  Modal, 
  ModalDialog,
  ModalClose,
  Tabs,
  TabList,
  Tab,
  Avatar,
  CircularProgress
} from '@mui/joy';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import UploadIcon from '@mui/icons-material/Upload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DownloadIcon from '@mui/icons-material/Download';

interface PDFDialogProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  filename: string;
}

const PDFDialog = ({ open, onClose, pdfUrl, filename }: PDFDialogProps) => {
  const [activeTab, setActiveTab] = useState<string>('detaljer');
  const [currentZoom, setCurrentZoom] = useState(100);
  
  // Enklare funktioner för navigering som vi kan använda senare
  const zoomIn = () => {
    setCurrentZoom(prev => Math.min(prev + 10, 200));
  };
  
  const zoomOut = () => {
    setCurrentZoom(prev => Math.max(prev - 10, 50));
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
            variant="outlined"
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 1,
              px: 2,
              borderTopLeftRadius: 'md',
              borderTopRightRadius: 'md',
              borderLeft: 'none',
              borderRight: 'none',
              borderTop: 'none'
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
              <Typography level="title-lg">{filename}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Page navigation */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  size="sm" 
                  variant="soft" 
                  color="primary" 
                  onClick={() => {}}
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
                <Typography level="body-sm" sx={{ mx: 1 }}>
                  Sida 1 av 5
                </Typography>
                <IconButton 
                  size="sm" 
                  variant="soft" 
                  color="primary" 
                  onClick={() => {}}
                >
                  <ArrowForwardIcon fontSize="small" />
                </IconButton>
              </Box>
              
              {/* Zoom control */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  size="sm" 
                  variant="soft" 
                  color="primary"
                  onClick={zoomOut}
                >
                  <span>-</span>
                </IconButton>
                <Typography level="body-sm" sx={{ mx: 1 }}>
                  {currentZoom}%
                </Typography>
                <IconButton 
                  size="sm" 
                  variant="soft" 
                  color="primary"
                  onClick={zoomIn}
                >
                  <span>+</span>
                </IconButton>
              </Box>
              
              {/* Action buttons */}
              <Button
                size="sm"
                variant="soft"
                color="primary"
                startDecorator={<AddIcon />}
              >
                Ladda ner
              </Button>
              
              <Button
                size="sm"
                variant="soft"
                color="primary"
                startDecorator={<BookmarkBorderIcon />}
              >
                Versioner
              </Button>
              
              <Button
                size="sm"
                variant="soft"
                color="primary"
                startDecorator={<BookmarkBorderIcon />}
              >
                Markera område
              </Button>
              
              <Button
                size="sm"
                variant="soft"
                color="primary"
                startDecorator={<UploadIcon />}
              >
                Ny version
              </Button>
            </Box>
          </Sheet>
          
          {/* Main content */}
          <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* PDF Viewer */}
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
                {/* Visa den faktiska PDF:en med iframe som fungerar bättre */}
                <iframe
                  src={pdfUrl}
                  width="100%"
                  height="100%"
                  style={{ 
                    background: 'white',
                    display: 'block',
                    margin: '0 auto',
                    border: 'none'
                  }}
                  title={filename}
                />
                
                {/* Gröna sidramen för designen som matchar bild 2 */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: '8px',
                    backgroundColor: '#4caf50'
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
                    bgcolor: '#4caf50'
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