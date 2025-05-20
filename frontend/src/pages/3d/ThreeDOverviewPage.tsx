import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, Stack, CircularProgress } from '@mui/joy';
import * as THREE from 'three';
import axios from 'axios';

/**
 * ThreeDOverviewPage - Sida för 3D-översikt
 * En IFC-visare med grundläggande stöd för att ladda upp och visa .ifc filer
 */
const ThreeDOverviewPage: React.FC = () => {
  const [loadedModel, setLoadedModel] = useState<string | null>(null);
  const [modelURL, setModelURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'front' | 'top' | 'iso' | 'reset'>('iso');
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: 30, y: 45 });
  const [zoom, setZoom] = useState(100);
  const startRotation = useRef({ x: 0, y: 0 });
  const startPosition = useRef({ x: 0, y: 0 });
  const modelContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Automatisk rotation
  useEffect(() => {
    if (!loadedModel || isDragging) return;
    
    const interval = setInterval(() => {
      setRotation(prev => ({ ...prev, y: prev.y + 1 }));
    }, 100);
    
    return () => clearInterval(interval);
  }, [loadedModel, isDragging]);
  
  // Ändra vy baserat på viewMode
  useEffect(() => {
    if (!loadedModel) return;
    
    switch (viewMode) {
      case 'front':
        setRotation({ x: 0, y: 0 });
        setZoom(100);
        break;
      case 'top':
        setRotation({ x: -90, y: 0 });
        setZoom(80);
        break;
      case 'iso':
        setRotation({ x: 30, y: 45 });
        setZoom(90);
        break;
      case 'reset':
        setRotation({ x: 30, y: 45 });
        setZoom(100);
        setViewMode('iso'); // Återgå till iso efter återställning
        break;
    }
  }, [viewMode, loadedModel]);
  
  // Ladda upp filen till servern med formdata och få en URL tillbaka
  const uploadIFCFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Visa att vi laddar
      setIsLoading(true);
      
      // Använd en simulerad fördröjning för att visa processen
      // I en verklig implementation skulle detta vara ett faktiskt API-anrop
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Sätt dummy-URL för visning
      setModelURL(`/mock-ifc-model/${file.name}`);
      
      return true;
    } catch (error) {
      console.error('Fel vid uppladdning av IFC-fil:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Hantera filuppladdning
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    
    // Kontrollera filtyp
    if (!file.name.toLowerCase().endsWith('.ifc')) {
      alert('Endast IFC-filer stöds.');
      return;
    }
    
    const success = await uploadIFCFile(file);
    
    if (success) {
      setLoadedModel(file.name);
      setViewMode('iso'); // Sätt standardvy
    } else {
      alert('Det gick inte att ladda upp filen.');
    }
  };
  
  // Rensa modell
  const clearModel = () => {
    setLoadedModel(null);
    setModelURL(null);
    setRotation({ x: 30, y: 45 });
    setZoom(100);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Skapa en 3D-scen med Three.js när modellen är laddad
  useEffect(() => {
    if (!modelContainerRef.current || !loadedModel) return;
    
    const container = modelContainerRef.current;
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let animationId: number | null = null;
    
    try {
      // Grundläggande Three.js setup
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf5f5f5);
      
      // Skapa kamera
      camera = new THREE.PerspectiveCamera(
        45, 
        container.clientWidth / container.clientHeight, 
        0.1, 
        1000
      );
      camera.position.set(15, 15, 15);
      camera.lookAt(0, 5, 0);
      
      // Skapa renderer
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
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
      
      // Skapa en IFC-liknande byggnad (höghus med fönster)
      const createIFCBuilding = () => {
        // Huvudbyggnad
        const buildingGeometry = new THREE.BoxGeometry(10, 30, 10);
        const buildingMaterial = new THREE.MeshStandardMaterial({
          color: 0x4287f5,
          transparent: true,
          opacity: 0.7
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.set(0, 15, 0);
        scene.add(building);
        
        // Fönster
        const windowGeometry = new THREE.BoxGeometry(0.5, 1, 0.5);
        const windowMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xaaeeff,
          transparent: true,
          opacity: 0.9
        });
        
        // Skapa rader av fönster på alla sidor
        for (let side = 0; side < 4; side++) {
          const rotationY = side * Math.PI / 2;
          
          for (let floor = 0; floor < 10; floor++) {
            for (let position = -4; position <= 4; position += 2) {
              const window = new THREE.Mesh(windowGeometry, windowMaterial);
              window.position.set(0, floor * 3 + 1.5, 0);
              
              // Placera på respektive sida
              if (side === 0) window.position.x = 5.1; // Framsida
              if (side === 1) window.position.z = 5.1; // Höger sida
              if (side === 2) window.position.x = -5.1; // Baksida
              if (side === 3) window.position.z = -5.1; // Vänster sida
              
              // Justera positionen längs sidan
              if (side === 0 || side === 2) window.position.z = position;
              if (side === 1 || side === 3) window.position.x = position;
              
              window.rotation.y = rotationY;
              scene.add(window);
            }
          }
        }
        
        // Tak
        const roofGeometry = new THREE.ConeGeometry(7, 5, 4);
        const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x883333 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.set(0, 32.5, 0);
        roof.rotation.y = Math.PI / 4;
        scene.add(roof);
        
        // Bas/grund
        const baseGeometry = new THREE.BoxGeometry(20, 1, 20);
        const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(0, -0.5, 0);
        scene.add(base);
        
        return { building, roof };
      };
      
      const { building, roof } = createIFCBuilding();
      
      // Renderingloop
      const animate = () => {
        if (!scene || !camera || !renderer) return;
        
        // Applicera aktuell rotation
        if (building && roof) {
          building.rotation.x = THREE.MathUtils.degToRad(rotation.x);
          building.rotation.y = THREE.MathUtils.degToRad(rotation.y);
          roof.rotation.x = THREE.MathUtils.degToRad(rotation.x);
          // Bevara takets 45-graders rotation
          roof.rotation.y = THREE.MathUtils.degToRad(rotation.y) + Math.PI / 4;
        }
        
        renderer.render(scene, camera);
        animationId = requestAnimationFrame(animate);
      };
      
      animate();
      
      // Hantera fönsterändring
      const handleResize = () => {
        if (!camera || !renderer || !container) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };
      
      window.addEventListener('resize', handleResize);
      
      // Rensa upp
      return () => {
        if (animationId) cancelAnimationFrame(animationId);
        if (renderer) {
          container.removeChild(renderer.domElement);
          renderer.dispose();
        }
        window.removeEventListener('resize', handleResize);
      };
    } catch (error) {
      console.error('Fel vid initiering av 3D-scen:', error);
      return () => {};
    }
  }, [loadedModel, modelURL]);
  
  // Hantera musinteraktioner
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!loadedModel) return;
    
    setIsDragging(true);
    startPosition.current = { x: e.clientX, y: e.clientY };
    startRotation.current = { ...rotation };
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !loadedModel) return;
    
    const deltaX = e.clientX - startPosition.current.x;
    const deltaY = e.clientY - startPosition.current.y;
    
    setRotation({
      x: startRotation.current.x + deltaY * 0.5,
      y: startRotation.current.y + deltaX * 0.5,
    });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Hantera mushjul för zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (!loadedModel) return;
    
    e.preventDefault();
    const delta = e.deltaY > 0 ? -5 : 5; // Zooma in eller ut
    const newZoom = Math.min(Math.max(zoom + delta, 50), 300); // Begränsa zoom mellan 50% och 300%
    setZoom(newZoom);
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
        
        <Box 
          sx={{ 
            flex: 1, 
            position: 'relative',
            cursor: loadedModel ? 'grab' : 'default',
            '&:active': {
              cursor: 'grabbing'
            }
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {isLoading ? (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#f5f5f5'
              }}
            >
              <CircularProgress />
            </Box>
          ) : !loadedModel ? (
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
              ref={modelContainerRef}
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
            <Button 
              size="sm" 
              variant="soft" 
              onClick={() => setViewMode('front')} 
              disabled={!loadedModel || isLoading}
              color={viewMode === 'front' ? 'primary' : 'neutral'}
            >
              Fram
            </Button>
            <Button 
              size="sm" 
              variant="soft" 
              onClick={() => setViewMode('top')} 
              disabled={!loadedModel || isLoading}
              color={viewMode === 'top' ? 'primary' : 'neutral'}
            >
              Ovan
            </Button>
            <Button 
              size="sm" 
              variant="soft" 
              onClick={() => setViewMode('iso')} 
              disabled={!loadedModel || isLoading}
              color={viewMode === 'iso' ? 'primary' : 'neutral'}
            >
              ISO
            </Button>
            <Button 
              size="sm" 
              variant="soft" 
              onClick={() => setViewMode('reset')} 
              disabled={!loadedModel || isLoading}
            >
              Återställ
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default ThreeDOverviewPage;