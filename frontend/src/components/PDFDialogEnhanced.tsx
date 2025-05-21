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
  Button,
  Textarea,
  Select,
  Option,
  FormControl,
  FormLabel,
  Modal as JoyModal,
  Snackbar,
  Alert
} from '@mui/joy';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit'; 
import PanToolIcon from '@mui/icons-material/PanTool';
import { fetchAndCreateBlobUrl } from '../pages/files/ProxyPDFService';
import axios from 'axios';

interface PDFAnnotation {
  id: string;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
    pageNumber: number;
  };
  color: string;
  comment: string;
  status: 'new_comment' | 'action_required' | 'rejected' | 'new_review' | 'other_forum' | 'resolved';
  createdBy: string;
  createdAt: string;
}

interface PDFDialogEnhancedProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  filename: string;
}

// Dialog för att lägga till kommentar till markerat område
const CommentDialog = ({ 
  open, 
  onClose, 
  onSave, 
  initialComment = '' 
}: { 
  open: boolean, 
  onClose: () => void, 
  onSave: (comment: string, status: PDFAnnotation['status']) => void,
  initialComment?: string 
}) => {
  const [comment, setComment] = useState(initialComment);
  const [status, setStatus] = useState<PDFAnnotation['status']>('new_comment');

  const handleSave = () => {
    onSave(comment, status);
    setComment('');
    setStatus('new_comment');
    onClose();
  };

  return (
    <JoyModal open={open} onClose={onClose}>
      <ModalDialog sx={{ width: 400, p: 3, maxWidth: '90%' }}>
        <Typography level="h4" mb={2}>Lägg till kommentar</Typography>
        
        <FormControl sx={{ mb: 2 }}>
          <FormLabel>Status</FormLabel>
          <Select 
            value={status} 
            onChange={(_, newValue) => setStatus(newValue as PDFAnnotation['status'])}
            sx={{ width: '100%' }}
          >
            <Option value="new_comment">Ny kommentar</Option>
            <Option value="action_required">Kräver åtgärd</Option>
            <Option value="rejected">Avvisad</Option>
            <Option value="new_review">Ny granskning</Option>
            <Option value="other_forum">Annat forum</Option>
            <Option value="resolved">Åtgärdad</Option>
          </Select>
        </FormControl>
        
        <FormControl sx={{ mb: 3 }}>
          <FormLabel>Kommentar</FormLabel>
          <Textarea 
            value={comment} 
            onChange={(e) => setComment(e.target.value)} 
            minRows={3}
            placeholder="Skriv din kommentar här..."
            sx={{ width: '100%' }}
          />
        </FormControl>
        
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button variant="plain" color="neutral" onClick={onClose}>Avbryt</Button>
          <Button variant="solid" color="primary" onClick={handleSave}>Spara</Button>
        </Box>
      </ModalDialog>
    </JoyModal>
  );
};

const PDFDialogEnhanced = ({ open, onClose, pdfUrl, filename }: PDFDialogEnhancedProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processedPdfUrl, setProcessedPdfUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5); // Kommer uppdateras via PDF-visaren
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeTab, setActiveTab] = useState('detaljer');
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  
  // Markeringsläge
  const [isMarkingMode, setIsMarkingMode] = useState(false);
  const [annotations, setAnnotations] = useState<PDFAnnotation[]>([]);
  const [currentAnnotation, setCurrentAnnotation] = useState<Partial<PDFAnnotation> | null>(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);

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
      
      // Hantera markering som skickas från iframe
      (window as any).handleSelection = (selection: any) => {
        if (isMarkingMode && selection && selection.width > 5 && selection.height > 5) {
          const newAnnotation: Partial<PDFAnnotation> = {
            rect: {
              x: selection.x,
              y: selection.y,
              width: selection.width,
              height: selection.height,
              pageNumber: currentPage
            },
            color: '#FFEB3B',
            status: 'new_comment'
          };
          
          setCurrentAnnotation(newAnnotation);
          setShowCommentDialog(true);
        }
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
      delete (window as any).handleSelection;
    };
  }, [pdfUrl, open, zoomLevel, isMarkingMode, currentPage]);

  // Ladda sparade kommentarer från backend
  useEffect(() => {
    if (!open || !pdfUrl) return;
    
    // Hämta fileId från URL eller annan källa
    const getFileIdFromUrl = (url: string) => {
      // Exempel: extrahera fil-ID från URL
      // Detta måste anpassas baserat på hur din URL struktureras
      const matches = url.match(/\/project_files\/.*?\/(.*?)\.pdf/);
      if (matches && matches[1]) {
        return matches[1];
      }
      return null;
    };

    const fileId = getFileIdFromUrl(pdfUrl);
    if (fileId) {
      // Hämta befintliga annotationer från backend
      axios.get(`/api/files/annotations/?file_id=${fileId}`)
        .then(response => {
          if (response.data && Array.isArray(response.data.results)) {
            const backendAnnotations = response.data.results.map((item: any) => ({
              id: item.id.toString(),
              rect: {
                x: item.x,
                y: item.y,
                width: item.width,
                height: item.height,
                pageNumber: item.page_number
              },
              color: item.color,
              comment: item.comment,
              status: item.status,
              createdBy: item.created_by_details?.username || 'Användare',
              createdAt: item.created_at
            }));
            
            setAnnotations(backendAnnotations);
            
            // Skicka till iframe för att ritas upp
            const iframe = document.querySelector('iframe');
            if (iframe && iframe.contentWindow) {
              backendAnnotations.forEach(annotation => {
                iframe.contentWindow!.postMessage({ 
                  type: 'addAnnotation', 
                  annotation 
                }, '*');
              });
            }
          }
        })
        .catch(error => {
          console.error('Fel vid hämtning av annotationer:', error);
        });
    }
  }, [open, pdfUrl]);

  // State för notifieringar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  // Hjälpfunktion för att visa notifieringar
  const showNotification = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Hantera skapande av ny kommentar
  const handleCreateAnnotation = (comment: string, status: PDFAnnotation['status']) => {
    if (currentAnnotation) {
      // Skapa temporär annotation med lokalt ID
      const tempAnnotation: PDFAnnotation = {
        ...currentAnnotation as any,
        id: `temp-${Date.now()}`,
        comment,
        status,
        createdBy: 'Aktuell användare',
        createdAt: new Date().toISOString()
      };
      
      // Visa annotationen temporärt i UI
      setAnnotations(prev => [...prev, tempAnnotation]);
      setCurrentAnnotation(null);
      
      // Skicka meddelande till iframe för att rita upp markeringen
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ 
          type: 'addAnnotation', 
          annotation: tempAnnotation 
        }, '*');
      }
      
      // Stäng av markeringsläget efter kommentar läggs till
      setIsMarkingMode(false);
      
      // Kommunicera med iframe för att stänga av markeringsläget
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ 
          type: 'setMarkingMode', 
          enabled: false 
        }, '*');
      }
      
      // Visa meddelande om att kommentaren har lagts till
      showNotification('Kommentar har lagts till!');
      
      // Försök spara till backend
      const getFileInfo = (url: string) => {
        // Hämta filnamn från URL för visning
        const parts = url.split('/');
        const filename = parts[parts.length - 1];
        
        return {
          // För enkelhetens skull använder vi en temporär sträng-ID
          // Detta löser problemet med 500 fel när vi försöker konvertera filnamn till ID
          fileId: 'temp-file-' + Date.now(),
          filename: filename || 'unknown.pdf'
        };
      };
      
      const fileInfo = getFileInfo(pdfUrl);
      if (fileInfo) {
        const annotationData = {
          // Använd en enkel siffra som ID istället för filnamn
          file: 1,
          project: 3, // Standardprojekt-ID
          filename: fileInfo.filename, // Lägg till filnamn som ett separat fält
          x: tempAnnotation.rect.x,
          y: tempAnnotation.rect.y,
          width: tempAnnotation.rect.width,
          height: tempAnnotation.rect.height,
          page_number: tempAnnotation.rect.pageNumber,
          comment: comment,
          color: tempAnnotation.color,
          status: status
        };
        
        axios.post('/api/files/annotations/', annotationData)
          .then(response => {
            // Uppdatera annotations-listan med den persisterade versionen
            const persistedAnnotation: PDFAnnotation = {
              id: response.data.id.toString(),
              rect: {
                x: response.data.x,
                y: response.data.y,
                width: response.data.width,
                height: response.data.height,
                pageNumber: response.data.page_number
              },
              color: response.data.color,
              comment: response.data.comment,
              status: response.data.status as PDFAnnotation['status'],
              createdBy: response.data.created_by_details?.username || 'Användare',
              createdAt: response.data.created_at
            };
            
            // Ersätt den temporära annotationen med den persisterade versionen
            setAnnotations(prev => prev.map(a => 
              a.id === tempAnnotation.id ? persistedAnnotation : a
            ));
            
            console.log('Annotation sparad i databasen:', response.data);
            showNotification('Kommentaren har sparats permanent!');
          })
          .catch(error => {
            console.error('Fel vid sparande av annotation:', error);
            // Visa felmeddelande men behåll den temporära annotationen
            showNotification('Kunde inte spara kommentaren permanent, men den finns i denna session.', 'error');
          });
      }
    }
  };

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

  // Aktivera markeringsläge i iframe
  const toggleMarkingMode = () => {
    const newMarkingMode = !isMarkingMode;
    setIsMarkingMode(newMarkingMode);
    
    try {
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ 
          type: 'setMarkingMode', 
          enabled: newMarkingMode 
        }, '*');
      }
      
      // Visa hjälpmeddelande för användaren
      if (newMarkingMode) {
        showNotification('Markeringsläge aktiverat. Dra med musen för att markera ett område.', 'success');
      } else {
        showNotification('Markeringsläge avslutat. Du kan nu navigera fritt i dokumentet.', 'success');
      }
    } catch (e) {
      console.error('Kunde inte kommunicera med PDF-visaren:', e);
    }
  };

  return (
    <>
      {/* Snackbar för notifikationer */}
      <Snackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        autoHideDuration={5000}
        color={snackbarSeverity}
        size="lg"
        variant="soft"
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          variant="soft"
          color={snackbarSeverity}
          onClose={() => setSnackbarOpen(false)}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

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
                variant={isMarkingMode ? "solid" : "soft"}
                color={isMarkingMode ? "warning" : "neutral"}
                onClick={toggleMarkingMode}
                startDecorator={isMarkingMode ? <PanToolIcon /> : <EditIcon />}
              >
                {isMarkingMode ? "Avsluta markering" : "Markera område"}
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
                  src={`/pdfjs-viewer.html?url=${encodeURIComponent(processedPdfUrl)}&zoom=${zoomLevel/100}&parentOrigin=${encodeURIComponent(window.location.origin)}&enableMarking=${isMarkingMode}`}
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
                      <Typography level="body-sm" sx={{ fontWeight: 'bold', mb: 0.5 }}>Filnamn</Typography>
                      <Sheet variant="outlined" sx={{ p: 2, borderRadius: 'md' }}>
                        <Typography>{filename}</Typography>
                      </Sheet>
                    </Box>

                    <Box>
                      <Typography level="body-sm" sx={{ fontWeight: 'bold', mb: 0.5 }}>Version</Typography>
                      <Sheet variant="outlined" sx={{ p: 2, borderRadius: 'md' }}>
                        <Typography>1.0</Typography>
                      </Sheet>
                    </Box>

                    <Box>
                      <Typography level="body-sm" sx={{ fontWeight: 'bold', mb: 0.5 }}>Uppladdad</Typography>
                      <Sheet variant="outlined" sx={{ p: 2, borderRadius: 'md' }}>
                        <Typography>2025-05-19</Typography>
                      </Sheet>
                    </Box>

                    <Box>
                      <Typography level="body-sm" sx={{ fontWeight: 'bold', mb: 0.5 }}>Uppladdad av</Typography>
                      <Sheet variant="outlined" sx={{ p: 2, borderRadius: 'md' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box 
                            sx={{ 
                              width: 28, 
                              height: 28, 
                              bgcolor: 'primary.300', 
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          >
                            P
                          </Box>
                          <Typography>Per Andersson</Typography>
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
                  </>
                )}
                
                {activeTab === 'kommentarer' && (
                  <>
                    <Typography level="title-sm" mb={1}>Kommentarer ({annotations.length})</Typography>
                    
                    {annotations.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography level="body-sm" color="neutral">
                          Inga kommentarer än. Använd "Markera område" för att lägga till kommentarer.
                        </Typography>
                      </Box>
                    ) : (
                      annotations.map(annotation => (
                        <Sheet
                          key={annotation.id}
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 'md',
                            borderLeft: '3px solid',
                            borderColor: annotation.status === 'resolved' ? 'success.500' : 
                                        annotation.status === 'action_required' ? 'warning.500' :
                                        annotation.status === 'rejected' ? 'danger.500' : 'primary.500',
                            mb: 1
                          }}
                        >
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            mb: 1 
                          }}>
                            <Typography level="body-sm" sx={{ fontWeight: 'bold' }}>
                              {annotation.createdBy}
                            </Typography>
                            <Typography level="body-xs" color="neutral">
                              {new Date(annotation.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Typography level="body-sm" mb={1}>
                            {annotation.comment}
                          </Typography>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center' 
                          }}>
                            <Typography 
                              level="body-xs" 
                              sx={{ 
                                px: 1, 
                                py: 0.5, 
                                bgcolor: annotation.status === 'resolved' ? 'success.100' : 
                                         annotation.status === 'action_required' ? 'warning.100' :
                                         annotation.status === 'rejected' ? 'danger.100' : 'primary.100',
                                color: annotation.status === 'resolved' ? 'success.800' : 
                                       annotation.status === 'action_required' ? 'warning.800' :
                                       annotation.status === 'rejected' ? 'danger.800' : 'primary.800',
                                borderRadius: 'sm',
                                fontWeight: 'medium'
                              }}
                            >
                              {annotation.status === 'new_comment' ? 'Ny kommentar' :
                               annotation.status === 'action_required' ? 'Kräver åtgärd' :
                               annotation.status === 'rejected' ? 'Avvisad' :
                               annotation.status === 'new_review' ? 'Ny granskning' :
                               annotation.status === 'other_forum' ? 'Annat forum' : 'Åtgärdad'}
                            </Typography>
                            <Button 
                              size="sm" 
                              variant="plain" 
                              onClick={() => {
                                // Zooma till annoteringen
                                const iframe = document.querySelector('iframe');
                                if (iframe && iframe.contentWindow) {
                                  iframe.contentWindow.postMessage({ 
                                    type: 'zoomToAnnotation', 
                                    annotation 
                                  }, '*');
                                }
                              }}
                            >
                              Visa
                            </Button>
                          </Box>
                        </Sheet>
                      ))
                    )}
                  </>
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

      {/* Dialogruta för att lägga till kommentar */}
      {showCommentDialog && (
        <CommentDialog 
          open={showCommentDialog} 
          onClose={() => {
            setShowCommentDialog(false);
            setCurrentAnnotation(null);
          }} 
          onSave={handleCreateAnnotation}
          initialComment=""
        />
      )}
    </>
  );
};

export default PDFDialogEnhanced;