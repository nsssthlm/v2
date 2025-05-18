import React, { useState, ReactNode } from 'react';
import SimplePDFJSDialog from '../components/SimplePDFJSDialog';

// Interface för PDF-dialog state
interface PDFDialogState {
  isOpen: boolean;
  pdfUrl?: string;
  filename?: string;
  fileId?: string | number;
  folderId?: number | null;
}

// Interface för context värdet
interface PDFDialogContextType {
  dialogState: PDFDialogState;
  openPDFDialog: (params: { pdfUrl: string; filename: string; fileId?: string | number; folderId?: number | null }) => void;
  closePDFDialog: () => void;
}

// Initial state för dialogen
const initialDialogState: PDFDialogState = {
  isOpen: false
};

// Skapa context
const PDFDialogContext = React.createContext<PDFDialogContextType | undefined>(undefined);

/**
 * Provider komponent för PDF-dialogen
 */
export function PDFDialogProvider({ children }: { children: ReactNode }) {
  const [dialogState, setDialogState] = useState<PDFDialogState>(initialDialogState);

  // Öppna dialogen med de angivna parametrarna
  const openPDFDialog = (params: { pdfUrl: string; filename: string; fileId?: string | number; folderId?: number | null }) => {
    console.log('Öppnar PDF:', params.pdfUrl, params.filename);
    setDialogState({
      isOpen: true,
      pdfUrl: params.pdfUrl,
      filename: params.filename,
      fileId: params.fileId,
      folderId: params.folderId
    });
  };

  // Stäng dialogen och återställ state
  const closePDFDialog = () => {
    setDialogState(initialDialogState);
  };

  return (
    <PDFDialogContext.Provider value={{ dialogState, openPDFDialog, closePDFDialog }}>
      {children}
      {dialogState.isOpen && dialogState.pdfUrl && (
        <SimplePDFJSDialog 
          open={dialogState.isOpen} 
          onClose={closePDFDialog}
          pdfUrl={dialogState.pdfUrl}
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
  const context = React.useContext(PDFDialogContext);
  
  if (context === undefined) {
    throw new Error('usePDFDialog måste användas inom en PDFDialogProvider');
  }
  
  return context;
}