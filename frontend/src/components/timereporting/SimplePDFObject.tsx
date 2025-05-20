import React from 'react';
import { Box } from '@mui/joy';

interface SimplePDFObjectProps {
  pdfUrl: string;
}

/**
 * En extremt enkel PDF-visare som bara använder object-taggen med absolut minimum kod
 */
const SimplePDFObject: React.FC<SimplePDFObjectProps> = ({ pdfUrl }) => {
  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <object
        data={pdfUrl}
        type="application/pdf"
        width="100%"
        height="100%"
        style={{ border: 'none' }}
      >
        Din webbläsare kan inte visa PDF direkt. <a href={pdfUrl} target="_blank" rel="noopener noreferrer">Öppna PDF</a>
      </object>
    </Box>
  );
};

export default SimplePDFObject;