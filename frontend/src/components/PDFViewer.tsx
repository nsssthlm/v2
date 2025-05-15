import React, { useEffect } from 'react';
import { Modal, ModalDialog, ModalClose, Typography, Button } from '@mui/joy';

interface PDFViewerProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  fileName: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ open, onClose, pdfUrl, fileName }) => {
  // När komponenten visas, logga URL:en
  useEffect(() => {
    if (open) {
      console.log("Visar PDF:", pdfUrl);
    }
  }, [open, pdfUrl]);

  // Öppna PDF i ny flik som reservalternativ
  const openInNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        aria-labelledby="pdf-viewer-modal"
        size="lg"
        sx={{ width: '80%', height: '80%', maxWidth: '900px', maxHeight: '700px' }}
      >
        <ModalClose onClick={onClose} />
        <Typography id="pdf-viewer-modal" level="h3" mb={1}>
          {fileName}
        </Typography>
        
        <div style={{ position: 'relative', width: '100%', height: 'calc(100% - 80px)' }}>
          <iframe
            title={`${fileName} PDF`}
            src={pdfUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none'
            }}
          />
        </div>
        
        <Button 
          onClick={openInNewTab}
          variant="outlined" 
          color="neutral" 
          sx={{ mt: 1 }}
        >
          Öppna i ny flik
        </Button>
      </ModalDialog>
    </Modal>
  );
};

export default PDFViewer;