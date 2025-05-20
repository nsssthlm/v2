import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Box, Button, Card, CircularProgress, Grid, Typography, Stack } from '@mui/joy';
import { IFCLoader } from 'web-ifc-three/IFCLoader';

// Vi behöver importera OrbitControls dynamiskt för att undvika typdeklarationsproblem
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// 3D-visare för IFC-filer
const IFCViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedModel, setLoadedModel] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Referens för att hålla reda på scen-objekt
  const sceneRef = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    controls?: OrbitControls;
    ifcLoader?: IFCLoader;
    animationFrame?: number;
    ifcModels: THREE.Object3D[];
  }>({
    ifcModels: []
  });
  
  // Skapa scenen när komponenten monteras
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    
    // Skapa renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xf5f5f5); // Ljusgrå bakgrund
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    // Skapa scen
    const scene = new THREE.Scene();
    
    // Ljussättning
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);
    
    // Kamera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(15, 10, 15);
    camera.lookAt(0, 0, 0);
    
    // Skapa IFC-loader
    const ifcLoader = new IFCLoader();
    // Sätt WASM path till en version som matchar vår Three.js version
    ifcLoader.ifcManager.setWasmPath('https://unpkg.com/web-ifc@0.0.36/');
    
    // Skapa OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.target.set(0, 0, 0);
    
    // Grid helper för att visa ett rutnät
    const gridHelper = new THREE.GridHelper(50, 50);
    scene.add(gridHelper);
    
    // Skapa axel-hjälpmedel
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    
    // Animation loop
    const animate = () => {
      sceneRef.current.animationFrame = requestAnimationFrame(animate);
      
      if (sceneRef.current.controls) {
        sceneRef.current.controls.update();
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Hantera fönsterändring
    const handleResize = () => {
      if (!camera || !renderer || !container) return;
      
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Spara referens till scen-objekten
    sceneRef.current = {
      scene,
      camera,
      renderer,
      controls,
      ifcLoader,
      ifcModels: [],
      animationFrame: sceneRef.current.animationFrame
    };
    
    // Cleanup när komponenten unmountas
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (sceneRef.current.animationFrame) {
        cancelAnimationFrame(sceneRef.current.animationFrame);
      }
      
      // Rensa alla IFC-modeller
      sceneRef.current.ifcModels.forEach(model => {
        scene.remove(model);
      });
      
      if (sceneRef.current.renderer && container.contains(sceneRef.current.renderer.domElement)) {
        container.removeChild(sceneRef.current.renderer.domElement);
      }
      
      if (sceneRef.current.renderer) {
        sceneRef.current.renderer.dispose();
      }
    };
  }, []);
  
  // Rensa scenen från nuvarande modeller
  const clearScene = () => {
    if (!sceneRef.current.scene) return;
    
    // Ta bort tidigare IFC-modeller
    sceneRef.current.ifcModels.forEach(model => {
      sceneRef.current.scene?.remove(model);
    });
    sceneRef.current.ifcModels = [];
    
    setLoadedModel(null);
  };
  
  // Centrera kameran på en modell
  const centerCamera = (model: THREE.Object3D) => {
    if (!sceneRef.current.camera || !sceneRef.current.controls) return;
    
    // Beräkna modellens boundingbox
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Bestäm kameraavstånd baserat på modellens storlek
    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 2;
    
    // Placera kameran
    const camera = sceneRef.current.camera;
    camera.position.set(center.x + distance, center.y + distance, center.z + distance);
    camera.lookAt(center);
    
    // Uppdatera orbit controls
    if (sceneRef.current.controls) {
      sceneRef.current.controls.target.copy(center);
    }
  };
  
  // Vyfunktioner
  const viewFront = () => {
    if (!sceneRef.current.camera || !sceneRef.current.controls || !sceneRef.current.scene) return;
    
    const camera = sceneRef.current.camera;
    // Hitta centrum av scenen
    const box = new THREE.Box3().setFromObject(sceneRef.current.scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Placera kameran framför objektet
    camera.position.set(center.x, center.y, center.z + size.z * 1.5);
    camera.lookAt(center);
    
    // Uppdatera kontrollen
    if (sceneRef.current.controls) {
      sceneRef.current.controls.target.copy(center);
    }
  };
  
  const viewTop = () => {
    if (!sceneRef.current.camera || !sceneRef.current.controls || !sceneRef.current.scene) return;
    
    const camera = sceneRef.current.camera;
    // Hitta centrum av scenen
    const box = new THREE.Box3().setFromObject(sceneRef.current.scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Placera kameran ovanför objektet
    camera.position.set(center.x, center.y + size.y * 1.5, center.z);
    camera.lookAt(center);
    
    // Uppdatera kontrollen
    if (sceneRef.current.controls) {
      sceneRef.current.controls.target.copy(center);
    }
  };
  
  const viewIso = () => {
    if (!sceneRef.current.camera || !sceneRef.current.controls || !sceneRef.current.scene) return;
    
    const camera = sceneRef.current.camera;
    // Hitta centrum av scenen
    const box = new THREE.Box3().setFromObject(sceneRef.current.scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Placera kameran i iso-vy
    const maxDim = Math.max(size.x, size.y, size.z);
    camera.position.set(
      center.x + maxDim, 
      center.y + maxDim, 
      center.z + maxDim
    );
    camera.lookAt(center);
    
    // Uppdatera kontrollen
    if (sceneRef.current.controls) {
      sceneRef.current.controls.target.copy(center);
    }
  };
  
  const resetView = () => {
    if (!sceneRef.current.camera || !sceneRef.current.controls || !sceneRef.current.scene) return;
    
    const camera = sceneRef.current.camera;
    // Hitta centrum av scenen
    const box = new THREE.Box3().setFromObject(sceneRef.current.scene);
    const center = box.getCenter(new THREE.Vector3());
    
    // Återställ kameran till startpositionen
    camera.position.set(15, 10, 15);
    camera.lookAt(center);
    
    // Uppdatera kontrollen
    if (sceneRef.current.controls) {
      sceneRef.current.controls.target.copy(center);
    }
  };
  
  // Hantera filen när den laddas upp
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    
    // Kontrollera om det är en IFC-fil
    if (!file.name.toLowerCase().endsWith('.ifc')) {
      setErrorMessage('Endast IFC-filer stöds');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Rensa scenen först
      clearScene();
      
      if (!sceneRef.current.ifcLoader || !sceneRef.current.scene) {
        throw new Error('3D-renderaren är inte initierad');
      }
      
      // Läs filen som en ArrayBuffer
      const buffer = await file.arrayBuffer();
      
      // Ladda IFC-modellen
      const ifcLoader = sceneRef.current.ifcLoader;
      const model = await ifcLoader.parse(buffer);
      
      // Lägg till modellen i scenen
      sceneRef.current.scene.add(model);
      sceneRef.current.ifcModels.push(model);
      
      // Centrera kameran på modellen
      centerCamera(model);
      
      setLoadedModel(file.name);
    } catch (error) {
      console.error('Fel vid laddning av IFC-fil:', error);
      setErrorMessage(`Kunde inte ladda IFC-filen: ${error instanceof Error ? error.message : 'Okänt fel'}`);
    } finally {
      setIsLoading(false);
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
            onClick={clearScene}
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
            overflow: 'hidden'
          }}
        />
      </Box>
      
      <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} justifyContent="center">
          <Button size="sm" variant="soft" onClick={viewFront}>Fram</Button>
          <Button size="sm" variant="soft" onClick={viewTop}>Ovan</Button>
          <Button size="sm" variant="soft" onClick={viewIso}>ISO</Button>
          <Button size="sm" variant="soft" onClick={resetView}>Återställ</Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default IFCViewer;