import React, { useState, useRef, useEffect } from 'react';
import {
  Button,
  Modal,
  ModalDialog,
  Box,
  Typography,
  CircularProgress,
  IconButton,
} from '@mui/joy';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

interface LocalPDFViewerProps {
  folderId?: string | number;
  onUploadSuccess?: () => void;
}

/**
 * En extremt enkel PDF hanterare som visar PDF direkt utan serveranrop
 * Perfekt när PDF-filer behöver hanteras utan att lita på server-respons
 */
const LocalPDFViewer: React.FC<LocalPDFViewerProps> = ({
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
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      
      {/* PDF Viewer */}
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
          }}
        >
          <Box 
            sx={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 1.5,
              bgcolor: 'primary.500',
              color: 'white'
            }}
          >
            <Typography level="title-lg">
              {selectedFile?.name || 'PDF Dokument'}
            </Typography>
            <IconButton 
              variant="solid" 
              color="neutral" 
              onClick={closePdfViewer}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ flex: 1, bgcolor: '#f0f0f0', position: 'relative' }}>
            {localPdfUrl ? (
              <iframe
                src={localPdfUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                title="PDF Dokument"
              />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <CircularProgress />
              </Box>
            )}
          </Box>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default LocalPDFViewer;