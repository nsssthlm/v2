import React from 'react';
import { Box, Typography, Button } from '@mui/joy';

const Home: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography level="h1">ValvX Projektplattform</Typography>
      <Typography level="body-lg" sx={{ my: 2 }}>
        Detta är en test sida för ValvX plattformen.
      </Typography>
      <Button color="primary">Test Button</Button>
    </Box>
  );
};

export default Home;