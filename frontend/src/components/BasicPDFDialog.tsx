import React from 'react';
import {
  Modal,
  ModalDialog,
  Box,
  Button,
  Typography,
  IconButton
} from '@mui/joy';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';

interface BasicPDFDialogProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  filename: string;
}

/**
 * Super-enkel PDF-dialogkomponent som visar PDF direkt i en iframe
 */
const BasicPDFDialog: React.FC<BasicPDFDialogProps> = ({
  open,
  onClose,
  pdfUrl,
  filename
}) => {
  // Funktion för att öppna PDF i ett nytt fönster
  const openInNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <Modal open={open} onClose={onClose}>
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
            color: 'white',
            borderTopLeftRadius: 'var(--Joy-radius-sm)',
            borderTopRightRadius: 'var(--Joy-radius-sm)'
          }}
        >
          <Typography level="title-md" sx={{ pl: 1 }}>
            {filename || 'PDF Dokument'}
          </Typography>
          
          <Box sx={{ display: 'flex' }}>
            <Button
              variant="soft"
              color="neutral"
              size="sm"
              sx={{ mr: 1, bgcolor: 'white', color: 'primary.600' }}
              startDecorator={<DownloadIcon />}
              onClick={openInNewTab}
            >
              Öppna i ny flik
            </Button>
            
            <IconButton
              variant="plain"
              color="neutral"
              size="sm"
              onClick={onClose}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        
        {/* Innehåll - enkel iframe för att visa PDF:en */}
        <Box
          sx={{
            flex: 1,
            bgcolor: 'grey.100',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <iframe
            src={pdfUrl}
            title={filename}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
          />
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default BasicPDFDialog;