/**
 * API-integrationslager för PDF-hantering
 * Denna modul hanterar kommunikation med servern för PDF-lagring och hämtning
 */

class PDFAPIService {
  /**
   * Laddar upp en PDF-fil till servern
   * @param {File|Blob} pdfFile - PDF-filen att ladda upp
   * @param {Object} metadata - Metadata för PDF-filen
   * @returns {Promise<Object>} - Information om den uppladdade PDF-filen
   */
  static async uploadPDF(pdfFile, metadata) {
    try {
      // Konvertera filen till base64
      const base64Data = await this.fileToBase64(pdfFile);
      
      // Skapa API-förfrågan
      const requestData = {
        file: base64Data,
        title: metadata.title || 'Namnlös PDF',
        description: metadata.description || '',
        project_id: metadata.projectId || 1, // Default till projekt 1 om inget anges
        folder_id: metadata.folderId || null, // Lägg till mappkoppling om sådan finns
      };
      
      // Om file_id finns, lägg till det (för versionshantering)
      if (metadata.fileId) {
        requestData.file_id = metadata.fileId;
      }
      
      // Skicka till API
      const response = await fetch('/pdf/upload/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        credentials: 'include' // Inkludera cookies för autentisering
      });
      
      if (!response.ok) {
        throw new Error(`Server svarade med ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Fel vid uppladdning av PDF:', error);
      throw error;
    }
  }
  
  /**
   * Hämtar innehållet i en PDF-fil från servern
   * @param {string|number} pdfId - ID för PDF-filen att hämta
   * @returns {Promise<Blob>} - PDF-filens innehåll som en Blob
   */
  static async getPDFContent(pdfId) {
    try {
      const response = await fetch(`/pdf/${pdfId}/content/`, {
        method: 'GET',
        credentials: 'include' // Inkludera cookies för autentisering
      });
      
      if (!response.ok) {
        throw new Error(`Server svarade med ${response.status}: ${response.statusText}`);
      }
      
      return await response.blob();
    } catch (error) {
      console.error(`Fel vid hämtning av PDF-innehåll för ID ${pdfId}:`, error);
      throw error;
    }
  }
  
  /**
   * Konverterar en fil till base64-sträng
   * @param {File|Blob} file - Filen att konvertera
   * @returns {Promise<string>} - Base64-kodad sträng
   */
  static fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }
  
  /**
   * Sparar en PDF-annotation till servern
   * @param {number} pdfId - ID för PDF-dokumentet
   * @param {Object} annotation - Annotations-objektet att spara
   * @returns {Promise<Object>} - Den sparade annotationen
   */
  static async saveAnnotation(pdfId, annotation) {
    try {
      const response = await fetch(`/pdf/${pdfId}/annotations/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(annotation),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Server svarade med ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Fel vid sparande av annotation för PDF ${pdfId}:`, error);
      throw error;
    }
  }
  
  /**
   * Hämtar annotationer för en PDF-fil
   * @param {number} pdfId - ID för PDF-dokumentet
   * @returns {Promise<Array>} - Lista med annotationer
   */
  static async getAnnotations(pdfId) {
    try {
      const response = await fetch(`/pdf/${pdfId}/annotations/`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Server svarade med ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.annotations || [];
    } catch (error) {
      console.error(`Fel vid hämtning av annotationer för PDF ${pdfId}:`, error);
      return []; // Returnera tom array vid fel
    }
  }
  
  /**
   * Hämtar en lista över alla PDF-filer, med valfri mappfiltrering
   * @param {string|number|null} folderId - ID för mappen att filtrera på (null = alla, 'root' = endast rotmappen)
   * @returns {Promise<Array>} - Lista med PDF-dokument
   */
  static async getPDFList(folderId = null) {
    try {
      let url = '/pdf/list/';
      
      // Om folderId är specificerat, lägg till det i URL:en
      if (folderId !== null) {
        url = `/pdf/list/${folderId}/`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include' // Inkludera cookies för autentisering
      });
      
      if (!response.ok) {
        throw new Error(`Server svarade med ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.pdf_documents || [];
    } catch (error) {
      console.error(`Fel vid hämtning av PDF-lista:`, error);
      return []; // Returnera tom array vid fel
    }
  }
}

// Exportera så den kan användas från pdf-dialog-viewer.html
window.PDFAPIService = PDFAPIService;