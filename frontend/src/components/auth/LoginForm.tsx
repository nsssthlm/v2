import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../../context/AuthContext';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, authState } = useAuth();

  // Automatically redirect when user is authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      onLoginSuccess();
    }
  }, [authState.isAuthenticated, authState.user, onLoginSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Use context login function
      await login(username, password);
      // OnLoginSuccess will be called by the effect above when authentication state changes
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Inloggning misslyckades. Kontrollera dina uppgifter.');
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
              <FormLabel>E-postadress</FormLabel>
              <Input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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