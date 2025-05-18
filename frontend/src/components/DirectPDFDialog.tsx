import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';

interface DirectPDFDialogProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  filename: string;
}

const DirectPDFDialog: React.FC<DirectPDFDialogProps> = ({ open, onClose, pdfUrl, filename }) => {
  // Använd blå färg
  const BlueColor = '#1976d2';

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{ 
        '& .MuiDialog-paper': { 
          height: '90vh', 
          display: 'flex', 
          flexDirection: 'column'
        } 
      }}
    >
      <DialogTitle 
        sx={{ 
          backgroundColor: BlueColor, 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px'
        }}
      >
        <Typography variant="h6" component="div">
          {filename}
        </Typography>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={onClose} 
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1, height: '100%', overflow: 'hidden' }}>
          <iframe 
            src={pdfUrl}
            style={{ 
              width: '100%', 
              height: '100%', 
              border: 'none',
              display: 'block'
            }}
            title={filename}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DirectPDFDialog;