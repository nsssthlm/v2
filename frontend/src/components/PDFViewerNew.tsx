import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Joy UI komponenter
import { 
  Sheet, 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  CircularProgress,
  Divider,
  Tab,
  TabList,
  Tabs,
  Avatar
} from '@mui/joy';

// Konfigurera PDF.js worker med en CDN som är säkrare
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// Icons
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DownloadIcon from '@mui/icons-material/Download';
import CommentIcon from '@mui/icons-material/Comment';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';

// PDF Annotation interface
export interface PDFAnnotation {
  id: string;
  pdfVersionId?: number;
  projectId?: number | null;
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
  assignedTo?: string;
  taskId?: string;
  deadline?: string;
}

// File Version interface
export interface FileVersion {
  id: string;
  versionNumber: number;
  filename: string;
  fileUrl: string;
  description: string;
  uploaded: string;
  uploadedBy: string;
  commentCount?: number;
}

// Status color mapping
const statusColors = {
  new_comment: '#FF69B4',      // HotPink
  action_required: '#FF0000',  // Röd
  rejected: '#808080',         // Grå
  new_review: '#FFA500',       // Orange
  other_forum: '#4169E1',      // RoyalBlue
  resolved: '#ADFF2F',         // GreenYellow
  
  // Bakåtkompatibilitet
  open: '#FF69B4',
  reviewing: '#FFA500'
};

interface PDFViewerProps {
  fileId?: string | number;
  initialUrl?: string;
  filename?: string;
  onClose?: () => void;
  projectId?: number | null;
  useDatabase?: boolean;
  file?: File | null;
  versionId?: number;
  pdfFile?: Blob | null;
  highlightAnnotationId?: number;
  annotationId?: number;
  isDialogMode?: boolean;
  folderId?: number | null;
}

export default function PDFViewer({
  fileId,
  initialUrl,
  filename,
  onClose,
  projectId,
  useDatabase = false,
  file,
  versionId,
  pdfFile,
  highlightAnnotationId,
  annotationId,
  isDialogMode = false,
  folderId
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // Annotations och kommentarer
  const [annotations, setAnnotations] = useState<PDFAnnotation[]>([]);
  const [activeAnnotation, setActiveAnnotation] = useState<PDFAnnotation | null>(null);
  
  // Versionshantering
  const [fileVersions, setFileVersions] = useState<FileVersion[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(initialUrl);
  
  // Sidebar-läge
  const [sidebarTab, setSidebarTab] = useState<string>('details');
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  // Ladda PDF-data när komponenten monteras
  useEffect(() => {
    async function loadData() {
      try {
        // Om vi har en direkt fil, använd den
        if (file) {
          const url = URL.createObjectURL(file);
          setPdfUrl(url);
          setLoading(false);
          return;
        }

        // Om vi har en URL, använd den
        if (initialUrl) {
          setPdfUrl(initialUrl);
          setLoading(false);
          return;
        }
        
        // I en verklig implementation skulle vi hämta från server här
        setLoading(false);
      } catch (error) {
        console.error("Error loading PDF data:", error);
        setLoading(false);
      }
    }
    
    loadData();
  }, [fileId, initialUrl, file, folderId]);

  // Hantera framgångsrik dokumentladdning
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  // Hantera fel vid dokumentladdning
  const onDocumentLoadError = (error: Error) => {
    console.error("Error loading PDF document:", error);
    setLoading(false);
  };

  // Hantera sidnavigering
  function changePage(offset: number) {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.max(1, Math.min(numPages || 1, newPageNumber));
    });
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  // Hantera zoom
  function zoomIn() {
    setScale(prevScale => Math.min(prevScale + 0.2, 3));
  }

  function zoomOut() {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  }

  // Stäng-hanterare
  function handleClose() {
    if (onClose) onClose();
  }

  // Funktion för att ladda ner PDF
  function downloadPdf() {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = filename || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: isDialogMode ? '90vh' : '100%', 
        width: '100%',
        bgcolor: '#f9fafb',
        overflow: 'hidden'
      }}
    >
      {/* Övre verktygsfält (toolbar) */}
      <Sheet
        variant="outlined"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {onClose && (
            <IconButton 
              variant="plain" 
              color="neutral" 
              size="sm" 
              onClick={handleClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
          <Typography level="title-md" sx={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {filename || "Dokument"}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Sidnavigering */}
          <Button
            size="sm"
            variant="soft"
            color="primary"
            sx={{ 
              borderRadius: '4px 0 0 4px', 
              bgcolor: 'primary.100',
              '&:hover': { bgcolor: 'primary.200' } 
            }}
          >
            Sida {pageNumber} av {numPages || '-'}
          </Button>
          
          {/* Prev/Next knappar */}
          <IconButton 
            variant="soft"
            color="primary" 
            size="sm"
            onClick={previousPage}
            disabled={pageNumber <= 1}
            sx={{ borderRadius: 0 }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          
          <IconButton 
            variant="soft"
            color="primary" 
            size="sm"
            onClick={nextPage}
            disabled={!numPages || pageNumber >= numPages}
            sx={{ borderRadius: '0 4px 4px 0' }}
          >
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
          
          {/* Zoom knappar */}
          <IconButton 
            variant="soft"
            color="primary" 
            size="sm"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            sx={{ 
              borderRadius: '4px 0 0 4px',
              ml: 1
            }}
          >
            <ZoomOutIcon fontSize="small" />
          </IconButton>
          
          <Button
            size="sm"
            variant="soft"
            color="primary"
            sx={{ 
              borderRadius: 0,
              minWidth: '60px',
              bgcolor: 'primary.100',
              '&:hover': { bgcolor: 'primary.100' } 
            }}
          >
            {Math.round(scale * 100)}%
          </Button>
          
          <IconButton 
            variant="soft"
            color="primary" 
            size="sm"
            onClick={zoomIn}
            disabled={scale >= 3}
            sx={{ borderRadius: '0 4px 4px 0' }}
          >
            <ZoomInIcon fontSize="small" />
          </IconButton>
          
          {/* Funktionsknappar */}
          <Button
            variant="soft"
            color="primary"
            size="sm"
            startDecorator={<AddIcon />}
            sx={{ ml: 1 }}
          >
            Lägg till kommentar
          </Button>
          
          <Button
            variant="soft"
            color="primary"
            size="sm"
            startDecorator={<DownloadIcon />}
            onClick={downloadPdf}
          >
            Ladda ner
          </Button>
          
          <Button
            variant="soft"
            color="primary"
            size="sm"
            startDecorator={<CheckCircleIcon />}
          >
            Markera som granskad
          </Button>
          
          <Button
            variant="soft"
            color="primary"
            size="sm"
            startDecorator={<AddIcon />}
          >
            Ny version
          </Button>
        </Box>
      </Sheet>
      
      {/* Huvudinnehåll */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* PDF-visare */}
        <Box 
          ref={pdfContainerRef}
          sx={{ 
            flex: 1, 
            overflow: 'auto', 
            bgcolor: '#333', // Mörk bakgrund
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white' }}>
              <CircularProgress size="lg" />
              <Typography level="body-lg" sx={{ ml: 2, color: 'white' }}>Laddar dokument...</Typography>
            </Box>
          ) : pdfUrl ? (
            <Box 
              ref={containerRef}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                minHeight: '100%',
                p: 4,
                position: 'relative'
              }}
            >
              {/* Progressbar för PDF-läsning */}
              <Box sx={{ 
                position: 'absolute', 
                bottom: '8px', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                width: '80%', 
                height: '4px', 
                bgcolor: '#1b1b1b',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <Box sx={{ 
                  width: numPages ? `${(pageNumber / numPages) * 100}%` : '0%', 
                  height: '100%', 
                  bgcolor: '#4caf50', // Grön progressindikator
                  transition: 'width 0.3s'
                }} />
              </Box>
              
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px' }}>
                    <CircularProgress size="sm" />
                  </Box>
                }
              >
                <Box 
                  ref={pageRef} 
                  sx={{ 
                    bgcolor: 'white',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    mb: 4
                  }}
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                </Box>
              </Document>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white' }}>
              <Typography level="h3">
                Ingen PDF vald eller kunde inte ladda dokumentet
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Högersidebar */}
        <Sheet
          variant="soft"
          sx={{
            width: 320,
            borderLeft: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'white'
          }}
        >
          {/* Flikar */}
          <Tabs 
            value={sidebarTab}
            onChange={(_, value) => setSidebarTab(value as string)}
            sx={{ 
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          >
            <TabList variant="plain" sx={{ width: '100%' }}>
              <Tab value="details" variant={sidebarTab === 'details' ? 'soft' : 'plain'} sx={{ flex: 1 }}>Detaljer</Tab>
              <Tab value="history" variant={sidebarTab === 'history' ? 'soft' : 'plain'} sx={{ flex: 1 }}>Historik</Tab>
              <Tab value="comments" variant={sidebarTab === 'comments' ? 'soft' : 'plain'} sx={{ flex: 1 }}>Kommentar</Tab>
            </TabList>
          </Tabs>
          
          {/* Fliktinnehåll */}
          <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
            {sidebarTab === 'details' && (
              <>
                <Typography level="h4" sx={{ mb: 2 }}>PDF Anteckning</Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                    Skapad av
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      size="sm"
                      variant="soft"
                      color="primary"
                    />
                    <Box>
                      <Typography level="body-sm">user@example.com</Typography>
                      <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                        2025-05-16
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                    Deadline
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography level="body-sm">22 maj 2025</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                    Granskningspaket
                  </Typography>
                  <Typography level="body-sm">K - Granskning BH Hus 3-4</Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                    Typ
                  </Typography>
                  <Typography level="body-sm">Gransknings kommentar</Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                    Aktivitet
                  </Typography>
                  <Button 
                    variant="outlined"
                    color="primary"
                    size="sm"
                    fullWidth
                    sx={{ justifyContent: 'center', mt: 1 }}
                  >
                    VERSIONER
                  </Button>
                </Box>
              </>
            )}
            
            {sidebarTab === 'comments' && (
              <>
                <Typography level="h4" sx={{ mb: 2 }}>Kommentarer</Typography>
                {annotations.length === 0 ? (
                  <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                    Inga kommentarer har lagts till än. Markera ett område i dokumentet för att lägga till en kommentar.
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {annotations.map(annotation => (
                      <Sheet 
                        key={annotation.id}
                        variant="outlined"
                        sx={{ 
                          p: 2, 
                          borderRadius: 'sm',
                          borderLeft: '4px solid',
                          borderLeftColor: statusColors[annotation.status] || 'primary.main'
                        }}
                      >
                        <Typography level="body-sm" fontWeight="bold">
                          {annotation.createdBy}
                        </Typography>
                        <Typography level="body-xs" sx={{ color: 'text.secondary', mb: 1 }}>
                          {new Date(annotation.createdAt).toLocaleString()}
                        </Typography>
                        <Typography level="body-sm">{annotation.comment}</Typography>
                      </Sheet>
                    ))}
                  </Box>
                )}
              </>
            )}
            
            {sidebarTab === 'history' && (
              <>
                <Typography level="h4" sx={{ mb: 2 }}>Versionshistorik</Typography>
                {fileVersions.length === 0 ? (
                  <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                    Ingen versionshistorik tillgänglig för detta dokument.
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {fileVersions.map(version => (
                      <Sheet 
                        key={version.id}
                        variant="outlined"
                        sx={{ p: 2, borderRadius: 'sm' }}
                      >
                        <Typography level="body-sm" fontWeight="bold">
                          Version {version.versionNumber}: {version.filename}
                        </Typography>
                        <Typography level="body-xs" sx={{ color: 'text.secondary', mb: 1 }}>
                          Uppladdad av {version.uploadedBy} den {version.uploaded}
                        </Typography>
                        {version.description && (
                          <Typography level="body-sm">{version.description}</Typography>
                        )}
                        <Button 
                          variant="soft" 
                          color="primary" 
                          size="sm" 
                          sx={{ mt: 1 }}
                        >
                          Visa denna version
                        </Button>
                      </Sheet>
                    ))}
                  </Box>
                )}
              </>
            )}
          </Box>
        </Sheet>
      </Box>
    </Box>
  );
}