import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';

interface SimplePDFJSDialogProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  filename: string;
}

const SimplePDFJSDialog: React.FC<SimplePDFJSDialogProps> = ({ open, onClose, pdfUrl, filename }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Direkt inbäddning av PDF med iframe
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
          backgroundColor: '#1976d2', 
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
      
      <DialogContent 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          padding: 0, 
          overflow: 'hidden'
        }}
      >
        {/* Inbäddad PDF-visare med iframe */}
        <iframe 
          src={pdfUrl} 
          width="100%" 
          height="100%" 
          style={{ border: 'none' }}
          title={filename}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError('Kunde inte ladda PDF-filen');
          }}
        />
        
        {loading && (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              backgroundColor: 'rgba(255,255,255,0.8)'
            }}
          >
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              backgroundColor: 'white'
            }}
          >
            <Typography color="error">{error}</Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SimplePDFJSDialog;