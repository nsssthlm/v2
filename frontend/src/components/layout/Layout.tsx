import { Outlet } from 'react-router-dom';
import { Box } from '@mui/joy';
import Sidebar from './Sidebar';
import TopMenu from './TopMenu';

const Layout = () => {
  return (
    <Box sx={{ height: '100vh' }}>
      {/* Toppmeny - full width */}
      <Box sx={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1100 
      }}>
        <TopMenu />
      </Box>
      
      {/* Huvudinnehåll med sidebar och content */}
      <Box sx={{ 
        display: 'flex', 
        height: '100vh', 
        pt: '48px' // Höjd för topmenyn
      }}>
        <Sidebar />
        
        <Box
          component="main"
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
  );
};

export default Layout;