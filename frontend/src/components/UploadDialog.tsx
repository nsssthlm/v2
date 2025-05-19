import React, { useState } from 'react';
import axios from 'axios';
import { 
  Modal, 
  ModalDialog, 
  ModalClose, 
  Typography, 
  Button, 
  FormControl, 
  FormLabel, 
  Input, 
  Textarea,
  CircularProgress,
  Alert
} from '@mui/joy';
import { API_BASE_URL } from '../config';

interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
  folderSlug: string;
  onSuccess: () => void;
}

const UploadDialog: React.FC<UploadDialogProps> = ({ open, onClose, folderSlug, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Kontrollera om filen är en PDF
      if (!selectedFile.name.endsWith('.pdf')) {
        setError('Endast PDF-filer är tillåtna.');
        setFile(null);
        return;
      }
      
      // Kontrollera filstorlek (max 20MB)
      if (selectedFile.size > 20 * 1024 * 1024) {
        setError('Filstorleken får inte överstiga 20 MB.');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setFileName(selectedFile.name.replace('.pdf', ''));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Du måste välja en fil att ladda upp.');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('name', fileName || file.name.replace('.pdf', ''));
    formData.append('file', file);
    formData.append('description', description);
    
    try {
      await axios.post(`${API_BASE_URL}/files/upload/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: {
          directory_slug: folderSlug
        }
      });
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
      
    } catch (err: any) {
      console.error('Fel vid uppladdning:', err);
      setError(err.response?.data?.detail || 'Ett fel uppstod vid uppladdning av filen.');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setFileName('');
    setDescription('');
    setError(null);
    setSuccess(false);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        aria-labelledby="upload-dialog-title"
        size="md"
        variant="outlined"
        layout="center"
      >
        <ModalClose onClick={() => {
          resetForm();
          onClose();
        }} />
        <Typography id="upload-dialog-title" level="h2" mb={2}>
          Ladda upp PDF
        </Typography>
        
        {success ? (
          <Alert color="success" sx={{ mb: 2 }}>
            Filen har laddats upp!
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert color="danger" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Välj PDF-fil</FormLabel>
                      <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                id="file-upload"
                style={{ 
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </FormControl>
            
            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Filnamn</FormLabel>
              <Input
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Ange filnamn (utan .pdf)"
              />
            </FormControl>
            
            <FormControl sx={{ mb: 3 }}>
              <FormLabel>Beskrivning (valfritt)</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                minRows={2}
                placeholder="Lägg till en beskrivning av filen"
              />
            </FormControl>
            
            <Button
              type="submit"
              color="primary"
              loading={uploading}
              fullWidth
              disabled={!file || uploading}
            >
              {uploading ? 'Laddar upp...' : 'Ladda upp'}
            </Button>
          </form>
        )}
      </ModalDialog>
    </Modal>
  );
};

export default UploadDialog;