import React, { createContext, useContext, useState, ReactNode } from 'react';
import BasicPDFDialog from '../components/BasicPDFDialog';

// Interface för PDF-dialog state
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

// Interface för context värdet
interface PDFDialogContextType {
  dialogState: PDFDialogState;
  openPDFDialog: (params: Omit<PDFDialogState, 'isOpen'>) => void;
  closePDFDialog: () => void;
}

// Initial state för dialogen
const initialDialogState: PDFDialogState = {
  isOpen: false
};

// Skapa context
const PDFDialogContext = createContext<PDFDialogContextType | undefined>(undefined);

/**
 * Provider komponent för PDF-dialogen
 */
export function PDFDialogProvider({ children }: { children: ReactNode }) {
  const [dialogState, setDialogState] = useState<PDFDialogState>(initialDialogState);

  // Öppna dialogen med de angivna parametrarna
  const openPDFDialog = (params: Omit<PDFDialogState, 'isOpen'>) => {
    console.log('Öppnar PDF:', params.initialUrl, params.filename);
    setDialogState({
      ...params,
      isOpen: true
    });
  };

  // Stäng dialogen och återställ state
  const closePDFDialog = () => {
    setDialogState(initialDialogState);
  };

  return (
    <PDFDialogContext.Provider value={{ dialogState, openPDFDialog, closePDFDialog }}>
      {children}
      {dialogState.isOpen && dialogState.initialUrl && (
        <BasicPDFDialog 
          open={dialogState.isOpen} 
          onClose={closePDFDialog}
          pdfUrl={dialogState.initialUrl}
          filename={dialogState.filename || 'PDF-dokument'}
        />
      )}
    </PDFDialogContext.Provider>
  );
}

/**
 * Custom hook för att använda PDF-dialog context
 */
export function usePDFDialog() {
  const context = useContext(PDFDialogContext);
  
  if (context === undefined) {
    throw new Error('usePDFDialog måste användas inom en PDFDialogProvider');
  }
  
  return context;
}