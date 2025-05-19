import React, { useState, useRef } from 'react';
import {
  Button,
  Modal,
  ModalDialog,
  Box,
  Typography,
  CircularProgress,
  TextField
} from '@mui/joy';
import UploadIcon from '@mui/icons-material/Upload';
import FileIcon from '@mui/icons-material/InsertDriveFile';

interface SimplePDFUploaderProps {
  folderId?: string | number;
  onUploadSuccess?: () => void;
}

/**
 * En enkel och pålitlig PDF-uppladdare som visar PDF direkt efter uppladdning
 */
const SimplePDFUploader: React.FC<SimplePDFUploaderProps> = ({
  folderId,
  onUploadSuccess
}) => {
  // State för dialog, fil, uppladdning och visning
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Lokal PDF-visning
  const [pdfObjectUrl, setPdfObjectUrl] = useState<string | null>(null);
  
  // Filuppladdningsreferens
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Hantera val av fil
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Skapa en direkt URL till filen för visning i webbläsaren
      const objectUrl = URL.createObjectURL(selectedFile);
      setPdfObjectUrl(objectUrl);
    }
  };
  
  // Öppna uppladdningsdialogrutan
  const openUploadDialog = () => {
    setUploadDialogOpen(true);
    setUploadSuccess(false);
    setErrorMessage('');
  };
  
  // Stäng uppladdningsdialogrutan och rensa state
  const closeUploadDialog = () => {
    setUploadDialogOpen(false);
    setFile(null);
    setDescription('');
    setErrorMessage('');
    if (pdfObjectUrl) {
      URL.revokeObjectURL(pdfObjectUrl);
      setPdfObjectUrl(null);
    }
  };
  
  // Ladda upp filen till servern
  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setErrorMessage('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);
      formData.append('name', file.name.replace('.pdf', ''));
      
      console.log(`Laddar upp PDF-fil till mapp: ${folderId || 'root'}`);
      
      const uploadURL = folderId 
        ? `/api/files/upload/?directory_slug=${folderId}` 
        : '/api/files/upload/';
      
      const response = await fetch(uploadURL, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Uppladdning lyckades:', data);
        setUploadSuccess(true);
        
        // Visa PDF-visningsdialogrutan med lokala data
        setViewDialogOpen(true);
        
        // Stäng uppladdningsdialogrutan efter en kort fördröjning
        setTimeout(() => {
          setUploadDialogOpen(false);
        }, 500);
        
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        let errorMsg = 'Ett fel uppstod vid uppladdning';
        try {
          const errorData = await response.json();
          errorMsg = errorData.detail || errorData.message || errorMsg;
        } catch (e) {
          // Om vi inte kan tolka JSON, använd standard felmeddelande
        }
        setErrorMessage(errorMsg);
      }
    } catch (error) {
      console.error('Fel vid uppladdning:', error);
      setErrorMessage('Kunde inte ansluta till servern. Kontrollera din anslutning.');
    } finally {
      setUploading(false);
    }
  };
  
  // Stäng PDF-visningsdialogrutan och rensa resurser
  const closePdfViewDialog = () => {
    setViewDialogOpen(false);
    if (pdfObjectUrl) {
      URL.revokeObjectURL(pdfObjectUrl);
      setPdfObjectUrl(null);
    }
    setFile(null);
  };

  return (
    <>
      {/* Uppladdningsknapp */}
      <Button
        onClick={openUploadDialog}
        startDecorator={<UploadIcon />}
        color="primary"
        size="sm"
        sx={{ height: '35px' }}
      >
        Ladda upp PDF
      </Button>
      
      {/* Uppladdningsdialog */}
      <Modal open={uploadDialogOpen} onClose={closeUploadDialog}>
        <ModalDialog
          sx={{
            maxWidth: 500,
            p: 3
          }}
        >
          <Typography level="h4" mb={2}>
            Ladda upp PDF
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Box 
              sx={{ 
                border: '1px dashed', 
                borderColor: 'neutral.400',
                borderRadius: 'sm',
                p: 3,
                mb: 2,
                textAlign: 'center',
                bgcolor: file ? 'success.50' : 'background.surface'
              }}
            >
              {file ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <FileIcon sx={{ fontSize: 40, color: 'primary.500' }} />
                  <Typography fontWeight="bold">{file.name}</Typography>
                  <Typography level="body-sm">
                    {(file.size / 1024).toFixed(2)} KB
                  </Typography>
                  <Button 
                    size="sm" 
                    color="danger" 
                    variant="soft"
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    Ta bort
                  </Button>
                </Box>
              ) : (
                <>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    id="pdf-file-input"
                  />
                  <label htmlFor="pdf-file-input">
                    <UploadIcon sx={{ fontSize: 40, color: 'neutral.500', mb: 1 }} />
                    <Typography level="body-md" display="block" mb={1}>
                      Klicka för att välja PDF-fil
                    </Typography>
                    <Button 
                      component="span"
                      variant="outlined"
                      color="neutral"
                    >
                      Välj fil
                    </Button>
                  </label>
                </>
              )}
            </Box>
            
            <TextField
              label="Beskrivning (valfritt)"
              placeholder="Skriv en kort beskrivning av filen"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              sx={{ mt: 2 }}
            />
          </Box>
          
          {errorMessage && (
            <Typography 
              color="danger" 
              level="body-sm"
              sx={{ 
                mb: 2,
                p: 1,
                borderRadius: 'sm',
                bgcolor: 'danger.50' 
              }}
            >
              {errorMessage}
            </Typography>
          )}
          
          {uploadSuccess && (
            <Typography 
              color="success" 
              level="body-sm"
              sx={{ 
                mb: 2,
                p: 1,
                borderRadius: 'sm',
                bgcolor: 'success.50' 
              }}
            >
              Uppladdningen lyckades! Öppnar filen...
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              variant="plain"
              color="neutral"
              onClick={closeUploadDialog}
              disabled={uploading}
            >
              Avbryt
            </Button>
            <Button
              onClick={handleUpload}
              loading={uploading}
              disabled={!file || uploading}
              sx={{ minWidth: 100 }}
            >
              {uploading ? 'Laddar upp...' : 'Ladda upp'}
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
      
      {/* PDF-visningsdialog med lokal PDF-data */}
      <Modal open={viewDialogOpen} onClose={closePdfViewDialog}>
        <ModalDialog
          sx={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            width: '90vw',
            height: '90vh',
            p: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 1,
              bgcolor: 'primary.500',
              color: 'white'
            }}
          >
            <Typography level="title-md" sx={{ pl: 1 }}>
              {file?.name || 'PDF Dokument'}
            </Typography>
            
            <Button 
              variant="soft" 
              color="neutral" 
              size="sm"
              onClick={closePdfViewDialog}
            >
              Stäng
            </Button>
          </Box>
          
          {/* PDF-visare med iframe */}
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            {pdfObjectUrl ? (
              <iframe
                src={pdfObjectUrl}
                title={file?.name || 'PDF Dokument'}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
              />
            ) : (
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  height: '100%' 
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

export default SimplePDFUploader;