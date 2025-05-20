import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CircularProgress, 
  Grid, 
  Stack, 
  Divider, 
  Sheet,
  IconButton,
  Tooltip,
  Modal,
  ModalDialog,
  ModalClose,
  Input
} from '@mui/joy';
import AddIcon from '@mui/icons-material/Add';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DownloadIcon from '@mui/icons-material/Download';
import HistoryIcon from '@mui/icons-material/History';
import { useProject } from '../../../contexts/ProjectContext';
import { format } from 'date-fns';

// Import PDF utilities and library
import { 
  getLatestPDFVersion, 
  getPDFVersions,
  getPDFVersionContent,
  uploadPDFVersion
} from '../../../lib/pdf-utils';

// File Version interface
interface FileVersion {
  id: string;
  versionNumber: number;
  filename: string;
  fileUrl: string;
  description: string;
  uploaded: string;
  uploadedBy: string;
}

// Sample project files to display in the UI
const SAMPLE_PROJECT_FILES = [
  {
    id: '1',
    name: 'Byggritning huvudentré',
    category: 'Ritningar',
    uploadedBy: 'Anna Andersson',
    uploadedAt: '2025-04-15',
    versions: 3
  },
  {
    id: '2',
    name: 'Teknisk specifikation',
    category: 'Dokument',
    uploadedBy: 'Per Nilsson',
    uploadedAt: '2025-05-01',
    versions: 2
  },
  {
    id: '3',
    name: 'Budget 2025 Q2',
    category: 'Ekonomi',
    uploadedBy: 'Maria Svensson',
    uploadedAt: '2025-05-10',
    versions: 4
  }
];

// Sample file versions for demonstration purposes
const SAMPLE_FILE_VERSIONS: FileVersion[] = [
  {
    id: '1-1',
    versionNumber: 1,
    filename: 'Byggritning huvudentré v1',
    fileUrl: '/sample-pdfs/sample1.pdf',
    description: 'Initial version',
    uploaded: '2025-04-15T10:00:00',
    uploadedBy: 'Anna Andersson'
  },
  {
    id: '1-2',
    versionNumber: 2,
    filename: 'Byggritning huvudentré v2',
    fileUrl: '/sample-pdfs/sample1.pdf',
    description: 'Ändrad höjd på entrédörrar',
    uploaded: '2025-04-25T14:30:00',
    uploadedBy: 'Anna Andersson'
  },
  {
    id: '1-3',
    versionNumber: 3,
    filename: 'Byggritning huvudentré v3',
    fileUrl: '/sample-pdfs/sample1.pdf',
    description: 'Justering av material på fasad',
    uploaded: '2025-05-05T09:15:00',
    uploadedBy: 'Per Nilsson'
  }
];

export default function VersionsPage() {
  // State for PDF viewer
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // State for file management
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [fileVersions, setFileVersions] = useState<FileVersion[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // State for upload dialog
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newVersionFile, setNewVersionFile] = useState<File | null>(null);
  const [newVersionDescription, setNewVersionDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Project context
  const { currentProject } = useProject();
  
  useEffect(() => {
    // Reset states when component mounts
    setNumPages(null);
    setPageNumber(1);
    setScale(1);
    setSelectedFileId(null);
    setFileVersions([]);
    setActiveVersionId(null);
    setPdfUrl(null);
  }, []);
  
  // Load file versions when a file is selected
  useEffect(() => {
    if (selectedFileId) {
      loadFileVersions(selectedFileId);
    }
  }, [selectedFileId]);
  
  // Load PDF content when a version is selected
  useEffect(() => {
    if (activeVersionId) {
      loadPdfContent(activeVersionId);
    }
  }, [activeVersionId]);
  
  // Function to load file versions
  const loadFileVersions = async (fileId: string) => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from the server
      // For now, we'll use our sample data
      setFileVersions(SAMPLE_FILE_VERSIONS);
      
      // Set the active version to the latest one
      const latestVersion = SAMPLE_FILE_VERSIONS[SAMPLE_FILE_VERSIONS.length - 1];
      setActiveVersionId(latestVersion.id);
      
    } catch (error) {
      console.error('Error loading file versions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to load PDF content
  const loadPdfContent = async (versionId: string) => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from the server
      // For now, we'll use our sample PDF
      const version = SAMPLE_FILE_VERSIONS.find(v => v.id === versionId);
      if (version) {
        // Use Google Docs Viewer as a fallback method to display PDFs when browser security blocks direct embed
        // This is a well-known technique for PDF viewing in secure environments
        const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + '/sample-pdfs/sample1.pdf')}&embedded=true`;
        setPdfUrl(googleDocsViewerUrl);
      }
    } catch (error) {
      console.error('Error loading PDF content:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle file selection
  const handleFileSelect = (fileId: string) => {
    setSelectedFileId(fileId);
  };
  
  // Function to handle version selection
  const handleVersionSelect = (versionId: string) => {
    setActiveVersionId(versionId);
  };
  
  // Function to handle document load success
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };
  
  // Functions for page navigation
  const goToPrevPage = () => {
    setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
  };
  
  const goToNextPage = () => {
    setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages || 1));
  };
  
  // Functions for zooming
  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 3));
  };
  
  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  };
  
  // Function to handle file upload for new version
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setNewVersionFile(files[0]);
    }
  };
  
  // Function to upload a new version
  const uploadNewVersion = async () => {
    if (!selectedFileId || !newVersionFile || !newVersionDescription) {
      return;
    }
    
    setUploading(true);
    try {
      // Skapa en fil-URL för den uppladdade PDF:en
      const fileUrl = URL.createObjectURL(newVersionFile);
      
      // Skapa versionsinformation
      const nextVersionNumber = fileVersions.length + 1;
      const newVersion: FileVersion = {
        id: `${selectedFileId}-${nextVersionNumber}`,
        versionNumber: nextVersionNumber,
        filename: newVersionFile.name,
        fileUrl: fileUrl,
        description: newVersionDescription,
        uploaded: new Date().toISOString(),
        uploadedBy: 'Current User'
      };
      
      // Uppdatera versionshistoriken
      const updatedVersions = [...fileVersions, newVersion];
      setFileVersions(updatedVersions);
      
      // Sätt den nya versionen som aktiv
      setActiveVersionId(newVersion.id);
      setPdfUrl(fileUrl);
      
      // Stäng dialogrutan och återställ formuläret
      setUploadDialogOpen(false);
      setNewVersionFile(null);
      setNewVersionDescription('');
      
      console.log('PDF uppladdad och visad:', newVersion);
      
    } catch (error) {
      console.error('Error uploading new version:', error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography level="h3" sx={{ mb: 2 }}>PDF Versionshantering</Typography>
      
      <Grid container spacing={3}>
        {/* File list sidebar */}
        <Grid xs={12} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography level="h4" sx={{ mb: 2 }}>Projektfiler</Typography>
              <Stack spacing={2}>
                {SAMPLE_PROJECT_FILES.map(file => (
                  <Sheet 
                    key={file.id}
                    variant="outlined"
                    sx={{ 
                      p: 2, 
                      borderRadius: 'sm',
                      cursor: 'pointer',
                      bgcolor: selectedFileId === file.id ? 'primary.50' : 'background.surface',
                      '&:hover': {
                        bgcolor: 'primary.100'
                      }
                    }}
                    onClick={() => handleFileSelect(file.id)}
                  >
                    <Typography level="title-md">{file.name}</Typography>
                    <Typography level="body-sm">Kategori: {file.category}</Typography>
                    <Typography level="body-sm">Uppladdad av: {file.uploadedBy}</Typography>
                    <Typography level="body-sm">Datum: {file.uploadedAt}</Typography>
                    <Typography level="body-sm">Versioner: {file.versions}</Typography>
                  </Sheet>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        {/* PDF Viewer */}
        <Grid xs={12} md={9}>
          {selectedFileId ? (
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* PDF Toolbar */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Typography level="title-md">
                    {activeVersionId && fileVersions.find(v => v.id === activeVersionId)?.filename}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      startDecorator={<HistoryIcon />}
                      size="sm"
                      onClick={() => setUploadDialogOpen(true)}
                    >
                      Ladda upp ny version
                    </Button>
                  </Box>
                </Box>
                
                {/* PDF Viewer content */}
                <Box 
                  sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    overflow: 'hidden'
                  }}
                >
                  {/* PDF Controls */}
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      gap: 2,
                      py: 1
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton 
                        variant="plain" 
                        color="neutral" 
                        onClick={zoomOut}
                        disabled={scale <= 0.5}
                      >
                        <ZoomOutIcon />
                      </IconButton>
                      <Typography level="body-sm">{Math.round(scale * 100)}%</Typography>
                      <IconButton 
                        variant="plain" 
                        color="neutral" 
                        onClick={zoomIn}
                        disabled={scale >= 3}
                      >
                        <ZoomInIcon />
                      </IconButton>
                    </Box>
                    
                    <Divider orientation="vertical" />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton 
                        variant="plain" 
                        color="neutral" 
                        onClick={goToPrevPage}
                        disabled={pageNumber <= 1}
                      >
                        <ChevronLeftIcon />
                      </IconButton>
                      <Typography level="body-sm">
                        Sida {pageNumber} av {numPages || '?'}
                      </Typography>
                      <IconButton 
                        variant="plain" 
                        color="neutral" 
                        onClick={goToNextPage}
                        disabled={!numPages || pageNumber >= numPages}
                      >
                        <ChevronRightIcon />
                      </IconButton>
                    </Box>
                    
                    <Divider orientation="vertical" />
                    
                    <IconButton 
                      variant="plain" 
                      color="neutral" 
                      onClick={() => window.open(pdfUrl || '', '_blank')}
                      disabled={!pdfUrl}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Box>
                  
                  {/* PDF Document */}
                  <Box 
                    sx={{ 
                      flex: 1, 
                      overflow: 'auto', 
                      display: 'flex', 
                      justifyContent: 'center',
                      alignItems: 'flex-start',
                      p: 2,
                      bgcolor: 'grey.100'
                    }}
                  >
                    {loading ? (
                      <CircularProgress size="lg" sx={{ my: 4 }} />
                    ) : pdfUrl ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%' }}>
                        <Typography level="title-lg" sx={{ mb: 2 }}>
                          {activeVersionId && fileVersions.find(v => v.id === activeVersionId)?.filename}
                        </Typography>
                        
                        <Box 
                          sx={{ 
                            width: '100%', 
                            height: 'calc(100% - 120px)', 
                            position: 'relative', 
                            border: '1px solid', 
                            borderColor: 'divider', 
                            borderRadius: 'sm', 
                            overflow: 'hidden',
                            bgcolor: '#f5f5f5'
                          }}
                        >
                          <iframe
                            src={pdfUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 'none' }}
                            title="PDF Viewer"
                            allowFullScreen
                          />
                        </Box>
                        
                        <Button 
                          variant="solid" 
                          color="primary"
                          startDecorator={<DownloadIcon />}
                          onClick={() => window.open(pdfUrl, '_blank')}
                          sx={{ mt: 2 }}
                        >
                          Öppna PDF i ny flik
                        </Button>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', p: 4 }}>
                        <Typography level="title-lg">
                          Ingen PDF vald
                        </Typography>
                        <Typography level="body-sm">
                          Välj en fil från listan för att visa innehållet.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
                
                {/* Version history */}
                {selectedFileId && (
                  <Box sx={{ mt: 2 }}>
                    <Typography level="title-sm" sx={{ mb: 1 }}>Versionshistorik</Typography>
                    <Box sx={{ maxHeight: '200px', overflow: 'auto' }}>
                      <Stack spacing={1}>
                        {fileVersions.map(version => (
                          <Sheet 
                            key={version.id}
                            variant="outlined"
                            sx={{ 
                              p: 1, 
                              borderRadius: 'sm',
                              cursor: 'pointer',
                              bgcolor: activeVersionId === version.id ? 'primary.50' : 'background.surface',
                              '&:hover': {
                                bgcolor: 'primary.100'
                              }
                            }}
                            onClick={() => handleVersionSelect(version.id)}
                          >
                            <Grid container spacing={1} alignItems="center">
                              <Grid xs={2}>
                                <Typography level="body-sm">v{version.versionNumber}</Typography>
                              </Grid>
                              <Grid xs={6}>
                                <Typography level="body-sm">{version.description}</Typography>
                              </Grid>
                              <Grid xs={4}>
                                <Typography level="body-sm" sx={{ textAlign: 'right' }}>
                                  {format(new Date(version.uploaded), 'yyyy-MM-dd')}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Sheet>
                        ))}
                      </Stack>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Typography level="h4">Välj en fil</Typography>
                <Typography sx={{ mb: 3 }}>
                  Välj en fil från listan till vänster för att visa dess innehåll och hantera versioner.
                </Typography>
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/2965/2965335.png" 
                  alt="PDF Icon" 
                  style={{ width: '100px', opacity: 0.4 }} 
                />
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
      
      {/* Upload New Version Dialog */}
      <Modal
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
      >
        <ModalDialog variant="outlined">
          <ModalClose />
          <Typography level="h4" sx={{ mb: 2 }}>Ladda upp ny version</Typography>
          
          <Stack spacing={2}>
            <Box sx={{ textAlign: 'center', p: 3, border: '2px dashed', borderColor: 'primary.300', borderRadius: 'sm' }}>
              {newVersionFile ? (
                <Box>
                  <Typography level="body-lg">{newVersionFile.name}</Typography>
                  <Typography level="body-sm">{(newVersionFile.size / 1024 / 1024).toFixed(2)} MB</Typography>
                  <Button 
                    variant="soft" 
                    color="danger" 
                    size="sm" 
                    sx={{ mt: 1 }}
                    onClick={() => setNewVersionFile(null)}
                  >
                    Ta bort
                  </Button>
                </Box>
              ) : (
                <>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                  />
                  <Button 
                    variant="soft" 
                    color="primary"
                    startDecorator={<AddIcon />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Välj PDF-fil
                  </Button>
                  <Typography level="body-sm" sx={{ mt: 1 }}>
                    Endast PDF-filer stöds (.pdf)
                  </Typography>
                </>
              )}
            </Box>
            
            <Input
              placeholder="Beskriv vad som har ändrats i denna version"
              value={newVersionDescription}
              onChange={(e) => setNewVersionDescription(e.target.value)}
            />
            
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                color="neutral"
                onClick={() => setUploadDialogOpen(false)}
              >
                Avbryt
              </Button>
              <Button 
                variant="solid" 
                color="primary"
                loading={uploading}
                disabled={!newVersionFile || !newVersionDescription}
                onClick={uploadNewVersion}
              >
                Ladda upp
              </Button>
            </Box>
          </Stack>
        </ModalDialog>
      </Modal>
    </Box>
  );
}