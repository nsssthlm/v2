import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Funktionen konverterar backend HTTP URL till en blob URL som kan användas säkert i frontend
export async function fetchAndCreateBlobUrl(pdfUrl: string): Promise<string> {
  try {
    // Ersätt http://0.0.0.0:8001 med relativ sökväg /api
    // Detta gör att anropet går via frontend-servern som redan har CORS-konfigurerad
    const relativeUrl = pdfUrl.replace('http://0.0.0.0:8001/api', '/api');
    
    console.log(`Hämtar PDF från: ${relativeUrl}`);
    
    // Hämta PDF-filen via axios
    const response = await axios.get(relativeUrl, {
      responseType: 'blob',
    });
    
    // Skapa en blob URL från responsen
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    
    console.log(`Skapade blob URL: ${blobUrl}`);
    
    return blobUrl;
  } catch (error) {
    console.error('Fel vid hämtning och konvertering av PDF:', error);
    throw error;
  }
}