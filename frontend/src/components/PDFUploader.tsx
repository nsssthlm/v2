import { useState } from 'react';
import {
  Box,
  Button,
  Modal,
  ModalDialog,
  Typography,
  TextField,
  CircularProgress
} from '@mui/joy';
import UploadIcon from '@mui/icons-material/Upload';
import { usePDFDialog } from '../contexts/PDFDialogContext';

interface PDFUploaderProps {
  folderId?: string | number;
  onUploadSuccess?: () => void;
}

const PDFUploader = ({ folderId, onUploadSuccess }: PDFUploaderProps) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState('');
  const { openPDFDialog } = usePDFDialog();

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFile(null);
    setDescription('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);
      
      if (folderId) {
        formData.append('directory', folderId.toString());
      }

      const response = await fetch(`/api/files/upload/?directory_slug=test1-44`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Uppladdning lyckades:', data);
        
        // Skapa en temporär lokal URL för direkt förhandsgranskning
        const fileURL = URL.createObjectURL(file);
        
        // Öppna den uppladdade PDF:en direkt i ett nytt fönster
        window.open(fileURL, '_blank');
        
        handleClose();
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        console.error('Uppladdning misslyckades');
      }
    } catch (error) {
      console.error('Fel vid uppladdning:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        startDecorator={<UploadIcon />}
        onClick={handleOpen}
        sx={{ 
          bgcolor: '#4caf50', 
          color: 'white',
          '&:hover': { bgcolor: '#3d8b40' },
          borderRadius: 'sm',
          height: '35px',
          px: 1.5,
          fontSize: '0.875rem'
        }}
      >
        Ladda upp PDF
      </Button>

      <Modal open={open} onClose={handleClose}>
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
            <Typography level="body-sm" mb={1}>
              Välj PDF-fil att ladda upp
            </Typography>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="pdf-upload-input"
            />
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <label htmlFor="pdf-upload-input">
                <Button
                  component="span"
                  color="neutral"
                  variant="outlined"
                  startDecorator={<UploadIcon />}
                >
                  Välj fil
                </Button>
              </label>
              <Typography
                level="body-sm"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: file ? 'success.600' : 'text.secondary' 
                }}
              >
                {file ? file.name : 'Ingen fil vald'}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography level="body-sm" mb={1}>
              Beskrivning
            </Typography>
            <input
              type="text"
              placeholder="Beskriv innehållet i PDF-filen"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '8px 12px',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              variant="plain"
              color="neutral"
              onClick={handleClose}
              disabled={uploading}
            >
              Avbryt
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              loading={uploading}
              sx={{ 
                bgcolor: '#4caf50', 
                color: 'white',
                '&:hover': { bgcolor: '#3d8b40' } 
              }}
            >
              {uploading ? 'Laddar upp...' : 'Ladda upp'}
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default PDFUploader;