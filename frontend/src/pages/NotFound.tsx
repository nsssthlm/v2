import React from 'react';
import { Box, Typography, Button } from '@mui/joy';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '70vh',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Typography level="h1" sx={{ fontSize: '4rem', mb: 2 }}>404</Typography>
      <Typography level="h3" sx={{ mb: 3 }}>Sidan kunde inte hittas</Typography>
      <Typography sx={{ mb: 4, maxWidth: 500 }}>
        Sidan du letar efter finns inte eller har flyttats. Kontrollera URL:en eller gå tillbaka till startsidan.
      </Typography>
      <Button 
        size="lg" 
        onClick={() => navigate('/')}
        variant="solid"
      >
        Tillbaka till dashboard
      </Button>
    </Box>
  );
};

export default NotFound;