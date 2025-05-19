import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Typography } from '@mui/joy';
import ObjectPDFViewer from './ObjectPDFViewer';

const PDFTestPage: React.FC = () => {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [viewerVisible, setViewerVisible] = useState<boolean>(false);
  const [filename, setFilename] = useState<string>('');
  
  // Exempel på olika vägar till PDF-filer
  const examplePaths = [
    '/api/files/web/test555-65/data/project_files/2025/05/19/BEAst-PDF-Guidelines-2.0_1.pdf',
    '/api/files/web/testhhhhhhh-68/data/project_files/2025/05/19/AAAAExempel_pa_ritningar_f8q2wVX.pdf',
    '/api/files/web/karlatornet-31/data/project_files/2025/05/19/BEAst-PDF-Guidelines-2.0_1.pdf',
    '/pdf/project_files/2025/05/19/BEAst-PDF-Guidelines-2.0_1.pdf',
    // Ny förenklad direktåtkomst - använd bara filnamnet
    '/api/pdf-direct/BEAst-PDF-Guidelines-2.0_1.pdf',
    '/api/pdf-direct/AAAAExempel_pa_ritningar.pdf'
  ];
  const examplePath = examplePaths[0];
  
  const handleViewPdf = () => {
    if (pdfUrl) {
      setViewerVisible(true);
    }
  };
  
  const handleUseExample = (index = 0) => {
    const path = examplePaths[index] || examplePaths[0];
    setPdfUrl(path);
    
    // Extrahera filnamnet från sökvägen
    const fileName = path.split('/').pop() || 'document.pdf';
    setFilename(fileName);
  };
  
  return (
    <Box sx={{ p: 4, maxWidth: '1200px', mx: 'auto' }}>
      <Typography level="h1" sx={{ mb: 3 }}>PDF Testverktyg</Typography>
      
      <Box sx={{ mb: 4, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 'md' }}>
        <Typography level="h3" sx={{ mb: 2 }}>Testa PDF-visning</Typography>
        
        <FormControl sx={{ mb: 2 }}>
          <FormLabel>URL till PDF-fil</FormLabel>
          <Input 
            value={pdfUrl}
            onChange={(e) => setPdfUrl(e.target.value)}
            sx={{ width: '100%' }}
            placeholder="Ange URL till PDF-filen"
          />
        </FormControl>
        
        <FormControl sx={{ mb: 3 }}>
          <FormLabel>Filnamn</FormLabel>
          <Input 
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            sx={{ width: '100%' }}
            placeholder="Ange filnamn (valfritt)"
          />
        </FormControl>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            color="primary" 
            variant="solid" 
            onClick={handleViewPdf}
            disabled={!pdfUrl}
          >
            Visa PDF
          </Button>
          
          <Button 
            color="neutral" 
            variant="outlined" 
            onClick={(e) => { e.preventDefault(); handleUseExample(0); }}
          >
            Exempel 1: BEAst Guidelines
          </Button>
          
          <Button 
            color="neutral" 
            variant="outlined" 
            onClick={(e) => { e.preventDefault(); handleUseExample(1); }}
          >
            Exempel 2: Ritningar
          </Button>
          
          <Button 
            color="neutral" 
            variant="outlined" 
            onClick={(e) => { e.preventDefault(); handleUseExample(2); }}
          >
            Exempel 3: Karlatornet
          </Button>
          
          <Button 
            color="neutral" 
            variant="outlined" 
            onClick={(e) => { e.preventDefault(); handleUseExample(3); }}
          >
            Exempel 4: Alternativ sökväg
          </Button>
          
          <Button 
            color="success" 
            variant="outlined" 
            onClick={(e) => { e.preventDefault(); handleUseExample(4); }}
          >
            Exempel 5: Direkt PDF (rekommenderas)
          </Button>
          
          <Button 
            color="success" 
            variant="outlined" 
            onClick={(e) => { e.preventDefault(); handleUseExample(5); }}
          >
            Exempel 6: Direkt Ritningsfil
          </Button>
        </Box>
      </Box>
      
      {viewerVisible && (
        <Box sx={{ 
          height: '800px', 
          border: '1px solid', 
          borderColor: 'divider',
          borderRadius: 'md',
          overflow: 'hidden'
        }}>
          <ObjectPDFViewer 
            pdfUrl={pdfUrl}
            fileName={filename || 'Dokument'}
            onClose={() => setViewerVisible(false)}
          />
        </Box>
      )}
      
      <Box sx={{ mt: 4 }}>
        <Typography level="h3" sx={{ mb: 2 }}>Debug-information</Typography>
        
        <Typography level="body-md" sx={{ mb: 1 }}>
          <strong>Aktuell URL:</strong> {pdfUrl || 'Ingen URL angiven'}
        </Typography>
        
        <Typography level="h4" sx={{ mt: 3, mb: 1 }}>Hjälp för felsökning</Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <li>
            <Typography level="body-md">
              Kontrollera att URL:en är korrekt och att du har behörighet att visa PDF-filen.
            </Typography>
          </li>
          <li>
            <Typography level="body-md">
              Se till att backend-servern körs och att PDF-filen finns tillgänglig.
            </Typography>
          </li>
          <li>
            <Typography level="body-md">
              För projektfiler, använd formatet: /api/files/web/[projekt-id]/data/project_files/[år]/[månad]/[dag]/[filnamn].pdf
            </Typography>
          </li>
          <li>
            <Typography level="body-md">
              Kontrollera nätverksfönstret i webbläsaren för att se eventuella fel.
            </Typography>
          </li>
        </Box>
      </Box>
    </Box>
  );
};

export default PDFTestPage;