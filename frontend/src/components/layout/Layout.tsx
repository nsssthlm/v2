import { Outlet, useNavigate } from 'react-router-dom';
import { Box } from '@mui/joy';
import Sidebar from './Sidebar';
import TopMenu from './TopMenu';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Layout = () => {
  const navigate = useNavigate();
  const { isLoggedIn, refreshSession } = useAuth();
  
  // Kontrollera inloggningsstatus när layouten laddas och vid projektbyte
  useEffect(() => {
    // Uppdatera autentiseringssessionen
    refreshSession();
    
    // Lyssna på projektbyten för att bevara inloggning
    const handleProjectChange = () => {
      console.log('Projektbyte detekterat - uppdaterar autentiseringssession');
      refreshSession();
    };
    
    // Lyssna efter händelsen projectChanged från TopMenu
    window.addEventListener('projectChanged', handleProjectChange);
    
    // Om inte inloggad, navigera till login
    if (!isLoggedIn) {
      navigate('/login');
    }
    
    // Städa upp lyssnare när komponenten avmonteras
    return () => {
      window.removeEventListener('projectChanged', handleProjectChange);
    };
  }, [isLoggedIn, navigate, refreshSession]);
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh'
    }}>
      {/* Huvudinnehåll med sidebar och content */}
      <Box sx={{ 
        display: 'flex', 
        flexGrow: 1, 
        overflow: 'hidden'
      }}>
        <Sidebar />
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Toppmeny - ovanför huvudinnehållet */}
          <TopMenu />
          
          {/* Huvudinnehåll */}
          <Box
            sx={{
              flexGrow: 1,
              p: 3,
              overflow: 'auto',
              bgcolor: '#f9fafb', // Ljusgrå bakgrund
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;