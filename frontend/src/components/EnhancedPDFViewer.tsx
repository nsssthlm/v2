import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import axios from "axios";

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
  Upload,
  ExternalLink,
  FileDown 
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
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfSource, setPdfSource] = useState<string | ArrayBuffer | null>(null);
  const [attemptedUrls, setAttemptedUrls] = useState<string[]>([]);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  
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

  // Funktion för att öppna PDF i ny flik
  const openInNewTab = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
    } else if (pdfSource && typeof pdfSource === 'string') {
      window.open(pdfSource, '_blank');
    } else if (initialUrl) {
      window.open(initialUrl, '_blank');
    }
  };

  // Ladda PDF från URL eller Blob
  useEffect(() => {
    const loadPdf = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 1. Använd pdfFile prop om tillgänglig
        if (pdfFile) {
          console.log('Använder tillhandahållen pdfFile blob');
          setPdfSource(pdfFile);
          setPdfBlob(pdfFile);
          return;
        }
        
        // 2. Använd file prop om tillgänglig
        if (file) {
          console.log('Använder tillhandahållen file');
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              setPdfSource(e.target.result);
              setPdfBlob(file);
            }
          };
          reader.readAsArrayBuffer(file);
          return;
        }
        
        // 3. Använd initialUrl
        if (initialUrl) {
          console.log('Försöker hämta PDF från URL:', initialUrl);
          setAttemptedUrls(prev => [...prev, initialUrl]);
          
          // Försöker hämta via axios
          const response = await axios.get(initialUrl, {
            responseType: 'blob',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
          
          if (response.status === 200) {
            console.log('PDF hämtad, skapar blob URL');
            const blob = new Blob([response.data], { type: 'application/pdf' });
            setPdfSource(URL.createObjectURL(blob));
            setPdfBlob(blob);
            return;
          }
        }
        
        // 4. Försök med fileId om tillgängligt
        if (fileId) {
          console.log('Försöker hämta PDF via fileId:', fileId);
          const apiUrl = `/api/files/get-file-content/${fileId}/`;
          setAttemptedUrls(prev => [...prev, apiUrl]);
          
          try {
            const response = await axios.get(apiUrl, {
              responseType: 'blob',
              headers: {
                'Cache-Control': 'no-cache'
              }
            });
            
            if (response.status === 200) {
              const blob = new Blob([response.data], { type: 'application/pdf' });
              setPdfSource(URL.createObjectURL(blob));
              setPdfBlob(blob);
              return;
            }
          } catch (apiError) {
            console.error('Kunde inte hämta PDF via fileId:', apiError);
          }
        }
        
        // Om vi når hit, har alla våra försök misslyckats
        throw new Error('Kunde inte ladda PDF-dokumentet');
      } catch (err) {
        console.error('Fel vid laddning av PDF:', err);
        setError(err instanceof Error ? err.message : 'Kunde inte ladda PDF-dokumentet');
      } finally {
        setLoading(false);
      }
    };
    
    loadPdf();
    
    // Cleanup när komponenten avmonteras
    return () => {
      if (typeof pdfSource === 'string' && pdfSource.startsWith('blob:')) {
        URL.revokeObjectURL(pdfSource);
      }
    };
  }, [fileId, initialUrl, file, pdfFile]);

  // Render fallback om det blev fel
  const renderErrorFallback = () => (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      p: 3,
      gap: 2
    }}>
      <Typography level="title-lg" color="danger">
        Kunde inte ladda PDF
      </Typography>
      <Typography level="body-md" sx={{ mb: 2 }}>
        {error || 'Det gick inte att visa dokumentet. Försök igen eller öppna i ny flik.'}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          onClick={openInNewTab}
          variant="solid"
          color="primary"
          startDecorator={<ExternalLink size={16} />}
        >
          Öppna i ny flik
        </Button>
        {initialUrl && (
          <Button 
            component="a"
            href={initialUrl}
            download={filename}
            variant="outlined"
            color="neutral"
            startDecorator={<FileDown size={16} />}
          >
            Ladda ner
          </Button>
        )}
      </Box>
      {attemptedUrls.length > 0 && (
        <Box sx={{ mt: 3, maxWidth: '100%', overflow: 'hidden' }}>
          <Typography level="body-sm" color="neutral">
            Försökte med följande källor:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mt: 1, fontSize: '0.75rem', color: 'text.tertiary' }}>
            {attemptedUrls.map((url, index) => (
              <Box component="li" key={index} sx={{ wordBreak: 'break-all' }}>
                {url}
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );

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
              disabled={currentPage <= 1 || loading || error !== null}
            >
              <ChevronLeft size={16} />
            </IconButton>
            <Typography level="body-sm" sx={{ mx: 1 }}>
              Sida {currentPage} av {totalPages || '-'}
            </Typography>
            <IconButton 
              size="sm" 
              variant="soft" 
              color="primary" 
              onClick={goToNextPage}
              disabled={currentPage >= totalPages || loading || error !== null}
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
              disabled={loading || error !== null}
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
              disabled={loading || error !== null}
            >
              <ZoomIn size={16} />
            </IconButton>
          </Box>
          
          {/* Action buttons */}
          <Button
            size="sm"
            variant="soft"
            color="primary"
            startDecorator={<FileDown size={16} />}
            onClick={openInNewTab}
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
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center',
              height: '100%',
              gap: 2
            }}>
              <CircularProgress size="lg" />
              <Typography level="body-sm" sx={{ color: 'white' }}>
                Laddar PDF...
              </Typography>
            </Box>
          ) : error ? (
            renderErrorFallback()
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
                file={pdfSource}
                onLoadSuccess={({ numPages }) => {
                  console.log('PDF laddad framgångsrikt, antal sidor:', numPages);
                  setTotalPages(numPages);
                  setLoading(false);
                }}
                onLoadError={(error) => {
                  console.error("Error loading PDF:", error);
                  setError("Kunde inte ladda PDF: " + (error.message || 'Okänt fel'));
                }}
                loading={<CircularProgress />}
              >
                {totalPages > 0 && (
                  <Box ref={pageRef}>
                    <Page
                      pageNumber={currentPage}
                      scale={currentZoom / 100}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      loading={
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                          <CircularProgress size="sm" />
                        </Box>
                      }
                      error={
                        <Typography level="body-sm" color="danger" sx={{ p: 2 }}>
                          Kunde inte rendera sidan.
                        </Typography>
                      }
                    />
                  </Box>
                )}
              </Document>
              
              {/* Blå sidramen för designen */}
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
          )}
          
          {/* Progress bar at bottom */}
          {!loading && !error && totalPages > 0 && (
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
                  bgcolor: '#1976d2'
                }}
              />
            </Box>
          )}
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