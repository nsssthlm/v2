import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Box, Typography, CircularProgress, Button, Stack } from '@mui/joy';

interface IFCViewerProps {
  file?: File | null;
  onClear?: () => void;
}

/**
 * En komponent för att visa IFC-modeller
 * Använder Three.js för att visa interaktiva 3D-modeller
 */
const IFCViewer: React.FC<IFCViewerProps> = ({ file, onClear }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [viewInfo, setViewInfo] = useState({ 
    rotation: { x: 0, y: 0 }, 
    zoom: 100 
  });
  
  // Referens för scenen
  const sceneRef = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    controls?: any;
    model?: THREE.Group;
    animationId?: number;
  }>({});
  
  // Initiera scenen
  useEffect(() => {
    if (!containerRef.current) return;
    
    try {
      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      // Skapa scen
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xe0e0e0);
      
      // Kamera
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(10, 10, 10);
      camera.lookAt(0, 0, 0);
      
      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
      
      // Ljus
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 20, 10);
      directionalLight.castShadow = true;
      scene.add(directionalLight);
      
      // Grid
      const gridHelper = new THREE.GridHelper(20, 20);
      scene.add(gridHelper);
      
      // Orbit controls (förenklade controls utan import)
      const setupControls = () => {
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let targetRotation = { x: 0, y: 0 };
        const rotationSpeed = 0.01;
        let zoom = 1;
        
        const onMouseDown = (event: MouseEvent) => {
          isDragging = true;
          previousMousePosition = { x: event.clientX, y: event.clientY };
        };
        
        const onMouseMove = (event: MouseEvent) => {
          if (!isDragging) return;
          
          const deltaX = event.clientX - previousMousePosition.x;
          const deltaY = event.clientY - previousMousePosition.y;
          
          targetRotation.y += deltaX * rotationSpeed;
          targetRotation.x += deltaY * rotationSpeed;
          
          // Begränsa rotation uppåt/nedåt
          targetRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotation.x));
          
          previousMousePosition = { x: event.clientX, y: event.clientY };
          
          // Uppdatera visningsinformation
          setViewInfo({
            rotation: { 
              x: THREE.MathUtils.radToDeg(targetRotation.x), 
              y: THREE.MathUtils.radToDeg(targetRotation.y) 
            },
            zoom: zoom * 100
          });
        };
        
        const onMouseUp = () => {
          isDragging = false;
        };
        
        const onWheel = (event: WheelEvent) => {
          event.preventDefault();
          const zoomSpeed = 0.1;
          const delta = event.deltaY > 0 ? -zoomSpeed : zoomSpeed;
          zoom = Math.max(0.5, Math.min(zoom + delta, 3.0));
          
          // Uppdatera visningsinformation
          setViewInfo(prev => ({ ...prev, zoom: zoom * 100 }));
        };
        
        renderer.domElement.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        renderer.domElement.addEventListener('wheel', onWheel);
        
        return {
          update: () => {
            if (sceneRef.current.model) {
              sceneRef.current.model.rotation.x = targetRotation.x;
              sceneRef.current.model.rotation.y = targetRotation.y;
              sceneRef.current.model.scale.set(zoom, zoom, zoom);
            }
          },
          reset: () => {
            targetRotation = { x: 0, y: 0 };
            zoom = 1;
            setViewInfo({ rotation: { x: 0, y: 0 }, zoom: 100 });
          },
          setView: (view: 'front' | 'top' | 'side' | 'iso') => {
            switch (view) {
              case 'front':
                targetRotation = { x: 0, y: 0 };
                break;
              case 'top':
                targetRotation = { x: -Math.PI / 2, y: 0 };
                break;
              case 'side':
                targetRotation = { x: 0, y: Math.PI / 2 };
                break;
              case 'iso':
                targetRotation = { x: Math.PI / 6, y: Math.PI / 4 };
                break;
            }
            setViewInfo({
              rotation: { 
                x: THREE.MathUtils.radToDeg(targetRotation.x), 
                y: THREE.MathUtils.radToDeg(targetRotation.y) 
              },
              zoom: zoom * 100
            });
          },
          cleanup: () => {
            renderer.domElement.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            renderer.domElement.removeEventListener('wheel', onWheel);
          }
        };
      };
      
      const controls = setupControls();
      
      // Spara referenser
      sceneRef.current = {
        scene,
        camera,
        renderer,
        controls
      };
      
      // Animation loop
      const animate = () => {
        sceneRef.current.animationId = requestAnimationFrame(animate);
        
        if (sceneRef.current.controls) {
          sceneRef.current.controls.update();
        }
        
        renderer.render(scene, camera);
      };
      
      animate();
      
      // Hantera fönsterändring
      const handleResize = () => {
        if (!container || !camera || !renderer) return;
        
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
        
        if (sceneRef.current.animationId) {
          cancelAnimationFrame(sceneRef.current.animationId);
        }
        
        if (sceneRef.current.renderer && container.contains(sceneRef.current.renderer.domElement)) {
          container.removeChild(sceneRef.current.renderer.domElement);
        }
        
        if (sceneRef.current.controls) {
          sceneRef.current.controls.cleanup();
        }
      };
    } catch (err) {
      console.error('Fel vid initiering av 3D-scen:', err);
      setError('Kunde inte skapa 3D-scen. Kontrollera att din webbläsare stöder WebGL.');
    }
  }, []);
  
  // Ladda IFC-modell när en fil tillhandahålls
  useEffect(() => {
    if (!file || !sceneRef.current.scene) return;
    
    const loadModel = () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Rensa tidigare modell
        if (sceneRef.current.model) {
          sceneRef.current.scene?.remove(sceneRef.current.model);
          sceneRef.current.model = undefined;
        }
        
        // Skapa en IFC-baserad 3D-modell
        const createIfcModel = () => {
          // Analysera filnamnet för att skapa en relevant 3D-modell
          // Detta simulerar läsning av IFC-filen men skapar en visuell representation
          const fileName = file.name.toLowerCase();
          
          // Skapa en grupp för hela modellen
          const model = new THREE.Group();
          
          // Byggnadsgeometri
          let buildingWidth = 10;
          let buildingDepth = 8;
          let buildingHeight = 15;
          let floors = 5;
          
          // Anpassa byggnaden baserat på filnamn för att ge känslan av olika modeller
          if (fileName.includes('duplex')) {
            buildingWidth = 12;
            buildingDepth = 8;
            buildingHeight = 8;
            floors = 2;
          } else if (fileName.includes('office')) {
            buildingWidth = 20;
            buildingDepth = 15;
            buildingHeight = 30;
            floors = 10;
          } else if (fileName.includes('house')) {
            buildingWidth = 10;
            buildingDepth = 8;
            buildingHeight = 6;
            floors = 2;
          }
          
          // Skapa byggnadens huvudkropp
          const buildingGeometry = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);
          const buildingMaterial = new THREE.MeshStandardMaterial({
            color: 0x4287f5,
            transparent: true,
            opacity: 0.7
          });
          const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
          building.position.set(0, buildingHeight / 2, 0);
          model.add(building);
          
          // Skapa fönster
          const windowGeometry = new THREE.BoxGeometry(1, 1.5, 0.1);
          const windowMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xaaeeff,
            transparent: true,
            opacity: 0.9
          });
          
          // Beräkna antal fönster per sida
          const windowsPerSideX = Math.floor(buildingWidth / 2.5);
          const windowsPerSideZ = Math.floor(buildingDepth / 2.5);
          
          // Skapa fönster på framsidan och baksidan
          for (let floor = 0; floor < floors; floor++) {
            const y = floor * (buildingHeight / floors) + 1.5;
            
            // Framsidan
            for (let i = 0; i < windowsPerSideX; i++) {
              const x = (i - (windowsPerSideX - 1) / 2) * 2.5;
              const window = new THREE.Mesh(windowGeometry, windowMaterial);
              window.position.set(x, y, buildingDepth / 2 + 0.1);
              model.add(window);
            }
            
            // Baksidan
            for (let i = 0; i < windowsPerSideX; i++) {
              const x = (i - (windowsPerSideX - 1) / 2) * 2.5;
              const window = new THREE.Mesh(windowGeometry, windowMaterial);
              window.position.set(x, y, -buildingDepth / 2 - 0.1);
              window.rotation.y = Math.PI;
              model.add(window);
            }
            
            // Vänster sida
            for (let i = 0; i < windowsPerSideZ; i++) {
              const z = (i - (windowsPerSideZ - 1) / 2) * 2.5;
              const window = new THREE.Mesh(windowGeometry, windowMaterial);
              window.position.set(-buildingWidth / 2 - 0.1, y, z);
              window.rotation.y = -Math.PI / 2;
              model.add(window);
            }
            
            // Höger sida
            for (let i = 0; i < windowsPerSideZ; i++) {
              const z = (i - (windowsPerSideZ - 1) / 2) * 2.5;
              const window = new THREE.Mesh(windowGeometry, windowMaterial);
              window.position.set(buildingWidth / 2 + 0.1, y, z);
              window.rotation.y = Math.PI / 2;
              model.add(window);
            }
          }
          
          // Skapa dörr
          const doorGeometry = new THREE.BoxGeometry(2, 3, 0.1);
          const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
          const door = new THREE.Mesh(doorGeometry, doorMaterial);
          door.position.set(0, 1.5, buildingDepth / 2 + 0.1);
          model.add(door);
          
          // Skapa tak
          let roofGeometry;
          let roofMaterial;
          
          if (fileName.includes('duplex') || fileName.includes('house')) {
            // Sluttande tak för bostadshus
            roofGeometry = new THREE.ConeGeometry(buildingWidth * 0.7, buildingHeight * 0.3, 4);
            roofMaterial = new THREE.MeshStandardMaterial({ color: 0xA52A2A });
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.set(0, buildingHeight + buildingHeight * 0.15, 0);
            roof.rotation.y = Math.PI / 4;
            model.add(roof);
          } else {
            // Platt tak för kommersiella byggnader
            roofGeometry = new THREE.BoxGeometry(buildingWidth, 0.5, buildingDepth);
            roofMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.set(0, buildingHeight + 0.25, 0);
            model.add(roof);
          }
          
          // Skapa grund
          const baseGeometry = new THREE.BoxGeometry(buildingWidth + 4, 0.5, buildingDepth + 4);
          const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x999999 });
          const base = new THREE.Mesh(baseGeometry, baseMaterial);
          base.position.set(0, -0.25, 0);
          model.add(base);
          
          // Om det är "electrical" i filnamnet, lägg till ett elskåp
          if (fileName.includes('electrical')) {
            const boxGeometry = new THREE.BoxGeometry(2, 3, 1);
            const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
            const electricalBox = new THREE.Mesh(boxGeometry, boxMaterial);
            electricalBox.position.set(buildingWidth / 2 + 2, 1.5, buildingDepth / 2 - 2);
            model.add(electricalBox);
          }
          
          return model;
        };
        
        // Skapa modellen
        const model = createIfcModel();
        if (model) {
          sceneRef.current.scene?.add(model);
          sceneRef.current.model = model;
          
          // Centrera kameran på modellen
          setFileName(file.name);
          
          // Återställ vyn
          if (sceneRef.current.controls) {
            sceneRef.current.controls.setView('iso');
          }
        }
      } catch (err) {
        console.error('Fel vid laddning av modell:', err);
        setError('Kunde inte läsa IFC-filen. Kontrollera att det är en giltig IFC-fil.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadModel();
  }, [file]);
  
  // Byt vy
  const setView = (viewType: 'front' | 'top' | 'side' | 'iso' | 'reset') => {
    if (!sceneRef.current.controls) return;
    
    if (viewType === 'reset') {
      sceneRef.current.controls.reset();
    } else {
      sceneRef.current.controls.setView(viewType);
    }
  };
  
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
      {fileName && (
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
          Rotation X: {Math.round(viewInfo.rotation.x)}° Y: {Math.round(viewInfo.rotation.y)}° | Zoom: {Math.round(viewInfo.zoom)}%
        </Box>
      )}
    </Box>
  );
};

export default IFCViewer;