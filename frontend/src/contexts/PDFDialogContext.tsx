import React, { ReactNode } from 'react';

/**
 * Tom provider som bara returnerar children
 * PDF-visningsfunktionaliteten har tagits bort
 */
export function PDFDialogProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/**
 * Dummy hook som inte gör något 
 * Detta är bara för bakåtkompatibilitet så vi inte bryter existerande kod
 */
export function usePDFDialog() {
  return {
    dialogState: { isOpen: false },
    openPDFDialog: (params: any) => {
      console.log('PDF-funktionalitet borttagen. Params:', params);
    },
    closePDFDialog: () => {
      console.log('PDF-funktionalitet borttagen.');
    }
  };
}