import React, { useState } from 'react';
import { 
  Button, 
  Modal, 
  ModalDialog, 
  ModalClose, 
  Typography, 
  Box 
} from '@mui/joy';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface FolderPDFButtonProps {
  fileUrl: string;
  fileName: string;
}

/**
 * PDF-knapp för mappvyn som öppnar PDF i en modal-dialog
 */
const FolderPDFButton: React.FC<FolderPDFButtonProps> = ({ fileUrl, fileName }) => {
  const [open, setOpen] = useState(false);
  
  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  return (
    <>
      <Button
        size="sm"
        variant="solid"
        color="primary"
        startDecorator={<VisibilityIcon sx={{ fontSize: 16 }} />}
        onClick={handleOpen}
        sx={{ 
          fontSize: '0.8rem',
          py: 0.5,
          bgcolor: '#1976d2', 
          color: 'white',
          '&:hover': {
            bgcolor: '#1565c0'
          }
        }}
      >
        Visa PDF
      </Button>
      
      <Modal
        open={open}
        onClose={handleClose}
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
            {fileName}
          </Typography>
          
          <Box sx={{ width: '100%', height: 'calc(100% - 40px)', overflow: 'hidden' }}>
            <iframe
              src={fileUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title={fileName}
            />
          </Box>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default FolderPDFButton;