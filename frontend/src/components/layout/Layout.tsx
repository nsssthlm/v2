import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, IconButton } from '@mui/joy';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          overflow: 'auto',
        }}
      >
        <Box sx={{ mb: 2 }}>
          <IconButton 
            onClick={toggleSidebar} 
            sx={{ mb: 2 }}
            variant="outlined"
            color="neutral"
          >
            {sidebarOpen ? '◀' : '▶'}
          </IconButton>
        </Box>
        
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;