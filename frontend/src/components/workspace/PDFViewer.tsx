import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  IconButton, 
  Typography, 
  Button, 
  Tooltip,
  Sheet,
  Modal,
  ModalDialog,
  ModalClose,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Divider
} from '@mui/joy';
import AdvancedPDFViewer from './AdvancedPDFViewer';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Download as DownloadIcon,
  Description as DescriptionIcon,
  Info as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { PDFDocument } from '../../types';

interface PDFViewerProps {
  pdf: PDFDocument | null;
  onClose: () => void;
}

// Debug value for development
let renderCount = 0;

const PDFViewer: React.FC<PDFViewerProps> = ({ pdf, onClose }) => {
  // Increment render count for debugging
  renderCount++;
  console.log(`PDFViewer render #${renderCount}, pdf:`, pdf ? pdf.id : 'null');

  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Log when PDFViewer mounts or updates with a new PDF
  useEffect(() => {
    if (pdf) {
      console.log('PDFViewer mounted/updated with PDF:', pdf);
    }
  }, [pdf]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        await containerRef.current.requestFullscreen();
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Error toggling fullscreen mode:', err);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  console.log('Starting PDFViewer render with:', pdf?.title);
  
  return (
    <Modal
      open={true}
      onClose={onClose}
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        zIndex: 1400
      }}
    >
      <ModalDialog 
        layout="fullscreen" 
        sx={{ 
          p: 0, 
          border: 'none',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '98vw',
          maxHeight: '98vh',
          width: '95%',
          height: '95%',
          boxShadow: 'lg',
          minHeight: '85vh',
          m: 0,
          bgcolor: 'background.body'
        }}
      >
        <Box 
          ref={containerRef} 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            height: '100%',
            width: '100%',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            bgcolor: 'background.level1',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography level="h3" noWrap sx={{ flex: 1 }}>
              {pdf.title}
            </Typography>
            <IconButton onClick={onClose} variant="plain" size="sm">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Toolbar */}
          <Box sx={{ 
            p: 1, 
            display: 'flex', 
            justifyContent: 'space-between',
            bgcolor: 'background.level1',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Zooma in">
                <IconButton onClick={handleZoomIn} size="sm">
                  <ZoomInIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zooma ut">
                <IconButton onClick={handleZoomOut} size="sm">
                  <ZoomOutIcon />
                </IconButton>
              </Tooltip>
              <Typography level="body-sm" sx={{ alignSelf: 'center' }}>
                {Math.round(zoom * 100)}%
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={isFullscreen ? "Avsluta helskärm" : "Helskärm"}>
                <IconButton onClick={toggleFullscreen} size="sm">
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Ladda ner">
                <IconButton 
                  component="a" 
                  href={pdf.file_url} 
                  download 
                  target="_blank" 
                  size="sm"
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Main content */}
          <Box sx={{ 
            display: 'flex', 
            flexGrow: 1,
            height: 'calc(100% - 110px)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* PDF Content */}
            <Box sx={{ 
              flexGrow: 1, 
              overflow: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              bgcolor: 'background.level2',
              p: 2,
              height: '100%',
              position: 'relative' // Lägg till relativ positionering
            }}>
              <Box sx={{ 
                width: '95%', 
                height: 'auto',
                position: 'absolute', // Använd absolut positionering
                top: 16, // Lägg till lite utrymme i toppen
                left: '50%', // Centrera horisontellt
                transform: `translateX(-50%) scale(${zoom})`, // Centrera horisontellt med skalning
                bgcolor: 'background.surface',
                boxShadow: 'md',
                borderRadius: 'md',
                overflow: 'hidden'
              }}>
                <AdvancedPDFViewer 
                  pdfUrl={`workspace/pdfs/${pdf.id}/content/`}
                  title={pdf.title}
                  key={pdf.id} // Lägg till key för att tvinga omrendering
                />
              </Box>
            </Box>

            {/* Sidebar */}
            <Sheet 
              sx={{ 
                width: 300, 
                borderLeft: '1px solid', 
                borderColor: 'divider',
                overflow: 'auto',
                display: { xs: 'none', md: 'block' },
                flexShrink: 0
              }}
            >
              <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val as number)}>
                <TabList>
                  <Tab>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <InfoIcon />
                      <span>Info</span>
                    </Box>
                  </Tab>
                  <Tab disabled>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DescriptionIcon />
                      <span>Anteckningar</span>
                    </Box>
                  </Tab>
                </TabList>
                <TabPanel value={0} sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography level="h4">Dokumentinformation</Typography>
                    
                    <Box>
                      <Typography level="title-sm">Titel</Typography>
                      <Typography>{pdf.title}</Typography>
                    </Box>
                    
                    {pdf.description && (
                      <Box>
                        <Typography level="title-sm">Beskrivning</Typography>
                        <Typography>{pdf.description}</Typography>
                      </Box>
                    )}
                    
                    <Divider />
                    
                    <Box>
                      <Typography level="title-sm">Uppladdad av</Typography>
                      <Typography>
                        {pdf.uploaded_by_details.first_name 
                          ? `${pdf.uploaded_by_details.first_name} ${pdf.uploaded_by_details.last_name}` 
                          : pdf.uploaded_by_details.username}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography level="title-sm">Datum</Typography>
                      <Typography>
                        {format(new Date(pdf.created_at), 'dd MMMM yyyy, HH:mm', { locale: sv })}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography level="title-sm">Filstorlek</Typography>
                      <Typography>{formatFileSize(pdf.size)}</Typography>
                    </Box>
                    
                    <Box>
                      <Typography level="title-sm">Version</Typography>
                      <Typography>v{pdf.version}</Typography>
                    </Box>
                  </Box>
                </TabPanel>
              </Tabs>
            </Sheet>
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default PDFViewer;