import React, { useState } from 'react';
import { Box, Typography, Button, Sheet, Divider } from '@mui/joy';
import UltimatePDFDialog from '../components/UltimatePDFDialog';
import { DEMO_PDF_URL } from '../components/UltimatePDFViewer';

/**
 * En demosida som visar vår förbättrade PDF-viewer med demopdf:er
 * Denna komponent använder enbart publika demo-PDF:er och kräver ingen serveranslutning
 */
const DemoPDFView = () => {
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  // Lista över offentliga demo-PDF:er för testning
  const demoPdfs = [
    { name: 'Mozilla PDF.js Tracemonkey', url: DEMO_PDF_URL },
    { name: 'W3C Sample PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { name: 'Adobe PDF Specification', url: 'https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/PDF32000_2008.pdf' }
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography level="h1" sx={{ mb: 3 }}>PDF Viewer Demonstration</Typography>
      <Typography sx={{ mb: 3 }}>
        Denna sida demonstrerar den förbättrade PDF-visaren med offentliga PDF-filer.
        Välj en PDF nedan för att testa visningskomponenten.
      </Typography>
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography level="h2" sx={{ mb: 2 }}>Välj en demo-PDF</Typography>
        
        {demoPdfs.map((pdf, index) => (
          <Sheet 
            key={index}
            variant="outlined"
            sx={{ 
              p: 2,
              borderRadius: 'sm',
              boxShadow: 'sm'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}>
              <Typography>{pdf.name}</Typography>
              <Button 
                variant="solid" 
                color="primary"
                onClick={() => setSelectedPdf(pdf.url)}
              >
                Visa PDF
              </Button>
            </Box>
          </Sheet>
        ))}
      </Box>
      
      {selectedPdf && (
        <UltimatePDFDialog
          open={!!selectedPdf}
          onClose={() => setSelectedPdf(null)}
          pdfUrl={selectedPdf}
          filename="Demo PDF"
          isEmbedded={true}
        />
      )}
    </Box>
  );
};

export default DemoPDFView;