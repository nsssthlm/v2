import React, { createContext, useContext, useState, ReactNode } from 'react';

// Temporär implementering: detta kommer att ersättas med en annan PDF-visningsstrategi
// Interface för PDF-dialog state
interface PDFDialogState {
  isOpen: boolean;
  fileId?: string | number;
  initialUrl?: string;
  filename?: string;
  projectId?: number | null;
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
    console.log('PDF öppning begärd:', params.initialUrl, params.filename);
    // Öppna PDF:en i ett nytt fönster istället för en dialog
    if (params.initialUrl) {
      window.open(params.initialUrl, '_blank');
    }
    // Spara inte state för dialogen eftersom vi inte använder den för tillfället
  };

  // Stäng dialogen och återställ state
  const closePDFDialog = () => {
    setDialogState(initialDialogState);
  };

  return (
    <PDFDialogContext.Provider value={{ dialogState, openPDFDialog, closePDFDialog }}>
      {children}
      {/* Ingen dialog för tillfället - vi använder window.open istället */}
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