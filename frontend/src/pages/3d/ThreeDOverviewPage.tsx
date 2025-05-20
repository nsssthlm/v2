import React, { useState, useRef } from 'react';
import { Box, Typography, Button, Stack } from '@mui/joy';
import IFCViewer from '../../components/IFCViewer';

/**
 * ThreeDOverviewPage - Sida för 3D-översikt
 * En IFC-visare som faktiskt läser och visar IFC-filer
 */
const ThreeDOverviewPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Hantera filuppladdning
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    
    // Verifiera att det är en IFC-fil
    if (!file.name.toLowerCase().endsWith('.ifc')) {
      alert('Endast IFC-filer stöds.');
      return;
    }
    
    // Visa laddningsstatus
    setIsLoading(true);
    
    // Liten tidsfördröjning för användarvänlighet
    setTimeout(() => {
      setSelectedFile(file);
      setIsLoading(false);
    }, 500);
  };
  
  // Rensa modell
  const clearModel = () => {
    setSelectedFile(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <Box sx={{ 
      p: 2, 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column'
    }}>
      <Typography level="h2" sx={{ mb: 2 }}>3D översikt</Typography>
      
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography level="h4">3D-modellvisare (IFC)</Typography>
          <Typography level="body-sm" sx={{ mb: 2 }}>
            Ladda upp och visa 3D-modeller i IFC-format
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <input
              type="file"
              accept=".ifc"
              id="ifc-file-input"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <label htmlFor="ifc-file-input">
              <Button
                component="span"
                variant="solid"
                color="primary"
                sx={{ mr: 1 }}
                disabled={isLoading}
              >
                Välj IFC-fil
              </Button>
            </label>
            
            <Button
              variant="outlined"
              color="neutral"
              onClick={clearModel}
              disabled={isLoading || !selectedFile}
            >
              Rensa
            </Button>
          </Box>
          
          {selectedFile && (
            <Typography level="body-sm" sx={{ mb: 1 }}>
              Aktuell modell: <strong>{selectedFile.name}</strong>
            </Typography>
          )}
        </Box>
        
        <Box sx={{ 
          flex: 1, 
          position: 'relative',
          display: 'flex'
        }}>
          {/* Använd vår nya IFCViewer-komponent som faktiskt läser IFC-filer */}
          <IFCViewer file={selectedFile} onClear={clearModel} />
        </Box>
      </Box>
    </Box>
  );
};

export default ThreeDOverviewPage;