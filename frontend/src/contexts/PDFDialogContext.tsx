import React, { useState, ReactNode } from 'react';
import DirectPDFDialog from '../components/DirectPDFDialog';

// Interface för PDF-dialog state
interface PDFDialogState {
  isOpen: boolean;
  pdfUrl?: string;
  filename?: string;
  fileId?: string | number;
  folderId?: number | null;
  projectId?: number | string | null;
}

// Interface för context värdet
interface PDFDialogContextType {
  dialogState: PDFDialogState;
  openPDFDialog: (params: { pdfUrl: string; filename: string; fileId?: string | number; folderId?: number | null; projectId?: number | string | null }) => void;
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
  const openPDFDialog = (params: { pdfUrl: string; filename: string; fileId?: string | number; folderId?: number | null; projectId?: number | string | null }) => {
    console.log('Öppnar PDF:', params.pdfUrl, params.filename, 'projektID:', params.projectId, 'mappID:', params.folderId);
    
    // Behåll den ursprungliga URL:en som vi får från API:et
    // PDF-visaren kommer att hantera URL:en korrekt utan extra ändringar
    let pdfApiUrl = params.pdfUrl;
    console.log('Öppnar PDF med original URL:', pdfApiUrl, params.filename);
    
    setDialogState({
      isOpen: true,
      pdfUrl: pdfApiUrl,
      filename: params.filename,
      fileId: params.fileId,
      folderId: params.folderId,
      projectId: params.projectId
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
        <DirectPDFDialog 
          open={dialogState.isOpen} 
          onClose={closePDFDialog}
          pdfUrl={dialogState.pdfUrl}
          filename={dialogState.filename || 'PDF-dokument'}
          projectId={dialogState.projectId}
          folderId={dialogState.folderId}
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