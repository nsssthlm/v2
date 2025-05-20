import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { IFCLoader } from 'web-ifc-three/IFCLoader';
import { Box, Typography, CircularProgress, Button, Stack } from '@mui/joy';

interface IFCViewerProps {
  file?: File | null;
  onClear?: () => void;
}

/**
 * En komponent för att visa IFC-modeller
 * Använder web-ifc-three för att faktiskt tolka och visa IFC-filer
 */
const IFCViewer: React.FC<IFCViewerProps> = ({ file, onClear }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [viewInfo, setViewInfo] = useState({ 
    rotation: { x: 0, y: 0 }, 
    zoom: 100 
  });

  // Reference för att hålla Three.js objekt
  const sceneRef = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    controls?: OrbitControls;
    ifcLoader?: IFCLoader;
    ifcModels: THREE.Object3D[];
    animationId?: number;
    size?: { width: number; height: number };
  }>({
    ifcModels: []
  });

  // Initialisera Three.js scenen
  useEffect(() => {
    if (!containerRef.current) return;
    
    try {
      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      // Spara storlek för senare användning
      sceneRef.current.size = { width, height };
      
      // Skapa scen
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xe0e0e0);
      
      // Skapa kamera
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(10, 10, 10);
      camera.lookAt(0, 0, 0);
      
      // Skapa renderer
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      
      // Lägg till renderer canvas i container
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
      
      // Skapa orbit controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controls.screenSpacePanning = true;
      
      // Lägg till ljus
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 20, 10);
      directionalLight.castShadow = true;
      scene.add(directionalLight);
      
      // Lägg till hjälpegitter
      const gridHelper = new THREE.GridHelper(50, 50);
      scene.add(gridHelper);
      
      // Skapa IFC-loader
      const ifcLoader = new IFCLoader();
      ifcLoader.ifcManager.setWasmPath('https://unpkg.com/web-ifc@0.0.36/');
      
      // Spara referenser
      sceneRef.current = {
        ...sceneRef.current,
        scene,
        camera,
        renderer,
        controls,
        ifcLoader
      };
      
      // Animation loop
      const animate = () => {
        sceneRef.current.animationId = requestAnimationFrame(animate);
        
        if (sceneRef.current.controls) {
          sceneRef.current.controls.update();
        }
        
        // Uppdatera visningsinformation
        if (sceneRef.current.camera && sceneRef.current.controls) {
          const rotation = sceneRef.current.camera.rotation;
          setViewInfo({
            rotation: { 
              x: THREE.MathUtils.radToDeg(rotation.x), 
              y: THREE.MathUtils.radToDeg(rotation.y) 
            },
            zoom: zoomLevel
          });
        }
        
        renderer.render(scene, camera);
      };
      
      animate();
      
      // Hantera storleksändring
      const handleResize = () => {
        if (!container || !sceneRef.current.camera || !sceneRef.current.renderer) return;
        
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        sceneRef.current.camera.aspect = width / height;
        sceneRef.current.camera.updateProjectionMatrix();
        sceneRef.current.renderer.setSize(width, height);
        
        // Uppdatera storlek för senare användning
        sceneRef.current.size = { width, height };
      };
      
      window.addEventListener('resize', handleResize);
      
      // Städa upp när komponenten avmonteras
      return () => {
        window.removeEventListener('resize', handleResize);
        
        if (sceneRef.current.animationId) {
          cancelAnimationFrame(sceneRef.current.animationId);
        }
        
        if (sceneRef.current.renderer && container.contains(sceneRef.current.renderer.domElement)) {
          container.removeChild(sceneRef.current.renderer.domElement);
        }
        
        if (sceneRef.current.renderer) {
          sceneRef.current.renderer.dispose();
        }
        
        // Ta bort alla IFC-modeller
        sceneRef.current.ifcModels.forEach(model => {
          scene.remove(model);
        });
        
        sceneRef.current.ifcModels = [];
      };
    } catch (err) {
      console.error('Fel vid initiering av 3D-scen:', err);
      setError('Kunde inte skapa 3D-scen. Kontrollera att din webbläsare stöder WebGL.');
    }
  }, []);
  
  // Ladda IFC-modell när en fil tillhandahålls
  useEffect(() => {
    if (!file || !sceneRef.current.scene || !sceneRef.current.ifcLoader) return;
    
    const loadIFCModel = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Rensa tidigare modeller
        sceneRef.current.ifcModels.forEach(model => {
          sceneRef.current.scene?.remove(model);
        });
        sceneRef.current.ifcModels = [];
        
        // Läs filen som en ArrayBuffer
        const buffer = await file.arrayBuffer();
        
        // Ladda IFC-modellen
        const model = await sceneRef.current.ifcLoader?.parse(new Uint8Array(buffer));
        
        if (model) {
          // Lägg till modellen i scenen
          sceneRef.current.scene?.add(model);
          sceneRef.current.ifcModels.push(model);
          
          // Centrera vyn på modellen
          centerView();
        }
      } catch (err) {
        console.error('Fel vid laddning av IFC-modell:', err);
        setError('Kunde inte läsa IFC-filen. Kontrollera att det är en giltig IFC-fil.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadIFCModel();
  }, [file]);
  
  // Centrera kameran på modellen
  const centerView = () => {
    if (
      sceneRef.current.ifcModels.length === 0 || 
      !sceneRef.current.camera || 
      !sceneRef.current.controls
    ) return;
    
    const model = sceneRef.current.ifcModels[0];
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Beräkna lämpligt kameraavstånd
    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 2;
    
    // Placera kamera och målpunkt
    sceneRef.current.camera.position.set(
      center.x + distance * 0.5,
      center.y + distance * 0.5,
      center.z + distance * 0.5
    );
    sceneRef.current.camera.lookAt(center);
    sceneRef.current.controls.target.copy(center);
  };
  
  // Funktion för att byta vy
  const setView = (viewType: 'front' | 'top' | 'side' | 'iso' | 'reset') => {
    if (
      sceneRef.current.ifcModels.length === 0 || 
      !sceneRef.current.camera || 
      !sceneRef.current.controls
    ) return;
    
    const model = sceneRef.current.ifcModels[0];
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Beräkna lämpligt kameraavstånd
    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 1.5;
    
    // Placera kameran baserat på vytyp
    switch (viewType) {
      case 'front':
        sceneRef.current.camera.position.set(center.x, center.y, center.z + distance);
        break;
      case 'top':
        sceneRef.current.camera.position.set(center.x, center.y + distance, center.z);
        break;
      case 'side':
        sceneRef.current.camera.position.set(center.x + distance, center.y, center.z);
        break;
      case 'iso':
        sceneRef.current.camera.position.set(
          center.x + distance * 0.7,
          center.y + distance * 0.7,
          center.z + distance * 0.7
        );
        break;
      case 'reset':
        centerView();
        return;
    }
    
    sceneRef.current.camera.lookAt(center);
    sceneRef.current.controls.target.copy(center);
  };
  
  // Komponenten returnerar en container för 3D-visning
  return (
    <Box 
      sx={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative', 
        overflow: 'hidden'
      }}
    >
      {/* Container för 3D-scenen */}
      <Box 
        ref={containerRef}
        sx={{ 
          width: '100%', 
          height: '100%', 
          borderRadius: 'sm',
          bgcolor: '#e0e0e0',
          position: 'relative'
        }} 
      />
      
      {/* Laddningsindikator */}
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
            bgcolor: 'rgba(255,255,255,0.7)',
            zIndex: 10
          }}
        >
          <CircularProgress size="lg" />
        </Box>
      )}
      
      {/* Felmeddelande */}
      {error && (
        <Box 
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'rgba(255,255,255,0.9)',
            p: 2,
            borderRadius: 'md',
            maxWidth: '80%',
            zIndex: 10
          }}
        >
          <Typography color="danger" level="body-lg">
            {error}
          </Typography>
        </Box>
      )}
      
      {/* Knappar för vyer */}
      <Stack 
        direction="row" 
        spacing={1} 
        sx={{ 
          position: 'absolute', 
          bottom: 16, 
          left: '50%', 
          transform: 'translateX(-50%)',
          zIndex: 10
        }}
      >
        <Button size="sm" variant="soft" onClick={() => setView('front')}>
          Fram
        </Button>
        <Button size="sm" variant="soft" onClick={() => setView('top')}>
          Ovan
        </Button>
        <Button size="sm" variant="soft" onClick={() => setView('side')}>
          Sida
        </Button>
        <Button size="sm" variant="soft" onClick={() => setView('iso')}>
          ISO
        </Button>
        <Button size="sm" variant="soft" onClick={() => setView('reset')}>
          Återställ
        </Button>
      </Stack>
      
      {/* Visningsinformation */}
      {sceneRef.current.ifcModels.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 60,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'rgba(0,0,0,0.6)',
            color: 'white',
            px: 2,
            py: 0.5,
            borderRadius: 'sm',
            fontSize: '0.8rem',
            zIndex: 10,
            pointerEvents: 'none'
          }}
        >
          Rotation X: {Math.round(viewInfo.rotation.x)}° Y: {Math.round(viewInfo.rotation.y)}° | Zoom: {viewInfo.zoom}%
        </Box>
      )}
    </Box>
  );
};

export default IFCViewer;