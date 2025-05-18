import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Sheet, 
  Tabs,
  TabList,
  Tab,
  Avatar,
  CircularProgress
} from '@mui/joy';

// Import Lucide icons
import { 
  ChevronLeft, 
  ChevronRight,
  ZoomIn, 
  ZoomOut,
  X,
  Upload 
} from "lucide-react";

// Konfigurera PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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

interface EnhancedPDFViewerProps {
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

const EnhancedPDFViewer = ({
  fileId,
  initialUrl,
  filename = 'PDF Dokument',
  onClose,
  projectId,
  useDatabase = true,
  file,
  versionId,
  pdfFile,
  highlightAnnotationId,
  annotationId,
  isDialogMode = false,
  folderId
}: EnhancedPDFViewerProps) => {
  const [activeTab, setActiveTab] = useState<string>('detaljer');
  const [currentZoom, setCurrentZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5);
  const [loading, setLoading] = useState(true);
  
  // Referens till PDF container
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  
  // Funktioner för navigering
  const zoomIn = () => {
    setCurrentZoom(prev => Math.min(prev + 10, 200));
  };
  
  const zoomOut = () => {
    setCurrentZoom(prev => Math.max(prev - 10, 50));
  };
  
  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
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
            <X size={18} />
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
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
            >
              <ChevronLeft size={16} />
            </IconButton>
            <Typography level="body-sm" sx={{ mx: 1 }}>
              Sida {currentPage} av {totalPages}
            </Typography>
            <IconButton 
              size="sm" 
              variant="soft" 
              color="primary" 
              onClick={goToNextPage}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight size={16} />
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
              <ZoomOut size={16} />
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
              <ZoomIn size={16} />
            </IconButton>
          </Box>
          
          {/* Action buttons */}
          <Button
            size="sm"
            variant="soft"
            color="primary"
          >
            Ladda ner
          </Button>
          
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
            color="primary"
          >
            Markera område
          </Button>
          
          <Button
            size="sm"
            variant="soft"
            color="primary"
            startDecorator={<Upload size={16} />}
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
          ref={pdfContainerRef}
        >
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: '100%'
            }}>
              <CircularProgress size="lg" />
            </Box>
          ) : (
            <Box 
              sx={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                bgcolor: '#333',
                overflow: 'auto',
                position: 'relative',
                p: 2
              }}
              ref={containerRef}
            >
              <Document
                file={initialUrl}
                onLoadSuccess={({ numPages }) => {
                  setTotalPages(numPages);
                  setLoading(false);
                }}
                onLoadError={(error) => console.error("Error loading PDF:", error)}
                loading={<CircularProgress />}
              >
                <Box ref={pageRef}>
                  <Page
                    pageNumber={currentPage}
                    scale={currentZoom / 100}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                </Box>
              </Document>
              
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
          )}
          
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
                width: `${(currentPage / totalPages) * 100}%`, 
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
  );
};

export default EnhancedPDFViewer;