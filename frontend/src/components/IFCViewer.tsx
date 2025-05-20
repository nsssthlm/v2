import React, { useState, useRef } from 'react';
import { Box, Button, CircularProgress, Typography, Stack } from '@mui/joy';

/**
 * En förenklad IFC-visningskomponent som visar ett gränssnitt för att ladda upp IFC-filer
 * Denna version fokuserar på användargränssnittet och förbereder för framtida 3D-rendering
 */
const IFCViewer: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadedModel, setLoadedModel] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#f5f5f5',
              color: '#666',
              flexDirection: 'column',
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
            ref={containerRef}
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
            <Typography level="body-sm" sx={{ textAlign: 'center', maxWidth: '600px' }}>
              Detta är en förenklad förhandsvisning av IFC-modellfunktionen. 
              I en fullständig implementation skulle 3D-rendering av modellen visas här,
              med möjlighet att rotera, zooma och interagera med modellens komponenter.
            </Typography>
          </Box>
        )}
      </Box>
      
      <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} justifyContent="center">
          <Button size="sm" variant="soft" disabled={!loadedModel}>Fram</Button>
          <Button size="sm" variant="soft" disabled={!loadedModel}>Ovan</Button>
          <Button size="sm" variant="soft" disabled={!loadedModel}>ISO</Button>
          <Button size="sm" variant="soft" disabled={!loadedModel}>Återställ</Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default IFCViewer;