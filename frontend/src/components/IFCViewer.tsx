import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, CircularProgress, Typography, Stack } from '@mui/joy';
import * as THREE from 'three';

/**
 * IFC-visare för att ladda och visa IFC-modeller i 3D
 * Detta är en förenklad version som använder Three.js för att visa en grundläggande 3D-scen
 */
const IFCViewer: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadedModel, setLoadedModel] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Initiera Three.js-scenen för 3D-visning
  useEffect(() => {
    // Kontrollera att container-elementet finns
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Skapa scen, kamera och renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Lägg till ljus
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);
    
    // Lägg till rutnät och koordinataxlar
    const gridHelper = new THREE.GridHelper(50, 50);
    scene.add(gridHelper);
    
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    
    // Skapa en enkel kubmodell som exemplifierar en byggnad
    const geometry = new THREE.BoxGeometry(10, 6, 8);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x4287f5,
      transparent: true,
      opacity: 0.8
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 3, 0);
    
    // Lägg till större bas för byggnaden
    const baseGeometry = new THREE.BoxGeometry(15, 1, 12);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(0, -0.5, 0);
    
    // Samla modellen i en grupp
    const buildingGroup = new THREE.Group();
    buildingGroup.add(cube);
    buildingGroup.add(base);
    
    // Lägg till en enkel IFC-liknande struktur när en modell laddas
    if (loadedModel) {
      scene.add(buildingGroup);
      
      // Låtsas att vi har en rotationskontroll
      import('three/examples/jsm/controls/OrbitControls.js').then(module => {
        const OrbitControls = module.OrbitControls;
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.target.set(0, 0, 0);
        
        // Skapa en animationsloop
        const animate = () => {
          requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };
        
        animate();
      }).catch(error => {
        console.error("Kunde inte ladda OrbitControls:", error);
        
        // Enkel rotation av modellen som fallback
        const animate = () => {
          requestAnimationFrame(animate);
          buildingGroup.rotation.y += 0.005;
          renderer.render(scene, camera);
        };
        
        animate();
      });
    } else {
      // Om ingen modell är laddad, gör en enkel rotation
      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      
      animate();
    }
    
    // Hantera fönsterändring
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Rensa upp när komponenten avmonteras
    return () => {
      window.removeEventListener('resize', handleResize);
      
      // Ta bort alla 3D-element och rensa minnet
      while(scene.children.length > 0) { 
        scene.remove(scene.children[0]); 
      }
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
  }, [loadedModel]); // Återrendera när en ny modell laddas
  
  // Vyfunktioner - simulerade
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