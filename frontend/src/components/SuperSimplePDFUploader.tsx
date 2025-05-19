import React, { useState, useRef } from 'react';
import {
  Button,
  Modal,
  ModalDialog,
  Box,
  Typography,
} from '@mui/joy';
import UploadIcon from '@mui/icons-material/Upload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface SuperSimplePDFUploaderProps {
  folderId?: string | number;
  onUploadSuccess?: () => void;
}

/**
 * Extremt enkel PDF-uppladdare som bara visar PDFer från filsystemet
 */
const SuperSimplePDFUploader: React.FC<SuperSimplePDFUploaderProps> = ({
  folderId,
  onUploadSuccess
}) => {
  // State
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Öppna uppladdningsdialogen
  const openUploadDialog = () => {
    setIsUploadDialogOpen(true);
    setFile(null);
    setDescription('');
    setUploadError('');
  };

  // Stäng uppladdningsdialogen
  const closeUploadDialog = () => {
    setIsUploadDialogOpen(false);
  };

  // Stäng PDF-visaren
  const closePdfViewer = () => {
    setIsPdfViewerOpen(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  // Hantera val av fil
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Skapa en lokal blob URL för visning
      const localUrl = URL.createObjectURL(selectedFile);
      setPdfUrl(localUrl);
    }
  };

  // Ladda upp fil till servern
  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setUploadError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);
      formData.append('name', file.name.replace('.pdf', ''));
      
      const uploadUrl = folderId 
        ? `/api/files/upload/?directory_slug=${folderId}` 
        : '/api/files/upload/';
      
      console.log(`Laddar upp fil: ${file.name} (${file.size} bytes) till ${uploadUrl}`);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        console.log('Uppladdning lyckades!');
        
        // Stäng uppladdningsdialogen och visa PDF i ny vy
        setIsUploadDialogOpen(false);
        setIsPdfViewerOpen(true);
        
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        let errorMessage = 'Uppladdning misslyckades';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Fel: ${response.status} ${response.statusText}`;
        }
        setUploadError(errorMessage);
      }
    } catch (error) {
      console.error('Fel vid uppladdning:', error);
      setUploadError('Ett fel uppstod vid kommunikation med servern');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* Uppladdningsknapp */}
      <Button
        size="sm"
        variant="solid"
        color="primary"
        startDecorator={<UploadIcon />}
        onClick={openUploadDialog}
        sx={{ 
          bgcolor: '#4caf50', 
          color: 'white',
          '&:hover': { bgcolor: '#3d8b40' }
        }}
      >
        Ladda upp PDF
      </Button>
      
      {/* Uppladdningsdialog */}
      <Modal open={isUploadDialogOpen} onClose={closeUploadDialog}>
        <ModalDialog sx={{ maxWidth: 500 }}>
          <Typography level="h4" sx={{ mb: 2 }}>
            Ladda upp PDF
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            {file ? (
              <Box 
                sx={{ 
                  p: 2, 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '8px',
                  bgcolor: '#f5f5f5',
                  textAlign: 'center'
                }}
              >
                <Typography level="body-lg" fontWeight="bold">
                  {file.name}
                </Typography>
                <Typography level="body-sm" sx={{ mt: 1, color: 'text.secondary' }}>
                  {(file.size / 1024).toFixed(1)} KB
                </Typography>
                <Button 
                  size="sm" 
                  color="danger" 
                  variant="soft"
                  sx={{ mt: 1 }}
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    if (pdfUrl) {
                      URL.revokeObjectURL(pdfUrl);
                      setPdfUrl(null);
                    }
                  }}
                >
                  Ta bort
                </Button>
              </Box>
            ) : (
              <Box 
                sx={{ 
                  p: 3, 
                  border: '1px dashed #bdbdbd', 
                  borderRadius: '8px',
                  bgcolor: '#f9f9f9',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: '#f0f0f0',
                    borderColor: '#9e9e9e',
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadIcon sx={{ fontSize: 40, color: '#757575', mb: 1 }} />
                <Typography level="body-md">
                  Klicka för att välja en PDF-fil
                </Typography>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
              </Box>
            )}
            
            <Box sx={{ mt: 2 }}>
              <Typography level="body-sm" sx={{ mb: 1 }}>
                Beskrivning (valfritt)
              </Typography>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Skriv en kort beskrivning av dokumentet"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </Box>
          </Box>
          
          {uploadError && (
            <Box 
              sx={{ 
                p: 1.5, 
                mb: 2, 
                bgcolor: '#ffebee', 
                color: '#c62828',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              {uploadError}
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button 
              variant="outlined" 
              color="neutral" 
              onClick={closeUploadDialog}
              disabled={uploading}
            >
              Avbryt
            </Button>
            <Button 
              variant="solid" 
              color="primary"
              onClick={handleUpload}
              disabled={!file || uploading}
              loading={uploading}
            >
              {uploading ? 'Laddar upp...' : 'Ladda upp'}
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
      
      {/* PDF Viewer */}
      <Modal open={isPdfViewerOpen} onClose={closePdfViewer}>
        <ModalDialog
          sx={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            width: '90vw',
            height: '90vh',
            padding: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box 
            sx={{ 
              p: 1.5, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              bgcolor: '#1976d2',
              color: 'white'
            }}
          >
            <Typography level="title-lg">
              {file?.name || 'PDF Dokument'}
            </Typography>
            <Button variant="outlined" color="neutral" onClick={closePdfViewer}>
              Stäng
            </Button>
          </Box>
          
          <Box sx={{ flex: 1, width: '100%', position: 'relative' }}>
            {pdfUrl && (
              <iframe
                src={pdfUrl}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  border: 'none',
                  display: 'block'
                }}
                title={file?.name || 'PDF Dokument'}
              />
            )}
          </Box>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default SuperSimplePDFUploader;