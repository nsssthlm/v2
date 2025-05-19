import React from 'react';
import { Modal, ModalDialog } from '@mui/joy';
import UltimatePDFViewer from './UltimatePDFViewer';

interface UltimatePDFDialogProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  filename?: string;
}

/**
 * UltimatePDFDialog - en extremt pålitlig dialog för PDF-visning
 * 
 * Denna komponent använder UltimatePDFViewer som har flera parallella
 * renderingsmetoder för maximal kompatibilitet i alla webbläsare och miljöer.
 */
const UltimatePDFDialog: React.FC<UltimatePDFDialogProps> = ({
  open,
  onClose,
  pdfUrl,
  filename = 'PDF Dokument'
}) => {
  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <ModalDialog
        size="lg"
        layout="fullscreen"
        sx={{
          width: '100%',
          maxWidth: '1500px',
          height: '95vh',
          p: 0,
          m: 0,
          overflow: 'hidden'
        }}
      >
        <UltimatePDFViewer
          pdfUrl={pdfUrl}
          filename={filename}
          onClose={onClose}
        />
      </ModalDialog>
    </Modal>
  );
};

export default UltimatePDFDialog;