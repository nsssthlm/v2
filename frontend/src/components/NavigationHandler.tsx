import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Komponent som hanterar navigation mellan sidor
 * Ger oss möjlighet att lägga till logik för att hantera sidnavigering
 */
const NavigationHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Logg för att hjälpa felsökning av navigation
    console.log('NavigationHandler: Fångar navigering till', location.pathname + location.search);
    
    // Om vi navigerar till en mappsida, spara den aktuella sökvägen i sessionslagring
    if (location.pathname.startsWith('/folders/')) {
      sessionStorage.setItem('lastFolderPath', location.pathname);
    }
  }, [location]);

  return null; // Denna komponent renderar inget visuellt
};

export default NavigationHandler;