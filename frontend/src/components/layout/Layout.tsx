import { Outlet } from 'react-router-dom';
import { Box } from '@mui/joy';
import Sidebar from './Sidebar';
import TopMenu from './TopMenu';

const Layout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Toppmeny */}
      <TopMenu />
      
      {/* Huvudinnehåll med sidebar och content */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
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