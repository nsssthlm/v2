import React from 'react';
import { Modal, ModalDialog, ModalClose, Typography } from '@mui/joy';

interface PDFViewerProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  fileName: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ open, onClose, pdfUrl, fileName }) => {
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
        
        <iframe
          title={`${fileName} PDF`}
          src={pdfUrl}
          style={{
            width: '100%',
            height: 'calc(100% - 50px)',
            border: 'none'
          }}
        />
      </ModalDialog>
    </Modal>
  );
};

export default PDFViewer;