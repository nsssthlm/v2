import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Modal, ModalDialog } from '@mui/joy';

interface PDFDialogState {
  isOpen: boolean;
  fileId?: string | number;
  initialUrl?: string;
  filename?: string;
  projectId?: number | null;
  file?: File | null;
  versionId?: number;
  pdfFile?: Blob | null;
  highlightAnnotationId?: number;
  annotationId?: number;
  folderId?: number | null;
}

interface PDFDialogContextType {
  dialogState: PDFDialogState;
  openPDFDialog: (params: Omit<PDFDialogState, 'isOpen'>) => void;
  closePDFDialog: () => void;
}

const initialDialogState: PDFDialogState = {
  isOpen: false
};

const PDFDialogContext = createContext<PDFDialogContextType | undefined>(undefined);

export const PDFDialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dialogState, setDialogState] = useState<PDFDialogState>(initialDialogState);

  const openPDFDialog = (params: Omit<PDFDialogState, 'isOpen'>) => {
    setDialogState({
      ...params,
      isOpen: true
    });
  };

  const closePDFDialog = () => {
    setDialogState(initialDialogState);
  };

  return (
    <PDFDialogContext.Provider value={{ dialogState, openPDFDialog, closePDFDialog }}>
      {children}
      <Modal
        open={dialogState.isOpen}
        onClose={() => closePDFDialog()}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <ModalDialog
          variant="outlined"
          size="lg"
          sx={{
            p: 0,
            width: '90vw', 
            maxWidth: '1400px',
            height: '90vh',
            maxHeight: '800px',
            overflow: 'hidden'
          }}
        >
          {dialogState.isOpen && dialogState.initialUrl && (
            <iframe 
              src={dialogState.initialUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              title={dialogState.filename || 'PDF'}
            />
          )}
        </ModalDialog>
      </Modal>
    </PDFDialogContext.Provider>
  );
};

export const usePDFDialog = (): PDFDialogContextType => {
  const context = useContext(PDFDialogContext);
  
  if (context === undefined) {
    throw new Error('usePDFDialog must be used within a PDFDialogProvider');
  }
  
  return context;
};