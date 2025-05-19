import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  ModalDialog,
  Box,
  Button,
  Typography,
  IconButton,
  CircularProgress,
  Sheet,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Divider,
} from '@mui/joy';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DownloadIcon from '@mui/icons-material/Download';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FolderIcon from '@mui/icons-material/Folder';

interface EnhancedPDFViewerProps {
  folderId?: string | number;
  onUploadSuccess?: () => void;
}

/**
 * Förbättrad PDF-visare med fler funktioner som matchar designen i bilden
 */
const EnhancedPDFViewer: React.FC<EnhancedPDFViewerProps> = ({
  folderId,
  onUploadSuccess
}) => {
  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPdfUrl, setLocalPdfUrl] = useState<string | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [fileDescription, setFileDescription] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeTab, setActiveTab] = useState(0);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Rensa URL vid komponent-unmount
  useEffect(() => {
    return () => {
      if (localPdfUrl) {
        URL.revokeObjectURL(localPdfUrl);
      }
    };
  }, []);
  
  // Hantera filtillägg
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.includes('pdf')) {
      setUploadError('Endast PDF-filer stöds');
      return;
    }
    
    // Rensa eventuell tidigare objektURL
    if (localPdfUrl) {
      URL.revokeObjectURL(localPdfUrl);
    }
    
    // Skapa en lokal URL för filen
    const fileObjectUrl = URL.createObjectURL(file);
    setLocalPdfUrl(fileObjectUrl);
    setSelectedFile(file);
    setUploadError('');
  };
  
  // Uppladdningslogik
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadError('');
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('description', fileDescription);
      formData.append('name', selectedFile.name.replace('.pdf', ''));
      
      const uploadUrl = folderId 
        ? `/api/files/upload/?directory_slug=${folderId}` 
        : '/api/files/upload/';
      
      console.log(`Laddar upp fil: ${selectedFile.name} (${selectedFile.size} bytes) till ${uploadUrl}`);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        console.log('Uppladdning lyckades!');
        
        // Visa PDF:en direkt, utan att hämta från servern
        setIsUploadDialogOpen(false);
        setIsPdfViewerOpen(true);
        
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        let errorMsg = 'Uppladdning misslyckades';
        try {
          const errorData = await response.json();
          errorMsg = errorData.detail || errorData.message || errorMsg;
        } catch (e) {
          errorMsg = `Fel: ${response.status} ${response.statusText}`;
        }
        setUploadError(errorMsg);
      }
    } catch (err) {
      console.error('Fel vid uppladdning:', err);
      setUploadError('Kunde inte ansluta till servern');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Öppna/stäng funktioner
  const openUploadDialog = () => {
    setIsUploadDialogOpen(true);
    resetForm();
  };
  
  const closeUploadDialog = () => {
    setIsUploadDialogOpen(false);
    resetForm();
  };
  
  const closePdfViewer = () => {
    setIsPdfViewerOpen(false);
  };
  
  // Zooma in/ut
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };
  
  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };
  
  // Återställ formulär
  const resetForm = () => {
    // Rensa fil-input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Rensa state
    setSelectedFile(null);
    setFileDescription('');
    setUploadError('');
    
    // Behåll URL:en tills användaren stänger PDF-visaren
  };
  
  return (
    <>
      {/* Uppladdningsknapp */}
      <Button
        variant="solid"
        size="sm"
        color="success"
        startDecorator={<CloudUploadIcon />}
        onClick={openUploadDialog}
        sx={{ 
          bgcolor: '#4caf50', 
          '&:hover': { bgcolor: '#3d8b40' },
          height: '35px'
        }}
      >
        Ladda upp PDF
      </Button>
      
      {/* Uppladdningsdialog */}
      <Modal open={isUploadDialogOpen} onClose={closeUploadDialog}>
        <ModalDialog
          aria-labelledby="upload-dialog-title"
          sx={{ maxWidth: 500, p: 3 }}
        >
          <Typography id="upload-dialog-title" level="h4" mb={2}>
            Ladda upp PDF
          </Typography>
          
          <Box 
            sx={{ 
              border: '1px dashed',
              borderColor: selectedFile ? 'success.500' : 'neutral.400',
              borderRadius: '8px',
              p: 3,
              mb: 2,
              textAlign: 'center',
              bgcolor: selectedFile ? 'success.50' : 'neutral.50',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.400',
                bgcolor: 'primary.50',
              }
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedFile ? (
              <>
                <InsertDriveFileIcon 
                  sx={{ fontSize: 40, color: 'success.600', mb: 1 }} 
                />
                <Typography level="body-lg" fontWeight="bold">
                  {selectedFile.name}
                </Typography>
                <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </Typography>
                <Button 
                  size="sm" 
                  variant="soft" 
                  color="danger" 
                  sx={{ mt: 1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    resetForm();
                  }}
                >
                  Ta bort
                </Button>
              </>
            ) : (
              <>
                <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.500', mb: 1 }} />
                <Typography level="body-lg">
                  Klicka för att välja PDF
                </Typography>
                <Typography level="body-sm" sx={{ color: 'text.secondary' }} mt={1}>
                  eller dra och släpp din fil här
                </Typography>
              </>
            )}
            <input
              type="file"
              accept=".pdf,application/pdf"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography level="body-sm" mb={1}>
              Beskrivning (valfritt)
            </Typography>
            <input
              type="text"
              value={fileDescription}
              onChange={(e) => setFileDescription(e.target.value)}
              placeholder="Skriv en beskrivning av dokumentet"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
          </Box>
          
          {uploadError && (
            <Box
              sx={{
                p: 2,
                mb: 2,
                bgcolor: 'error.softBg',
                color: 'error.solidColor',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              {uploadError}
            </Box>
          )}
          
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="plain"
              color="neutral"
              onClick={closeUploadDialog}
              disabled={isUploading}
            >
              Avbryt
            </Button>
            <Button
              variant="solid"
              color="primary"
              onClick={handleUpload}
              loading={isUploading}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? 'Laddar upp...' : 'Ladda upp'}
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
      
      {/* PDF Viewer - i designen som du visade */}
      <Modal 
        open={isPdfViewerOpen} 
        onClose={closePdfViewer}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <ModalDialog
          sx={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            width: '90vw',
            height: '90vh',
            p: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'lg',
            borderRadius: '8px',
          }}
        >
          {/* Header */}
          <Box 
            sx={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 1,
              bgcolor: 'background.body',
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton 
                size="sm" 
                variant="plain" 
                color="neutral" 
                onClick={closePdfViewer}
              >
                <CloseIcon />
              </IconButton>
              <Typography level="title-md">
                {selectedFile?.name || 'PDF Dokument'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="sm" variant="plain" color="neutral">
                <ChevronLeftIcon />
              </IconButton>
              <Typography level="body-sm" sx={{ display: 'flex', alignItems: 'center' }}>
                Sida 1 av {1}
              </Typography>
              <IconButton size="sm" variant="plain" color="neutral">
                <ChevronRightIcon />
              </IconButton>
              
              <IconButton size="sm" variant="plain" color="neutral" onClick={zoomOut}>
                <RemoveIcon />
              </IconButton>
              <Typography level="body-sm" sx={{ display: 'flex', alignItems: 'center', minWidth: '50px', justifyContent: 'center' }}>
                {zoomLevel}%
              </Typography>
              <IconButton size="sm" variant="plain" color="neutral" onClick={zoomIn}>
                <AddIcon />
              </IconButton>
              
              <Button 
                variant="soft" 
                color="primary" 
                size="sm"
                startDecorator={<DownloadIcon />}
              >
                Ladda ner
              </Button>
              
              <Button
                variant="soft"
                color="primary"
                size="sm"
              >
                Versioner
              </Button>
              
              <Button
                variant="soft"
                color="primary"
                size="sm"
              >
                Markera område
              </Button>
              
              <Button
                variant="solid"
                color="primary"
                size="sm"
              >
                Ny version
              </Button>
            </Box>
          </Box>
          
          {/* Main content */}
          <Box sx={{ 
            display: 'flex', 
            flex: 1, 
            position: 'relative', 
            overflow: 'hidden',
            bgcolor: '#f0f0f0' 
          }}>
            {/* PDF Viewer */}
            <Box sx={{ 
              flex: 1, 
              position: 'relative', 
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: '8px', 
                  left: '8px', 
                  bgcolor: 'primary.solidBg',
                  color: 'white',
                  py: 0.5,
                  px: 1,
                  borderRadius: '4px',
                  fontSize: '12px',
                  zIndex: 10
                }}
              >
                Nuvarande version
              </Box>
              
              {localPdfUrl ? (
                <Box sx={{ 
                  position: 'relative', 
                  height: '100%', 
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <iframe
                    ref={iframeRef}
                    src={localPdfUrl}
                    style={{
                      width: `${zoomLevel}%`,
                      height: `${zoomLevel}%`,
                      border: 'none',
                      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                    }}
                    title="PDF Dokument"
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    width: '100%',
                  }}
                >
                  <CircularProgress />
                </Box>
              )}
            </Box>
            
            {/* Right sidebar */}
            <Sheet 
              sx={{ 
                width: '300px',
                height: '100%',
                overflow: 'auto',
                borderLeft: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Tabs 
                value={activeTab} 
                onChange={(_, value) => setActiveTab(value as number)}
                sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
              >
                <TabList>
                  <Tab>Detaljer</Tab>
                  <Tab>Historik</Tab>
                  <Tab>Kommentar</Tab>
                </TabList>
              </Tabs>
              
              <Box sx={{ p: 2, overflowY: 'auto', flex: 1 }}>
                <TabPanel value={0} sx={{ p: 0 }}>
                  <Typography level="title-md" sx={{ mb: 2 }}>
                    PDF Anteckning
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 1 }}>
                      Skapad av
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          borderRadius: '50%', 
                          bgcolor: 'primary.500' 
                        }} 
                      />
                      <Typography>user@example.com</Typography>
                      <Typography level="body-sm" sx={{ ml: 'auto', color: 'text.secondary' }}>
                        2025-05-16
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider />
                  
                  <Box sx={{ my: 3 }}>
                    <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 1 }}>
                      Deadline
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography>22 maj 2025</Typography>
                    </Box>
                  </Box>
                  
                  <Divider />
                  
                  <Box sx={{ my: 3 }}>
                    <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 1 }}>
                      Granskningspaket
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography>K - Granskning BH Hus 3-4</Typography>
                    </Box>
                  </Box>
                  
                  <Divider />
                  
                  <Box sx={{ my: 3 }}>
                    <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 1 }}>
                      Typ
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography>Gransknings kommentar</Typography>
                    </Box>
                  </Box>
                  
                  <Divider />
                  
                  <Box sx={{ my: 3 }}>
                    <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 1 }}>
                      Aktivitet
                    </Typography>
                    <Button
                      variant="soft"
                      color="neutral"
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      VERSIONER
                    </Button>
                    
                    <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography level="body-md">Version 1</Typography>
                        <Button size="sm" variant="outlined">Visa version</Button>
                      </Box>
                      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                        user@example.com
                      </Typography>
                    </Box>
                  </Box>
                </TabPanel>
                
                <TabPanel value={1} sx={{ p: 0 }}>
                  <Typography>Historik för dokumentet visas här.</Typography>
                </TabPanel>
                
                <TabPanel value={2} sx={{ p: 0 }}>
                  <Typography>Kommentarer för dokumentet visas här.</Typography>
                </TabPanel>
              </Box>
            </Sheet>
          </Box>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default EnhancedPDFViewer;