import React from 'react';
import { Modal, ModalDialog } from '@mui/joy';
import SuperReliablePDFViewer from './SuperReliablePDFViewer';

interface SuperReliablePDFDialogProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  filename?: string;
}

/**
 * En mycket pålitlig dialog-komponent för att visa PDF-filer med maximal kompatibilitet.
 * Denna komponent använder SuperReliablePDFViewer för att visa PDF-filer med flera
 * fallback-metoder för att maximera chansen att PDF:en visas korrekt.
 */
const SuperReliablePDFDialog: React.FC<SuperReliablePDFDialogProps> = ({
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
        <SuperReliablePDFViewer
          pdfUrl={pdfUrl}
          filename={filename}
          onClose={onClose}
        />
      </ModalDialog>
    </Modal>
  );
};

export default SuperReliablePDFDialog;