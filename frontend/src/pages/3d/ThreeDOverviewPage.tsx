import React, { useState } from 'react';
import { Box, Typography, Button, Stack } from '@mui/joy';

/**
 * ThreeDOverviewPage - Sida för 3D-översikt
 * En förenklad version utan beroende av externa bibliotek
 */
const ThreeDOverviewPage: React.FC = () => {
  const [loadedModel, setLoadedModel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Simulerad filuppladdning
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    if (!file.name.toLowerCase().endsWith('.ifc')) {
      alert('Endast IFC-filer stöds.');
      return;
    }
    
    setIsLoading(true);
    
    // Simulera filbearbetning
    setTimeout(() => {
      setLoadedModel(file.name);
      setIsLoading(false);
    }, 1000);
  };
  
  // Rensa modell
  const clearModel = () => {
    setLoadedModel(null);
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
        </Box>
        
        <Box sx={{ flex: 1, position: 'relative' }}>
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
              
              {/* Simulerad 3D-modell med SVG */}
              <Box sx={{ 
                width: '100%', 
                maxWidth: '600px',
                height: '300px',
                borderRadius: 'sm', 
                bgcolor: '#e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                mb: 3,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'spin 15s linear infinite'
                }}>
                  {/* 3D-byggnad (frontvy) */}
                  <svg width="150" height="150" viewBox="0 0 100 100">
                    {/* Byggnadens bas */}
                    <rect x="20" y="70" width="60" height="10" fill="#555555" />
                    
                    {/* Huvudbyggnad */}
                    <rect x="25" y="30" width="50" height="40" fill="#4287f5" fillOpacity="0.7" />
                    
                    {/* Tak */}
                    <polygon points="25,30 75,30 50,10" fill="#883333" />
                    
                    {/* Fönster */}
                    <rect x="30" y="35" width="10" height="10" fill="#aaeeff" />
                    <rect x="60" y="35" width="10" height="10" fill="#aaeeff" />
                    <rect x="30" y="50" width="10" height="10" fill="#aaeeff" />
                    <rect x="60" y="50" width="10" height="10" fill="#aaeeff" />
                    
                    {/* Dörr */}
                    <rect x="45" y="55" width="10" height="15" fill="#774422" />
                  </svg>
                </div>
                
                <style>{`
                  @keyframes spin {
                    0% { transform: rotateY(0deg); }
                    100% { transform: rotateY(360deg); }
                  }
                `}</style>
              </Box>
              
              <Typography level="body-sm" sx={{ textAlign: 'center', maxWidth: '600px' }}>
                Detta är en simulerad visning av IFC-filen. I en fullständig implementation 
                skulle här visas en interaktiv 3D-modell med möjlighet att rotera, 
                zooma och utforska byggnadsobjektet med Three.js.
              </Typography>
            </Box>
          )}
        </Box>
        
        <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" spacing={1} justifyContent="center">
            <Button size="sm" variant="soft" disabled={!loadedModel || isLoading}>
              Fram
            </Button>
            <Button size="sm" variant="soft" disabled={!loadedModel || isLoading}>
              Ovan
            </Button>
            <Button size="sm" variant="soft" disabled={!loadedModel || isLoading}>
              ISO
            </Button>
            <Button size="sm" variant="soft" disabled={!loadedModel || isLoading}>
              Återställ
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default ThreeDOverviewPage;