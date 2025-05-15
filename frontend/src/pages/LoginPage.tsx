import React from 'react';
import { Box, Typography, Container } from '@mui/joy';
import LoginForm from '../components/auth/LoginForm';
import { useNavigate } from 'react-router-dom';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    // Anropa förälderns callback om den finns
    if (onLoginSuccess) {
      onLoginSuccess();
    }
    
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
            Använd följande inloggningsuppgifter för testanvändaren:
            <br />
            Användarnamn: <strong>projectleader</strong>
            <br />
            Lösenord: <strong>123456</strong>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;