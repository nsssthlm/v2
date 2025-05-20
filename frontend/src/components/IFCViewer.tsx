import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, CircularProgress, Typography, Stack } from '@mui/joy';
import * as THREE from 'three';

/**
 * IFC-visare för att ladda och visa IFC-modeller i 3D
 */
const IFCViewer: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadedModel, setLoadedModel] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Referens för att hålla reda på ThreeJS-objekt
  const sceneRef = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    controls?: any;
    ifcLoader?: any;
    animationFrame?: number;
    model?: THREE.Object3D;
  }>({});

  // Initiera 3D-scenen när komponenten laddas
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Skapa grundläggande ThreeJS-scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Skapa renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Skapa kamera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
    
    // Ljus
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Hjälplinjer
    const gridHelper = new THREE.GridHelper(50, 50);
    scene.add(gridHelper);
    
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    
    // Importera OrbitControls dynamiskt
    import('three/examples/jsm/controls/OrbitControls').then(({ OrbitControls }) => {
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controls.target.set(0, 0, 0);
      sceneRef.current.controls = controls;
    });

    // Importera IFCLoader dynamiskt
    import('web-ifc-three/IFCLoader').then(({ IFCLoader }) => {
      const ifcLoader = new IFCLoader();
      ifcLoader.ifcManager.setWasmPath('https://unpkg.com/web-ifc@0.0.36/');
      sceneRef.current.ifcLoader = ifcLoader;
    });

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
      
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Spara referenser
    sceneRef.current = {
      scene,
      camera,
      renderer,
      animationFrame: sceneRef.current.animationFrame,
      ...sceneRef.current
    };
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (sceneRef.current.animationFrame) {
        cancelAnimationFrame(sceneRef.current.animationFrame);
      }
      
      if (sceneRef.current.model && sceneRef.current.scene) {
        sceneRef.current.scene.remove(sceneRef.current.model);
      }
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
  }, []);
  
  // Vyfunktioner
  const viewFront = () => {
    if (!sceneRef.current.camera || !sceneRef.current.controls) return;
    
    const camera = sceneRef.current.camera;
    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);
    
    if (sceneRef.current.controls) {
      sceneRef.current.controls.target.set(0, 0, 0);
      sceneRef.current.controls.update();
    }
  };
  
  const viewTop = () => {
    if (!sceneRef.current.camera || !sceneRef.current.controls) return;
    
    const camera = sceneRef.current.camera;
    camera.position.set(0, 20, 0);
    camera.lookAt(0, 0, 0);
    
    if (sceneRef.current.controls) {
      sceneRef.current.controls.target.set(0, 0, 0);
      sceneRef.current.controls.update();
    }
  };
  
  const viewIso = () => {
    if (!sceneRef.current.camera || !sceneRef.current.controls) return;
    
    const camera = sceneRef.current.camera;
    camera.position.set(15, 15, 15);
    camera.lookAt(0, 0, 0);
    
    if (sceneRef.current.controls) {
      sceneRef.current.controls.target.set(0, 0, 0);
      sceneRef.current.controls.update();
    }
  };
  
  const resetView = () => {
    if (!sceneRef.current.camera || !sceneRef.current.controls) return;
    
    const camera = sceneRef.current.camera;
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
    
    if (sceneRef.current.controls) {
      sceneRef.current.controls.target.set(0, 0, 0);
      sceneRef.current.controls.update();
    }
  };
  
  // Funktion för att hantera filuppladdning
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
      // Vänta tills IFC-loader är initierad
      if (!sceneRef.current.ifcLoader) {
        await new Promise(resolve => {
          const checkLoader = () => {
            if (sceneRef.current.ifcLoader) {
              resolve(true);
            } else {
              setTimeout(checkLoader, 100);
            }
          };
          checkLoader();
        });
      }
      
      // Rensa tidigare modell
      if (sceneRef.current.model && sceneRef.current.scene) {
        sceneRef.current.scene.remove(sceneRef.current.model);
        sceneRef.current.model = undefined;
      }
      
      // Läs in filen
      const buffer = await file.arrayBuffer();
      
      // Ladda in IFC-modellen
      const ifcLoader = sceneRef.current.ifcLoader;
      const model = await ifcLoader.parse(buffer);
      
      // Lägg till modellen i scenen
      if (sceneRef.current.scene) {
        sceneRef.current.scene.add(model);
        sceneRef.current.model = model;
        
        // Centrera vyn på modellen
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        
        if (sceneRef.current.controls) {
          sceneRef.current.controls.target.copy(center);
        }
        
        // Anpassa kameran till modellens storlek
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const distance = maxDim * 2;
        
        if (sceneRef.current.camera) {
          const camera = sceneRef.current.camera;
          const direction = camera.position.clone().sub(center).normalize();
          camera.position.copy(center.clone().add(direction.multiplyScalar(distance)));
          camera.lookAt(center);
        }
      }
      
      // Sätt filnamnet som laddad modell
      setLoadedModel(file.name);
    } catch (error) {
      console.error('Fel vid laddning av IFC-fil:', error);
      setErrorMessage(`Kunde inte ladda IFC-filen: ${error instanceof Error ? error.message : 'Okänt fel'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Rensa modellen
  const clearModel = () => {
    // Ta bort modellen från scenen
    if (sceneRef.current.model && sceneRef.current.scene) {
      sceneRef.current.scene.remove(sceneRef.current.model);
      sceneRef.current.model = undefined;
    }
    
    setLoadedModel(null);
    setErrorMessage(null);
    
    // Återställ filväljaren
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Återställ kameravyn
    resetView();
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
            bgcolor: '#f5f5f5',
            ...((!containerRef.current && !loadedModel) && {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            })
          }}
        >
          {!containerRef.current && !loadedModel && (
            <>
              <Typography level="body-lg">
                Ingen 3D-modell laddad
              </Typography>
              <Typography level="body-sm">
                Ladda upp en IFC-fil för att visa den här
              </Typography>
            </>
          )}
        </Box>
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