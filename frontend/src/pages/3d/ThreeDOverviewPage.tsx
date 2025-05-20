import React from 'react';
import { Box, Typography } from '@mui/joy';
import IFCViewer from '../../components/IFCViewer';

const ThreeDOverviewPage: React.FC = () => {
  return (
    <Box sx={{ 
      p: 2, 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column'
    }}>
      <Typography level="h2" sx={{ mb: 2 }}>3D översikt</Typography>
      
      <Box sx={{ flex: 1 }}>
        <IFCViewer />
      </Box>
    </Box>
  );
};

export default ThreeDOverviewPage;