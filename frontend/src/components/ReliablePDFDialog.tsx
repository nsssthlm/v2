import React from 'react';
import { Modal, ModalDialog } from '@mui/joy';
import ReliablePDFViewer from './ReliablePDFViewer';

interface ReliablePDFDialogProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  filename?: string;
  fileId?: string | number;
  projectId?: number | null;
  folderId?: number | null;
}

/**
 * Förbättrad PDF-dialogkomponent som använder den mer pålitliga PDF-visaren
 */
const ReliablePDFDialog: React.FC<ReliablePDFDialogProps> = ({
  open,
  onClose,
  pdfUrl,
  filename = 'PDF Dokument',
  fileId,
  projectId,
  folderId
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
        <ReliablePDFViewer
          initialUrl={pdfUrl}
          fileId={fileId}
          filename={filename}
          onClose={onClose}
          projectId={projectId}
          folderId={typeof folderId === 'string' ? parseInt(folderId, 10) : folderId}
        />
      </ModalDialog>
    </Modal>
  );
};

export default ReliablePDFDialog;