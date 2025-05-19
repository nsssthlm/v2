import React from 'react';
import { Box, Typography, Button } from '@mui/joy';
import { Link } from 'react-router-dom';

interface ComingSoonPageProps {
  title: string;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ title }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      height: '70vh',
      textAlign: 'center',
      padding: 3
    }}>
      <Typography level="h2" gutterBottom>{title}</Typography>
      <Typography level="body-lg" sx={{ mb: 4 }}>
        Denna funktion är under utveckling och kommer snart.
      </Typography>
      
      <Button component={Link} to="/dashboard" variant="outlined" sx={{ mt: 2 }}>
        Tillbaka till Dashboarden
      </Button>
    </Box>
  );
};

export default ComingSoonPage;