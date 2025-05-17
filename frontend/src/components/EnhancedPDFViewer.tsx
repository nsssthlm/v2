import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

import { 
  Sheet, 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  CircularProgress,
  Divider
} from '@mui/joy';

// Konfigurera PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Icons
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DownloadIcon from '@mui/icons-material/Download';
import CommentIcon from '@mui/icons-material/Comment';
import HistoryIcon from '@mui/icons-material/History';

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
  new_comment: '#FF69B4',      // HotPink (Rosa)
  action_required: '#FF0000',  // Röd
  rejected: '#808080',         // Grå
  new_review: '#FFA500',       // Orange
  other_forum: '#4169E1',      // RoyalBlue (Blå)
  resolved: '#ADFF2F',         // GreenYellow (Grön)
  
  // Backward compatibility for old status values
  open: '#FF69B4',             // Mappa till new_comment (Rosa)
  reviewing: '#FFA500'         // Mappa till new_review (Orange)
};

interface EnhancedPDFViewerProps {
  fileId?: string | number;
  initialUrl?: string;
  filename?: string;
  onClose?: () => void;
  projectId?: number | null;
  useDatabase?: boolean;
  file?: File | null;
  // Parameters for direct PDF viewing with annotations
  versionId?: number;
  pdfFile?: Blob | null;
  highlightAnnotationId?: number;
  annotationId?: number;
  // Dialog mode flag - när true visas PDF:en i dialog/popup-läge
  isDialogMode?: boolean;
  // Folder association - vilken mapp filen tillhör
  folderId?: number | null;
}

type Position = { x: number; y: number };

export default function EnhancedPDFViewer({
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
}: EnhancedPDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // Annotations and commenting
  const [annotations, setAnnotations] = useState<PDFAnnotation[]>([]);
  const [activeAnnotation, setActiveAnnotation] = useState<PDFAnnotation | null>(null);
  
  // Version management
  const [fileVersions, setFileVersions] = useState<FileVersion[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(initialUrl);
  
  // Current sidebar view mode
  const [sidebarMode, setSidebarMode] = useState<'details' | 'history' | 'comment'>('details');
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  // Load PDF data when component mounts
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

  // Handle document load success
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  // Handle document load error
  const onDocumentLoadError = (error: Error) => {
    console.error("Error loading PDF document:", error);
    setLoading(false);
  };

  // Handle page navigation
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

  // Handle zoom
  function zoomIn() {
    setScale(prevScale => Math.min(prevScale + 0.2, 3));
  }

  function zoomOut() {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  }

  // Close handler
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
    <div className="flex flex-col h-full w-full overflow-hidden" style={{ height: isDialogMode ? '90vh' : '100%', backgroundColor: '#f9fafb' }}>
      {/* Toolbar */}
      <Sheet
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'white'
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
          <IconButton 
            variant="outlined" 
            color="neutral" 
            size="sm"
            onClick={zoomOut}
            disabled={scale <= 0.5}
          >
            <ZoomOutIcon fontSize="small" />
          </IconButton>
          
          <Typography level="body-sm" sx={{ width: '60px', textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </Typography>
          
          <IconButton 
            variant="outlined" 
            color="neutral" 
            size="sm"
            onClick={zoomIn}
            disabled={scale >= 3}
          >
            <ZoomInIcon fontSize="small" />
          </IconButton>
          
          <Divider orientation="vertical" sx={{ mx: 1, height: '20px' }} />
          
          <IconButton 
            variant="outlined" 
            color="neutral" 
            size="sm"
            onClick={previousPage}
            disabled={pageNumber <= 1}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          
          <Typography level="body-sm" sx={{ width: '80px', textAlign: 'center', whiteSpace: 'nowrap' }}>
            {pageNumber} / {numPages || '-'}
          </Typography>
          
          <IconButton 
            variant="outlined" 
            color="neutral" 
            size="sm"
            onClick={nextPage}
            disabled={!numPages || pageNumber >= numPages}
          >
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button 
            variant="outlined"
            color="neutral" 
            size="sm"
            startDecorator={<CommentIcon fontSize="small" />}
            onClick={() => setSidebarMode(sidebarMode === 'comment' ? 'details' : 'comment')}
          >
            Kommentarer
          </Button>
          
          <Button 
            variant="outlined"
            color="neutral" 
            size="sm"
            startDecorator={<HistoryIcon fontSize="small" />}
            onClick={() => setSidebarMode(sidebarMode === 'history' ? 'details' : 'history')}
          >
            Versioner
          </Button>
          
          <IconButton 
            variant="outlined" 
            color="neutral" 
            size="sm"
            onClick={downloadPdf}
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Box>
      </Sheet>
      
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Main PDF Viewer */}
        <Box 
          ref={pdfContainerRef}
          sx={{ 
            flex: 1, 
            overflow: 'auto', 
            backgroundColor: '#edf2f7',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <CircularProgress size="lg" />
              <Typography level="body-lg" sx={{ ml: 2 }}>Laddar dokument...</Typography>
            </Box>
          ) : pdfUrl ? (
            <Box 
              ref={containerRef}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                minHeight: '100%',
                p: 4
              }}
            >
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
                <Box ref={pageRef}>
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
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography level="h3" color="danger">
                Ingen PDF vald eller kunde inte ladda dokumentet
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Sidebar - conditionally shown based on sidebarMode */}
        {sidebarMode !== 'details' && (
          <Sheet
            sx={{
              width: 320,
              borderLeft: '1px solid',
              borderColor: 'divider',
              p: 2,
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {sidebarMode === 'comment' && (
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
            
            {sidebarMode === 'history' && (
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
                          variant="plain" 
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
          </Sheet>
        )}
      </Box>
    </div>
  );
}