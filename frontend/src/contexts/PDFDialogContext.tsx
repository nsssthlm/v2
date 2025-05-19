import React, { useState, ReactNode, useEffect } from 'react';
import DirectPDFDialog from '../components/DirectPDFDialog';
import axios from 'axios';

// Interface för PDF-dialog state
interface PDFDialogState {
  isOpen: boolean;
  pdfUrl?: string;
  filename?: string;
  fileId?: string | number;
  folderId?: number | null;
  folderName?: string;
  projectName?: string;
}

// Interface för context värdet
interface PDFDialogContextType {
  dialogState: PDFDialogState;
  openPDFDialog: (params: { 
    pdfUrl: string; 
    filename: string; 
    fileId?: string | number; 
    folderId?: number | null;
    folderName?: string;
    projectName?: string;
  }) => void;
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
  const [folderInfo, setFolderInfo] = useState<{name: string, projectName?: string} | null>(null);

  // Hämta mappens namn baserat på mappens ID
  useEffect(() => {
    const fetchFolderInfo = async () => {
      if (dialogState.folderId && !dialogState.folderName) {
        try {
          const response = await axios.get(`/api/files/directories/${dialogState.folderId}/`);
          if (response.data) {
            setFolderInfo({
              name: response.data.name || 'Okänd mapp',
              projectName: response.data.project?.name || 'Okänt projekt'
            });
          }
        } catch (error) {
          console.error('Kunde inte hämta mappinformation:', error);
        }
      }
    };

    if (dialogState.isOpen) {
      fetchFolderInfo();
    }
  }, [dialogState.folderId, dialogState.folderName, dialogState.isOpen]);

  // Öppna dialogen med de angivna parametrarna
  const openPDFDialog = (params: { 
    pdfUrl: string; 
    filename: string; 
    fileId?: string | number; 
    folderId?: number | null;
    folderName?: string;
    projectName?: string;
  }) => {
    console.log('Öppnar PDF:', params.pdfUrl, params.filename);
    setDialogState({
      isOpen: true,
      pdfUrl: params.pdfUrl,
      filename: params.filename,
      fileId: params.fileId,
      folderId: params.folderId,
      folderName: params.folderName,
      projectName: params.projectName
    });
  };

  // Stäng dialogen och återställ state
  const closePDFDialog = () => {
    setDialogState(initialDialogState);
    setFolderInfo(null);
  };

  // Sammanställ komplett information om filen och dess kontext
  const completeDialogState = {
    ...dialogState,
    folderName: dialogState.folderName || folderInfo?.name,
    projectName: dialogState.projectName || folderInfo?.projectName
  };

  return (
    <PDFDialogContext.Provider value={{ dialogState: completeDialogState, openPDFDialog, closePDFDialog }}>
      {children}
      {dialogState.isOpen && dialogState.pdfUrl && (
        <DirectPDFDialog 
          open={dialogState.isOpen} 
          onClose={closePDFDialog}
          pdfUrl={dialogState.pdfUrl}
          filename={dialogState.filename || 'PDF-dokument'}
          folderName={completeDialogState.folderName}
          projectName={completeDialogState.projectName}
          fileId={dialogState.fileId}
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