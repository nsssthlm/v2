import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

import { 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  MessageSquare,
  ZoomIn, 
  ZoomOut,
  Download,
  X,
  Check,
  AlertCircle,
  ArrowLeft,
  Upload,
  History,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

// Konfigurera PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// PDF Annotation interface
export interface PDFAnnotation {
  id: string;
  pdfVersionId?: number; // Stöd för versionId
  projectId?: number | null; // Stöd för projektId
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
  deadline?: string; // Deadline för annotationen
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
  annotationId?: number; // ID för att fokusera på en specifik annotation
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
  const { user } = useAuth();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState<Position>({ x: 0, y: 0 });
  
  // Annotations and commenting
  const [isMarking, setIsMarking] = useState(false);
  const [markingStart, setMarkingStart] = useState<Position | null>(null);
  const [markingEnd, setMarkingEnd] = useState<Position | null>(null);
  const [annotations, setAnnotations] = useState<PDFAnnotation[]>([]);
  const [activeAnnotation, setActiveAnnotation] = useState<PDFAnnotation | null>(null);
  const [newComment, setNewComment] = useState('');
  const [newTask, setNewTask] = useState('');
  const [assignTo, setAssignTo] = useState<string | undefined>(undefined);
  const [tempAnnotation, setTempAnnotation] = useState<Partial<PDFAnnotation> | null>(null);
  
  // Version management
  const [fileVersions, setFileVersions] = useState<FileVersion[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<string | number | undefined>(undefined);
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(initialUrl);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [uploadingVersion, setUploadingVersion] = useState(false);
  const [newVersionFile, setNewVersionFile] = useState<File | null>(null);
  const [newVersionDescription, setNewVersionDescription] = useState('');
  
  // Current sidebar view mode
  const [sidebarMode, setSidebarMode] = useState<'details' | 'history' | 'comment'>('details');
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load PDF data when component mounts
  useEffect(() => {
    async function loadData() {
      try {
        // Fallback till fileId om versionId inte är tillgängligt
        const numericFileId = fileId ? Number(fileId) : undefined;
        console.log(`Laddar PDF-data för fileId: ${fileId} (numeriskt: ${numericFileId}), folderId: ${folderId}`);
        
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
        
        // Ladda från API om vi har ett fileId
        if (numericFileId) {
          try {
            // Hämta innehåll från API:et
            const response = await fetch(`/api/pdf/${numericFileId}/content/`, {
              method: 'GET',
              credentials: 'include'
            });
            
            if (!response.ok) {
              throw new Error(`Kunde inte ladda PDF-innehåll: ${response.status}`);
            }
            
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
            
            // Hämta annotationer
            try {
              const annotationsResponse = await fetch(`/api/pdf/${numericFileId}/annotations/`, {
                method: 'GET',
                credentials: 'include'
              });
              
              if (annotationsResponse.ok) {
                const data = await annotationsResponse.json();
                if (data.annotations && Array.isArray(data.annotations)) {
                  setAnnotations(data.annotations);
                }
              }
            } catch (error) {
              console.error("Kunde inte ladda annotationer:", error);
            }
            
            setLoading(false);
          } catch (error) {
            console.error("Fel vid laddning av PDF från API:", error);
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
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

  return (
    <div className="flex flex-col h-full w-full bg-gray-100 overflow-hidden">
      {/* Toolbar */}
      <div className="flex justify-between items-center p-2 bg-white border-b">
        <div className="flex items-center space-x-2">
          {onClose && (
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4 mr-1" />
              Stäng
            </Button>
          )}
          <div className="text-sm font-medium truncate max-w-[200px]">
            {filename || "Dokument"}
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button 
            variant="outline" 
            size="sm"
            onClick={zoomOut}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <span className="text-xs w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={zoomIn}
            disabled={scale >= 3}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <span className="text-xs px-2 text-slate-600">|</span>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={previousPage}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-xs whitespace-nowrap">
            {pageNumber} / {numPages || '-'}
          </span>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={nextPage}
            disabled={!numPages || pageNumber >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSidebarMode(sidebarMode === 'comment' ? 'details' : 'comment')}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Kommentarer
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSidebarMode(sidebarMode === 'history' ? 'details' : 'history')}
          >
            <History className="h-4 w-4 mr-1" />
            Versioner
          </Button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main PDF Viewer */}
        <div 
          className="flex-1 overflow-auto bg-gray-200" 
          ref={pdfContainerRef}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <span className="ml-2">Laddar dokument...</span>
            </div>
          ) : pdfUrl ? (
            <div 
              className="flex justify-center min-h-full p-4"
              ref={containerRef}
            >
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center h-20">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                }
              >
                <div ref={pageRef}>
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                </div>
              </Document>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <AlertCircle className="h-12 w-12 mb-2" />
              <p>Ingen PDF vald eller kunde inte ladda dokumentet</p>
            </div>
          )}
        </div>
        
        {/* Sidebar - conditionally shown based on sidebarMode */}
        {sidebarMode !== 'details' && (
          <div className="w-80 bg-white border-l overflow-y-auto">
            {sidebarMode === 'comment' && (
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Kommentarer</h3>
                {annotations.length === 0 ? (
                  <p className="text-slate-500 text-sm">
                    Inga kommentarer har lagts till än.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {annotations.map(annotation => (
                      <div 
                        key={annotation.id}
                        className={`p-3 border rounded-md ${
                          activeAnnotation?.id === annotation.id 
                            ? 'border-primary bg-primary/10' 
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarFallback>{annotation.createdBy.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{annotation.createdBy}</span>
                          </div>
                          <Badge 
                            variant="outline"
                            style={{ backgroundColor: statusColors[annotation.status] + '20', borderColor: statusColors[annotation.status] }}
                          >
                            {annotation.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm mb-1">{annotation.comment}</p>
                        <div className="flex justify-between items-center text-xs text-slate-500 mt-2">
                          <span>
                            <Clock className="h-3 w-3 inline mr-1" />
                            {new Date(annotation.createdAt).toLocaleDateString()}
                          </span>
                          <span>
                            Sida {annotation.rect.pageNumber}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {sidebarMode === 'history' && (
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Versionshistorik</h3>
                
                {uploadingVersion ? (
                  <div className="mb-4 p-3 border rounded-md">
                    <h4 className="text-sm font-medium mb-2">Ladda upp ny version</h4>
                    <Input 
                      type="file" 
                      accept="application/pdf"
                      className="mb-2"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setNewVersionFile(e.target.files[0]);
                        }
                      }}
                    />
                    <Textarea
                      placeholder="Versionsbeskrivning..."
                      className="mb-2 h-20"
                      value={newVersionDescription}
                      onChange={(e) => setNewVersionDescription(e.target.value)}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setUploadingVersion(false)}>
                        Avbryt
                      </Button>
                      <Button size="sm">
                        <Upload className="h-4 w-4 mr-1" />
                        Ladda upp
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    className="mb-4 w-full"
                    onClick={() => setUploadingVersion(true)}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Ladda upp ny version
                  </Button>
                )}
                
                {fileVersions.length === 0 ? (
                  <p className="text-slate-500 text-sm">
                    Inga tidigare versioner tillgängliga.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {fileVersions.map((version) => (
                      <div 
                        key={version.id}
                        className={`p-3 border rounded-md cursor-pointer ${
                          version.id === activeVersionId 
                            ? 'border-primary bg-primary/10' 
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                        onClick={() => {
                          // Här skulle vi hämta och visa den valda versionen
                        }}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <span className="text-sm font-medium">Version {version.versionNumber}</span>
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(version.uploaded).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700">{version.description || "Ingen beskrivning"}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-slate-500">{version.uploadedBy}</span>
                          {version.commentCount !== undefined && version.commentCount > 0 && (
                            <span className="text-xs flex items-center">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {version.commentCount}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}