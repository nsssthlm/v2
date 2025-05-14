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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post('/api/login/', {
        email,
        password
      });

      // Om inloggningen lyckas
      onLoginSuccess();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data || 'Inloggning misslyckades. Kontrollera dina uppgifter.');
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
              <FormLabel>E-post</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="projectleader@example.com"
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
              Testinloggning: projectleader@example.com / 123456
            </Typography>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;