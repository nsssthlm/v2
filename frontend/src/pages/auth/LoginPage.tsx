import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Link, 
  Card,
  FormControl,
  Stack,
  FormLabel,
  Input,
  Checkbox,
  Divider,
  Alert
} from '@mui/joy';

// URL till skogsbilden i public-mappen
const forestImageUrl = '/images/swedish-forest.webp';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulera inloggningsprocess
    setTimeout(() => {
      // Här skulle riktig inloggningslogik finnas
      setIsLoading(false);
      setErrorMessage(''); // Rensa eventuella felmeddelanden vid framgång
      // Redirect till dashboard/hem efter inloggning
    }, 1000);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        position: 'relative'
      }}
    >
      {/* Bakgrundsbilden som täcker hela skärmen */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${forestImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0
        }}
      />
      
      {/* Mörkare overlay ovanpå bakgrundsbilden */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 1
        }}
      />
      
      {/* Innehåll */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          zIndex: 2,
          p: 2
        }}
      >
        {/* ValvX-logotyp/text */}
        <Typography
          level="h1"
          sx={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'white',
            mb: 4,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
          }}
        >
          ValvX
        </Typography>
        
        {/* Inloggningskort */}
        <Card
          variant="outlined"
          sx={{
            maxWidth: 400,
            width: '100%',
            p: 3,
            boxShadow: 'lg',
            backgroundColor: 'rgba(255, 255, 255, 0.95)'
          }}
        >
          <Typography level="h2" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
            Logga in
          </Typography>
          
          {errorMessage && (
            <Alert color="danger" sx={{ mb: 3 }}>
              {errorMessage}
            </Alert>
          )}
          
          <form onSubmit={handleLogin}>
            <Stack spacing={2}>
              <FormControl>
                <FormLabel>E-postadress</FormLabel>
                <Input
                  type="email"
                  placeholder="namn@exempel.se"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>
              
              <FormControl>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <FormLabel>Lösenord</FormLabel>
                  <Link level="body-sm" href="#glömt-lösenord">
                    Glömt lösenord?
                  </Link>
                </Box>
                <Input
                  type="password"
                  placeholder="Ange lösenord"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  label="Kom ihåg mig"
                />
              </Box>
              
              <Button
                type="submit"
                loading={isLoading}
                sx={{ 
                  mt: 1, 
                  backgroundColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#1565c0'
                  }
                }}
              >
                Logga in
              </Button>
            </Stack>
          </form>
          
          <Divider sx={{ my: 3 }}>eller</Divider>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography level="body-sm">
              Har du inget konto?{' '}
              <Link href="#registrera">
                Registrera dig här
              </Link>
            </Typography>
          </Box>
        </Card>
        
        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography level="body-sm" sx={{ color: 'white' }}>
            © {new Date().getFullYear()} ValvX. Alla rättigheter förbehållna.
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Link href="#sekretess" sx={{ color: 'white', mx: 1, fontSize: '0.875rem' }}>
              Sekretess
            </Link>
            <Link href="#villkor" sx={{ color: 'white', mx: 1, fontSize: '0.875rem' }}>
              Användarvillkor
            </Link>
            <Link href="#hjälp" sx={{ color: 'white', mx: 1, fontSize: '0.875rem' }}>
              Hjälp
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;