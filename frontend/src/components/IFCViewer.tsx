import React, { useState, useRef } from 'react';
import { Box, Button, CircularProgress, Typography, Stack } from '@mui/joy';

/**
 * IFC-visare för att ladda och visa IFC-modeller i 3D
 * Denna implementering demonstrerar gränssnittet och simuleringen av IFC-filer
 */
const IFCViewer: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadedModel, setLoadedModel] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Vyfunktioner - i en riktig implementation skulle dessa styra 3D-vyn
  const viewFront = () => {
    console.log('Byter till frontvy');
  };
  
  const viewTop = () => {
    console.log('Byter till vy ovanifrån');
  };
  
  const viewIso = () => {
    console.log('Byter till isometrisk vy');
  };
  
  const resetView = () => {
    console.log('Återställer vyn');
  };
  
  // Funktion för att hantera filuppladdning
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    
    // Kontrollera om det är en IFC-fil
    if (!file.name.toLowerCase().endsWith('.ifc')) {
      setErrorMessage('Endast IFC-filer stöds');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    // Simulera filbearbetning
    setTimeout(() => {
      setLoadedModel(file.name);
      setIsLoading(false);
    }, 1500);
  };
  
  // Rensa modellen
  const clearModel = () => {
    setLoadedModel(null);
    setErrorMessage(null);
    
    // Återställ filväljaren
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <Box sx={{ height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
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
            disabled={isLoading || !loadedModel}
          >
            Rensa
          </Button>
        </Box>
        
        {loadedModel && (
          <Typography level="body-sm" sx={{ mb: 1 }}>
            Aktuell modell: <strong>{loadedModel}</strong>
          </Typography>
        )}
        
        {errorMessage && (
          <Typography level="body-sm" color="danger" sx={{ mb: 1 }}>
            Fel: {errorMessage}
          </Typography>
        )}
      </Box>
      
      <Box sx={{ flex: 1, position: 'relative' }}>
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 10
            }}
          >
            <CircularProgress />
          </Box>
        )}
        
        {!loadedModel ? (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              borderRadius: 'sm',
              overflow: 'hidden',
              bgcolor: '#f5f5f5',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            }}
          >
            <Typography level="body-lg">
              Ingen 3D-modell laddad
            </Typography>
            <Typography level="body-sm">
              Ladda upp en IFC-fil för att visa den här
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              borderRadius: 'sm',
              overflow: 'hidden',
              bgcolor: '#f5f5f5',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3
            }}
          >
            <Typography level="h3" sx={{ mb: 2 }}>
              IFC-modell laddad
            </Typography>
            <Typography level="body-lg" sx={{ mb: 4, fontWeight: 'bold' }}>
              {loadedModel}
            </Typography>
            <Box sx={{ 
              width: '100%', 
              height: '300px',
              borderRadius: 'sm', 
              bgcolor: '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              mb: 3
            }}>
              <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '16px' }}>
                <path d="M1 6V22L8 18L16 22L23 18V2L16 6L8 2L1 6Z" stroke="#4287f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#e8f4ff" />
                <path d="M8 2V18" stroke="#4287f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 6V22" stroke="#4287f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <Typography level="body-md" color="neutral">
                3D-visualisering av IFC-modell
              </Typography>
            </Box>
            <Typography level="body-sm" sx={{ textAlign: 'center', maxWidth: '600px' }}>
              Detta är en förenklad visning av IFC-filen. I en fullständig implementation 
              skulle här visas en interaktiv 3D-modell med möjlighet att rotera, 
              zooma och utforska byggnadsobjektet.
            </Typography>
          </Box>
        )}
      </Box>
      
      <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} justifyContent="center">
          <Button size="sm" variant="soft" onClick={viewFront} disabled={!loadedModel || isLoading}>Fram</Button>
          <Button size="sm" variant="soft" onClick={viewTop} disabled={!loadedModel || isLoading}>Ovan</Button>
          <Button size="sm" variant="soft" onClick={viewIso} disabled={!loadedModel || isLoading}>ISO</Button>
          <Button size="sm" variant="soft" onClick={resetView} disabled={!loadedModel || isLoading}>Återställ</Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default IFCViewer;