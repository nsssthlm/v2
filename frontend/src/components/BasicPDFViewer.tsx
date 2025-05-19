import React, { useState, useRef } from 'react';
import { Button, Modal, Box, Typography } from '@mui/joy';

interface BasicPDFViewerProps {
  folderId?: string | number;
  onUploadSuccess?: () => void;
}

/**
 * Extremt grundläggande PDF-visare, så enkel som möjligt
 */
const BasicPDFViewer: React.FC<BasicPDFViewerProps> = ({
  folderId,
  onUploadSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Hantera val av PDF-fil
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Skapa lokal URL för PDF-visning
      const fileUrl = URL.createObjectURL(selectedFile);
      
      // Spara filen och URL
      setFile(selectedFile);
      setPdfUrl(fileUrl);
      
      // Öppna modal med PDF
      setIsModalOpen(true);
    }
  };
  
  // Hantera uppladdning till server
  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name.replace('.pdf', ''));
      
      const uploadUrl = folderId 
        ? `/api/files/upload/?directory_slug=${folderId}` 
        : '/api/files/upload/';
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        setError('Uppladdning misslyckades');
      }
    } catch (err) {
      setError('Kunde inte ansluta till servern');
    } finally {
      setUploading(false);
    }
  };
  
  // Stäng modal och frigör URL
  const handleClose = () => {
    setIsModalOpen(false);
    if (pdfUrl) {
      // Rensa objektURL för att undvika minnesläckor
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    setFile(null);
    
    // Rensa file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <>
      {/* Dold fil-input som aktiveras av knappen */}
      <input
        type="file"
        accept=".pdf"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        ref={fileInputRef}
      />
      
      {/* Knapp för att välja fil */}
      <Button
        size="sm"
        color="success"
        onClick={() => fileInputRef.current?.click()}
        sx={{ 
          bgcolor: '#4caf50', 
          color: 'white',
          '&:hover': { bgcolor: '#3d8b40' },
          height: '35px'
        }}
      >
        Ladda upp PDF
      </Button>
      
      {/* Modal för PDF-visning */}
      {isModalOpen && pdfUrl && (
        <Modal
          open={isModalOpen}
          onClose={handleClose}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: '90vw',
              height: '90vh',
              bgcolor: 'background.paper',
              borderRadius: '8px',
              boxShadow: 24,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography level="title-lg">
                {file?.name || 'PDF Dokument'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {!uploading && (
                  <Button
                    color="primary"
                    onClick={handleUpload}
                    disabled={uploading}
                  >
                    Spara till server
                  </Button>
                )}
                <Button color="neutral" onClick={handleClose}>
                  Stäng
                </Button>
              </Box>
            </Box>
            
            {/* Error message */}
            {error && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'error.main',
                  color: 'white',
                }}
              >
                {error}
              </Box>
            )}
            
            {/* PDF Viewer */}
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <iframe
                src={pdfUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                title="PDF Viewer"
              />
            </Box>
          </Box>
        </Modal>
      )}
    </>
  );
};

export default BasicPDFViewer;