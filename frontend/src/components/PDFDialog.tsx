import React from 'react';
import { Modal, ModalDialog, ModalClose, Typography, Box } from '@mui/joy';

interface PDFDialogProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  filename: string;
}

const PDFDialog: React.FC<PDFDialogProps> = ({ open, onClose, pdfUrl, filename }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <ModalDialog 
        sx={{ 
          maxWidth: '90vw', 
          maxHeight: '90vh',
          width: '90%',
          height: '90%',
          padding: 1,
          overflow: 'hidden'
        }}
      >
        <ModalClose />
        <Typography level="title-lg" sx={{ mb: 1 }}>
          {filename}
        </Typography>
        
        <Box sx={{ width: '100%', height: 'calc(100% - 40px)', overflow: 'hidden' }}>
          {pdfUrl ? (
            <iframe
              src={`/pdfjs-viewer.html?url=${encodeURIComponent(pdfUrl)}`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="fullscreen"
            />
          ) : (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: '100%',
              border: '1px solid',
              borderColor: 'divider'
            }}>
              Kunde inte ladda PDF
            </Box>
          )}
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default PDFDialog;