import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, CircularProgress, Typography, Stack } from '@mui/joy';
import * as THREE from 'three';

/**
 * IFC-visare för att ladda och visa IFC-modeller i 3D
 * Använder Three.js för att visa 3D-modeller med zoom- och rotationsmöjligheter
 */
const IFCViewer: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadedModel, setLoadedModel] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Initiera 3D-scenen när en modell har laddats
  useEffect(() => {
    // Om vi inte har en container eller om det inte finns en laddad modell, avsluta
    if (!containerRef.current || !loadedModel) return;
    
    // Rensa event-hanterare från tidigare körningar
    const cleanupEventHandlers: (() => void)[] = [];
    
    try {
      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      // Skapa scenen
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf5f5f5);
      
      // Skapa kameran
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(10, 10, 10);
      camera.lookAt(0, 0, 0);
      
      // Skapa renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
      
      // Lägg till ljus
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 20, 10);
      scene.add(directionalLight);
      
      // Lägg till grid för orientering
      const gridHelper = new THREE.GridHelper(20, 20);
      scene.add(gridHelper);
      
      // Skapa en enkel byggnad som representerar en IFC-modell
      const buildingGeometry = new THREE.BoxGeometry(8, 12, 6);
      const buildingMaterial = new THREE.MeshStandardMaterial({
        color: 0x4287f5,
        transparent: true,
        opacity: 0.7
      });
      const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
      building.position.set(0, 6, 0);
      
      // Skapa basen
      const baseGeometry = new THREE.BoxGeometry(12, 1, 8);
      const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.set(0, 0, 0);
      
      // Skapa ett tak
      const roofGeometry = new THREE.ConeGeometry(6, 4, 4);
      const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x883333 });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.set(0, 14, 0);
      roof.rotation.y = Math.PI / 4;
      
      // Lägg till allt i scenen
      scene.add(building, base, roof);
      
      // Variabler för interaktion
      let isDragging = false;
      let previousMousePosition = { x: 0, y: 0 };
      let animationId: number;
      
      // Skapa animationsloopen
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        
        // Om vi inte drar med musen, rotera automatiskt
        if (!isDragging) {
          building.rotation.y += 0.005;
          roof.rotation.y += 0.005;
        }
        
        renderer.render(scene, camera);
      };
      
      animate();
      
      // Mushanterare för rotation
      const handleMouseDown = (event: MouseEvent) => {
        isDragging = true;
        previousMousePosition = {
          x: event.clientX,
          y: event.clientY
        };
      };
      
      const handleMouseMove = (event: MouseEvent) => {
        if (!isDragging) return;
        
        const deltaMove = {
          x: event.clientX - previousMousePosition.x,
          y: event.clientY - previousMousePosition.y
        };
        
        // Rotera modellen
        building.rotation.y += deltaMove.x * 0.005;
        roof.rotation.y += deltaMove.x * 0.005;
        
        previousMousePosition = {
          x: event.clientX,
          y: event.clientY
        };
      };
      
      const handleMouseUp = () => {
        isDragging = false;
      };
      
      // Hantera zoom med mushjul
      const handleWheel = (event: WheelEvent) => {
        const zoomSpeed = 0.1;
        const delta = event.deltaY > 0 ? 1 : -1; // Positiv delta = zooma ut
        
        // Normalisera kameravektorn och justera längden (zooma)
        const currentDistance = camera.position.length();
        const newDistance = currentDistance + delta * zoomSpeed;
        
        // Begränsa zoom (min och max avstånd)
        if (newDistance > 5 && newDistance < 30) {
          camera.position.normalize();
          camera.position.multiplyScalar(newDistance);
        }
      };
      
      // Hantera fönsterstorlek
      const handleResize = () => {
        if (!containerRef.current) return;
        
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };
      
      // Lägg till event-lyssnare
      renderer.domElement.addEventListener('mousedown', handleMouseDown);
      renderer.domElement.addEventListener('mousemove', handleMouseMove);
      renderer.domElement.addEventListener('mouseup', handleMouseUp);
      renderer.domElement.addEventListener('wheel', handleWheel);
      window.addEventListener('resize', handleResize);
      
      // Spara cleanup-funktioner
      cleanupEventHandlers.push(() => {
        renderer.domElement.removeEventListener('mousedown', handleMouseDown);
        renderer.domElement.removeEventListener('mousemove', handleMouseMove);
        renderer.domElement.removeEventListener('mouseup', handleMouseUp);
        renderer.domElement.removeEventListener('wheel', handleWheel);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationId);
      });
      
      // Spara referenser för vykontroller
      const viewFrontBtn = document.getElementById('view-front');
      const viewTopBtn = document.getElementById('view-top');
      const viewIsoBtn = document.getElementById('view-iso');
      const resetViewBtn = document.getElementById('reset-view');
      
      if (viewFrontBtn) {
        viewFrontBtn.onclick = () => {
          camera.position.set(0, 6, 20);
          camera.lookAt(0, 6, 0);
        };
      }
      
      if (viewTopBtn) {
        viewTopBtn.onclick = () => {
          camera.position.set(0, 25, 0);
          camera.lookAt(0, 6, 0);
        };
      }
      
      if (viewIsoBtn) {
        viewIsoBtn.onclick = () => {
          camera.position.set(15, 15, 15);
          camera.lookAt(0, 6, 0);
        };
      }
      
      if (resetViewBtn) {
        resetViewBtn.onclick = () => {
          camera.position.set(10, 10, 10);
          camera.lookAt(0, 0, 0);
          building.rotation.set(0, 0, 0);
          roof.rotation.set(0, Math.PI / 4, 0);
        };
      }
    } catch (error) {
      console.error('Fel vid initiering av 3D-scen:', error);
      setErrorMessage('Fel vid initiering av 3D-visare');
    }
    
    // Rensa upp vid komponentavmontering
    return () => {
      cleanupEventHandlers.forEach(cleanup => cleanup());
      
      // Rensa containern
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [loadedModel]);
  
  // Hantera filuppladdning
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    
    // Kontrollera filtyp
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
    }, 1000);
  };
  
  // Rensa modell
  const clearModel = () => {
    setLoadedModel(null);
    setErrorMessage(null);
    
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
          <Button id="view-front" size="sm" variant="soft" disabled={!loadedModel || isLoading}>Fram</Button>
          <Button id="view-top" size="sm" variant="soft" disabled={!loadedModel || isLoading}>Ovan</Button>
          <Button id="view-iso" size="sm" variant="soft" disabled={!loadedModel || isLoading}>ISO</Button>
          <Button id="reset-view" size="sm" variant="soft" disabled={!loadedModel || isLoading}>Återställ</Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default IFCViewer;