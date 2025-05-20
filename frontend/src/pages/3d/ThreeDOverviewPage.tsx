import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, Stack, CircularProgress } from '@mui/joy';
import * as THREE from 'three';

/**
 * ThreeDOverviewPage - Sida för 3D-översikt
 * En enkel 3D-visare som visar en byggnad baserad på IFC-filens namn
 */
const ThreeDOverviewPage: React.FC = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewInfo, setViewInfo] = useState({ rotation: { x: 0, y: 0 }, zoom: 100 });
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Referens för scenen
  const sceneRef = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    model?: THREE.Group;
    animationId?: number;
    isDragging?: boolean;
    previousMousePosition?: { x: number; y: number };
    targetRotation?: { x: number; y: number };
    zoom?: number;
  }>({
    isDragging: false,
    previousMousePosition: { x: 0, y: 0 },
    targetRotation: { x: 0, y: 0 },
    zoom: 1
  });
  
  // Initiera Three.js scenen
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
      camera.position.set(15, 15, 15);
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
      scene.add(directionalLight);
      
      // Grid
      const gridHelper = new THREE.GridHelper(20, 20);
      scene.add(gridHelper);
      
      // Mushantering
      const onMouseDown = (event: MouseEvent) => {
        sceneRef.current.isDragging = true;
        sceneRef.current.previousMousePosition = { x: event.clientX, y: event.clientY };
      };
      
      const onMouseMove = (event: MouseEvent) => {
        if (!sceneRef.current.isDragging) return;
        
        const deltaX = event.clientX - sceneRef.current.previousMousePosition!.x;
        const deltaY = event.clientY - sceneRef.current.previousMousePosition!.y;
        
        sceneRef.current.targetRotation = {
          x: sceneRef.current.targetRotation!.x + deltaY * 0.01,
          y: sceneRef.current.targetRotation!.y + deltaX * 0.01
        };
        
        // Begränsa rotation uppåt/nedåt
        sceneRef.current.targetRotation!.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, sceneRef.current.targetRotation!.x));
        
        sceneRef.current.previousMousePosition = { x: event.clientX, y: event.clientY };
        
        // Uppdatera visningsinformation
        setViewInfo({
          rotation: { 
            x: THREE.MathUtils.radToDeg(sceneRef.current.targetRotation!.x), 
            y: THREE.MathUtils.radToDeg(sceneRef.current.targetRotation!.y) 
          },
          zoom: sceneRef.current.zoom! * 100
        });
      };
      
      const onMouseUp = () => {
        sceneRef.current.isDragging = false;
      };
      
      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        const zoomSpeed = 0.1;
        const delta = event.deltaY > 0 ? -zoomSpeed : zoomSpeed;
        sceneRef.current.zoom = Math.max(0.5, Math.min(sceneRef.current.zoom! + delta, 3.0));
        
        // Uppdatera visningsinformation
        setViewInfo(prev => ({ ...prev, zoom: sceneRef.current.zoom! * 100 }));
      };
      
      renderer.domElement.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      renderer.domElement.addEventListener('wheel', onWheel);
      
      // Spara referenser
      sceneRef.current = {
        ...sceneRef.current,
        scene,
        camera,
        renderer
      };
      
      // Animation loop
      const animate = () => {
        sceneRef.current.animationId = requestAnimationFrame(animate);
        
        if (sceneRef.current.model) {
          sceneRef.current.model.rotation.x = sceneRef.current.targetRotation!.x;
          sceneRef.current.model.rotation.y = sceneRef.current.targetRotation!.y;
          sceneRef.current.model.scale.set(
            sceneRef.current.zoom!,
            sceneRef.current.zoom!,
            sceneRef.current.zoom!
          );
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
        
        renderer.domElement.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        renderer.domElement.removeEventListener('wheel', onWheel);
      };
    } catch (err) {
      console.error('Fel vid initiering av 3D-scen:', err);
      setError('Kunde inte skapa 3D-scen. Kontrollera att din webbläsare stöder WebGL.');
    }
  }, []);
  
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
    
    // Skapa modellen baserat på filnamnet
    setTimeout(() => {
      createBuildingModel(file.name);
      setFileName(file.name);
      setIsLoading(false);
    }, 1000);
  };
  
  // Skapa en 3D-modell av en byggnad baserat på filnamnet
  const createBuildingModel = (fileName: string) => {
    if (!sceneRef.current.scene) return;
    
    // Rensa tidigare modell
    if (sceneRef.current.model) {
      sceneRef.current.scene.remove(sceneRef.current.model);
    }
    
    // Återställ rotation och zoom
    sceneRef.current.targetRotation = { x: Math.PI / 6, y: Math.PI / 4 };
    sceneRef.current.zoom = 1;
    setViewInfo({
      rotation: { 
        x: THREE.MathUtils.radToDeg(sceneRef.current.targetRotation.x), 
        y: THREE.MathUtils.radToDeg(sceneRef.current.targetRotation.y) 
      },
      zoom: 100
    });
    
    // Skapa en modell anpassad efter filnamnet
    const lowerCaseFileName = fileName.toLowerCase();
    
    // Skapa en grupp för modellen
    const model = new THREE.Group();
    
    // Anpassa byggnaden efter filnamnet
    let buildingWidth = 10;
    let buildingDepth = 8;
    let buildingHeight = 15;
    let floors = 5;
    let color = 0x4287f5; // Blå
    
    if (lowerCaseFileName.includes('duplex')) {
      buildingWidth = 12;
      buildingDepth = 8;
      buildingHeight = 8;
      floors = 2;
    } else if (lowerCaseFileName.includes('office')) {
      buildingWidth = 20;
      buildingDepth = 15;
      buildingHeight = 30;
      floors = 10;
      color = 0x5a9bd5; // Ljusblå för kontor
    } else if (lowerCaseFileName.includes('house')) {
      buildingWidth = 10;
      buildingDepth = 8;
      buildingHeight = 6;
      floors = 2;
      color = 0x70ad47; // Grön för bostadshus
    } else if (lowerCaseFileName.includes('electrical')) {
      buildingWidth = 6;
      buildingDepth = 6;
      buildingHeight = 10;
      floors = 3;
      color = 0xe74c3c; // Röd för elektrisk installation
    }
    
    // Skapa byggnadens huvudkropp
    const buildingGeometry = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);
    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: color,
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
    
    // Beräkna antal fönster per våning och sida
    const windowsPerSideX = Math.floor(buildingWidth / 2.5);
    const windowsPerSideZ = Math.floor(buildingDepth / 2.5);
    
    // Skapa fönster på alla sidor
    for (let floor = 0; floor < floors; floor++) {
      const y = floor * (buildingHeight / floors) + 1.5;
      
      // Framsidan (Z+)
      for (let i = 0; i < windowsPerSideX; i++) {
        const x = (i - (windowsPerSideX - 1) / 2) * 2.5;
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(x, y, buildingDepth / 2 + 0.1);
        model.add(window);
      }
      
      // Baksidan (Z-)
      for (let i = 0; i < windowsPerSideX; i++) {
        const x = (i - (windowsPerSideX - 1) / 2) * 2.5;
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(x, y, -buildingDepth / 2 - 0.1);
        window.rotation.y = Math.PI;
        model.add(window);
      }
      
      // Vänster sida (X-)
      for (let i = 0; i < windowsPerSideZ; i++) {
        const z = (i - (windowsPerSideZ - 1) / 2) * 2.5;
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(-buildingWidth / 2 - 0.1, y, z);
        window.rotation.y = -Math.PI / 2;
        model.add(window);
      }
      
      // Höger sida (X+)
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
    
    // Skapa tak - anpassa efter typ av byggnad
    if (lowerCaseFileName.includes('duplex') || lowerCaseFileName.includes('house')) {
      // Sluttande tak för bostadshus
      const roofGeometry = new THREE.ConeGeometry(buildingWidth * 0.7, buildingHeight * 0.3, 4);
      const roofMaterial = new THREE.MeshStandardMaterial({ color: 0xA52A2A });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.set(0, buildingHeight + buildingHeight * 0.15, 0);
      roof.rotation.y = Math.PI / 4;
      model.add(roof);
    } else {
      // Platt tak för kommersiella byggnader
      const roofGeometry = new THREE.BoxGeometry(buildingWidth, 0.5, buildingDepth);
      const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
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
    
    // Specialanpassningar baserat på filnamn
    if (lowerCaseFileName.includes('electrical')) {
      // Lägg till ett elskåp
      const boxGeometry = new THREE.BoxGeometry(1.5, 2.5, 1);
      const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
      const electricalBox = new THREE.Mesh(boxGeometry, boxMaterial);
      electricalBox.position.set(buildingWidth / 2 + 2, 1.25, buildingDepth / 3);
      model.add(electricalBox);
    }
    
    // Lägg till modellen i scenen
    sceneRef.current.scene.add(model);
    sceneRef.current.model = model;
  };
  
  // Rensa modell
  const clearModel = () => {
    if (sceneRef.current.scene && sceneRef.current.model) {
      sceneRef.current.scene.remove(sceneRef.current.model);
      sceneRef.current.model = undefined;
    }
    
    setFileName(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Funktioner för att sätta vyer
  const setView = (viewType: string) => {
    if (!sceneRef.current) return;
    
    switch (viewType) {
      case 'front':
        sceneRef.current.targetRotation = { x: 0, y: 0 };
        break;
      case 'top':
        sceneRef.current.targetRotation = { x: -Math.PI / 2, y: 0 };
        break;
      case 'side':
        sceneRef.current.targetRotation = { x: 0, y: Math.PI / 2 };
        break;
      case 'iso':
        sceneRef.current.targetRotation = { x: Math.PI / 6, y: Math.PI / 4 };
        break;
      case 'reset':
        sceneRef.current.targetRotation = { x: Math.PI / 6, y: Math.PI / 4 };
        sceneRef.current.zoom = 1;
        break;
    }
    
    setViewInfo({
      rotation: { 
        x: THREE.MathUtils.radToDeg(sceneRef.current.targetRotation.x), 
        y: THREE.MathUtils.radToDeg(sceneRef.current.targetRotation.y) 
      },
      zoom: sceneRef.current.zoom! * 100
    });
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
              disabled={isLoading || !fileName}
            >
              Rensa
            </Button>
          </Box>
          
          {fileName && (
            <Typography level="body-sm" sx={{ mb: 1 }}>
              Aktuell modell: <strong>{fileName}</strong>
            </Typography>
          )}
        </Box>
        
        <Box 
          sx={{ 
            flex: 1, 
            position: 'relative',
            display: 'flex',
            cursor: fileName ? 'grab' : 'default',
            '&:active': {
              cursor: 'grabbing'
            }
          }}
        >
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
          
          {!fileName && !isLoading && !error && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255,255,255,0.5)',
                zIndex: 5
              }}
            >
              <Typography level="body-lg" sx={{ mb: 2 }}>
                Ingen 3D-modell laddad
              </Typography>
              <Typography level="body-sm">
                Ladda upp en IFC-fil för att visa här
              </Typography>
            </Box>
          )}
          
          {fileName && (
            <>
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
                  zIndex: 10
                }}
              >
                Rotation X: {Math.round(viewInfo.rotation.x)}° Y: {Math.round(viewInfo.rotation.y)}° | Zoom: {Math.round(viewInfo.zoom)}%
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ThreeDOverviewPage;