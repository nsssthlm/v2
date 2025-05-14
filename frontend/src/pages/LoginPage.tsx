import React from 'react';
import { Box, Typography, Container } from '@mui/joy';
import LoginForm from '../components/auth/LoginForm';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    // Omdirigera till dashboard efter lyckad inloggning
    navigate('/');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5 }}>
        <Typography level="h2" sx={{ mb: 4 }}>
          ValvX Projektplattform
        </Typography>
        
        <LoginForm onLoginSuccess={handleLoginSuccess} />
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography level="body-md" sx={{ color: 'text.secondary' }}>
            Denna plattform är under utveckling. Kontakta supporten vid problem.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;