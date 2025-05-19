import React, { useState, useRef } from 'react';
import { 
  Button, 
  Modal, 
  ModalDialog, 
  Typography, 
  Box,
  CircularProgress
} from '@mui/joy';

interface SimpleFileUploaderProps {
  folderId?: string | number;
  onUploadSuccess?: () => void;
}

/**
 * En enkel filuppladdningskomponent utan PDF-visning
 */
const SimpleFileUploader: React.FC<SimpleFileUploaderProps> = ({
  folderId,
  onUploadSuccess
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const resetForm = () => {
    setFile(null);
    setDescription('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };
  
  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);
      formData.append('name', file.name.replace(/\.[^/.]+$/, '')); // Ta bort filändelse
      
      const uploadUrl = folderId 
        ? `/api/files/upload/?directory_slug=${folderId}` 
        : '/api/files/upload/';
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        console.log('Fil uppladdad framgångsrikt!');
        setIsOpen(false);
        resetForm();
        
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
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Fel vid uppladdning:', err);
      setError('Kunde inte ansluta till servern');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <>
      <Button 
        size="sm"
        color="primary"
        onClick={() => setIsOpen(true)}
      >
        Ladda upp fil
      </Button>
      
      <Modal open={isOpen} onClose={handleClose}>
        <ModalDialog sx={{ maxWidth: 500, p: 3 }}>
          <Typography level="title-lg" mb={2}>
            Ladda upp fil
          </Typography>
          
          <Box 
            sx={{ 
              border: '1px dashed',
              borderColor: file ? 'success.500' : 'neutral.400',
              borderRadius: '8px',
              p: 3,
              mb: 2,
              textAlign: 'center',
              cursor: 'pointer'
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            {file ? (
              <>
                <Typography level="body-md" fontWeight="bold">
                  {file.name}
                </Typography>
                <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                  {(file.size / 1024).toFixed(1)} KB
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
                <Typography level="body-md">
                  Klicka för att välja fil
                </Typography>
              </>
            )}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography level="body-sm" mb={1}>
              Beskrivning (valfritt)
            </Typography>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Skriv en beskrivning av filen"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
          </Box>
          
          {error && (
            <Box
              sx={{
                p: 2,
                mb: 2,
                bgcolor: 'error.softBg',
                color: 'error.solidColor',
                borderRadius: '4px'
              }}
            >
              {error}
            </Box>
          )}
          
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="plain"
              color="neutral"
              onClick={handleClose}
              disabled={uploading}
            >
              Avbryt
            </Button>
            <Button
              variant="solid"
              color="primary"
              onClick={handleUpload}
              loading={uploading}
              disabled={!file || uploading}
            >
              Ladda upp
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default SimpleFileUploader;