import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Card,
  CardContent,
  Typography,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Alert,
  Divider
} from '@mui/joy';
import axios from 'axios';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Använd JWT token endpoint
      const response = await axios.post('/api/token_obtain_pair/', {
        username,
        password
      });

      // Spara tokens i localStorage
      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Konfigurera axios för att använda token i alla framtida requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      // Om inloggningen lyckas
      onLoginSuccess();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Inloggning misslyckades. Kontrollera dina uppgifter.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <CardContent>
        <Typography level="h4" sx={{ mb: 2 }}>
          Logga in till ValvX
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        {error && (
          <Alert color="danger" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <FormControl>
              <FormLabel>Användarnamn</FormLabel>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="projectleader"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Lösenord</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Ditt lösenord"
              />
            </FormControl>
            
            <Button 
              type="submit" 
              loading={loading}
              fullWidth
            >
              Logga in
            </Button>
            
            <Typography level="body-sm" sx={{ textAlign: 'center', color: 'text.tertiary' }}>
              Testinloggning: projectleader / 123456
            </Typography>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;