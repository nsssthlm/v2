import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Modal,
  ModalDialog,
  CircularProgress,
} from '@mui/joy';
import UploadIcon from '@mui/icons-material/Upload';

interface DirectPDFUploaderProps {
  folderId?: string | number;
  onUploadSuccess?: () => void;
}

/**
 * Extremt enkel PDF-uppladdare som visar PDFen direkt från fil-objektet
 * utan att försöka hämta den från servern
 */
const DirectPDFUploader: React.FC<DirectPDFUploaderProps> = ({
  folderId,
  onUploadSuccess
}) => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [localPdfUrl, setLocalPdfUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Hantera val av fil
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Skapa en lokal URL till filen
      const fileUrl = URL.createObjectURL(selectedFile);
      setLocalPdfUrl(fileUrl);
    }
  };
  
  // Hantera uppladdning
  const handleUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Skapa FormData för uppladdning
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);
      formData.append('name', file.name.replace('.pdf', ''));
      
      // Bestäm URL för uppladdning
      const uploadUrl = folderId 
        ? `/api/files/upload/?directory_slug=${folderId}` 
        : '/api/files/upload/';
      
      console.log('Laddar upp fil till:', uploadUrl);
      
      // Ladda upp filen
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        // Uppladdningen lyckades
        console.log('Uppladdning lyckades');
        
        // Stäng uppladdningsdialogen och öppna visaren direkt
        setUploadOpen(false);
        setViewerOpen(true);
        
        // Meddela att uppladdningen lyckades
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        // Något gick fel
        let errorMsg = 'Uppladdning misslyckades';
        try {
          const errorData = await response.json();
          errorMsg = errorData.detail || errorData.message || errorMsg;
        } catch (e) {
          // Om vi inte kan läsa JSON från svaret
          errorMsg = `Fel: ${response.status} ${response.statusText}`;
        }
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Fel vid uppladdning:', err);
      setError('Kunde inte ansluta till servern');
    } finally {
      setLoading(false);
    }
  };
  
  // Stäng PDF-visaren
  const closeViewer = () => {
    setViewerOpen(false);
    if (localPdfUrl) {
      URL.revokeObjectURL(localPdfUrl);
      setLocalPdfUrl(null);
    }
    setFile(null);
    setDescription('');
  };

  return (
    <>
      {/* Uppladdningsknapp */}
      <Button
        size="sm"
        startDecorator={<UploadIcon />}
        onClick={() => setUploadOpen(true)}
        sx={{ 
          bgcolor: '#4caf50', 
          color: 'white',
          '&:hover': { bgcolor: '#3d8b40' },
          height: '35px'
        }}
      >
        Ladda upp PDF
      </Button>
      
      {/* Uppladdningsdialog */}
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)}>
        <ModalDialog sx={{ maxWidth: 500, p: 3 }}>
          <Typography level="h4" mb={2}>
            Ladda upp PDF
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                border: '1px dashed',
                borderColor: 'neutral.400',
                borderRadius: 'sm',
                p: 3,
                textAlign: 'center',
                mb: 2,
                bgcolor: file ? 'success.50' : 'neutral.50'
              }}
            >
              {file ? (
                <Box>
                  <Typography level="body-md" fontWeight="bold">
                    {file.name}
                  </Typography>
                  <Typography level="body-sm" sx={{ mt: 1 }}>
                    {(file.size / 1024).toFixed(2)} KB
                  </Typography>
                  <Button
                    size="sm"
                    color="danger"
                    variant="soft"
                    sx={{ mt: 1 }}
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                      if (localPdfUrl) {
                        URL.revokeObjectURL(localPdfUrl);
                        setLocalPdfUrl(null);
                      }
                    }}
                  >
                    Ta bort
                  </Button>
                </Box>
              ) : (
                <>
                  <UploadIcon sx={{ fontSize: 40, color: 'neutral.500', mb: 1 }} />
                  <Typography level="body-md" mb={2}>
                    Klicka för att välja en PDF-fil
                  </Typography>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    id="direct-pdf-input"
                  />
                  <label htmlFor="direct-pdf-input">
                    <Button component="span" variant="outlined">
                      Välj fil
                    </Button>
                  </label>
                </>
              )}
            </Box>
            
            <Typography level="body-sm" mb={1}>
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
          
          {error && (
            <Box
              sx={{
                p: 1.5,
                mb: 2,
                bgcolor: 'error.softBg',
                color: 'error.solidColor',
                borderRadius: 'sm'
              }}
            >
              <Typography level="body-sm">{error}</Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              variant="plain"
              color="neutral"
              onClick={() => {
                setUploadOpen(false);
                setFile(null);
                setDescription('');
                setError('');
                if (localPdfUrl) {
                  URL.revokeObjectURL(localPdfUrl);
                  setLocalPdfUrl(null);
                }
              }}
            >
              Avbryt
            </Button>
            <Button
              onClick={handleUpload}
              loading={loading}
              disabled={!file || loading}
            >
              Ladda upp
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
      
      {/* PDF-visare */}
      <Modal open={viewerOpen} onClose={closeViewer}>
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
            <Typography level="title-md">
              {file?.name || 'PDF-dokument'}
            </Typography>
            <Button
              size="sm"
              variant="solid"
              color="neutral"
              sx={{ color: 'primary.500', bgcolor: 'white' }}
              onClick={closeViewer}
            >
              Stäng
            </Button>
          </Box>
          
          <Box sx={{ flex: 1, bgcolor: 'grey.100', position: 'relative' }}>
            {localPdfUrl ? (
              <iframe
                src={localPdfUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  display: 'block'
                }}
                title={file?.name || 'PDF-dokument'}
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

export default DirectPDFUploader;