import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, CircularProgress, Typography, Stack } from '@mui/joy';
import * as THREE from 'three';

/**
 * IFC-visare för att ladda och visa IFC-modeller i 3D
 * Använder Three.js för att visa 3D-modeller
 */
const IFCViewer: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadedModel, setLoadedModel] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Skapa en Three.js-scen med en byggnad som representerar en 3D-modell
  useEffect(() => {
    // Om vi inte har en container eller om det inte finns en laddad modell, avsluta
    if (!containerRef.current || !loadedModel) return;
    
    // Hämta container-elementet och beräkna dimensioner
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Skapa en Three.js-scen
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    // Skapa en kamera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 15, 15);
    camera.lookAt(0, 0, 0);
    
    // Skapa en renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.innerHTML = ''; // Rensa containern
    container.appendChild(renderer.domElement);
    
    // Skapa ljus i scenen
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);
    
    // Lägg till grid för orientering
    const gridHelper = new THREE.GridHelper(20, 20);
    scene.add(gridHelper);
    
    // Lägg till axlar för orientering (X=röd, Y=grön, Z=blå)
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    
    // Skapa en enkel byggnad för att representera IFC-modellen
    
    // Skapa huvudbyggnaden
    const buildingGeometry = new THREE.BoxGeometry(8, 12, 6);
    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: 0x4287f5,
      transparent: true,
      opacity: 0.7
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.set(0, 6, 0);
    
    // Skapa basen för byggnaden
    const baseGeometry = new THREE.BoxGeometry(12, 1, 8);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(0, 0, 0);
    
    // Skapa fönster
    const windowMaterial = new THREE.MeshStandardMaterial({ color: 0xaaeeff });
    const windowGeometry = new THREE.BoxGeometry(0.5, 1, 0.1);
    
    // Framsida
    const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
    window1.position.set(4.1, 5, 0);
    scene.add(window1);
    
    // Baksida
    const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
    window2.position.set(-4.1, 5, 0);
    scene.add(window2);
    
    // Vänster sida
    const window3 = new THREE.Mesh(windowGeometry, windowMaterial);
    window3.rotation.y = Math.PI / 2;
    window3.position.set(0, 5, 3.1);
    scene.add(window3);
    
    // Höger sida
    const window4 = new THREE.Mesh(windowGeometry, windowMaterial);
    window4.rotation.y = Math.PI / 2;
    window4.position.set(0, 5, -3.1);
    scene.add(window4);
    
    // Skapa tak
    const roofGeometry = new THREE.ConeGeometry(6, 4, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x883333 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(0, 14, 0);
    roof.rotation.y = Math.PI / 4;
    
    // Lägg till alla delar till scenen
    scene.add(building, base, roof);
    
    // Skapa animationsloopen
    let animationId: number;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // Rotera byggnaden långsamt
      building.rotation.y += 0.005;
      roof.rotation.y += 0.005;
      
      // Rendera scenen
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Hantera fönsterändring
    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Städa upp när komponenten avmonteras
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [loadedModel]); // Kör om effekten när loadedModel ändras
  
  // Vyfunktioner (simulerade i denna version)
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
    console.log('Återställer kameravyn');
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
    
    // I en verklig implementation skulle vi här processa IFC-filen
    // För nu simulerar vi bara filbearbetning
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
            ref={containerRef}
            sx={{
              width: '100%',
              height: '100%',
              borderRadius: 'sm',
              overflow: 'hidden',
              bgcolor: '#f5f5f5'
            }}
          />
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