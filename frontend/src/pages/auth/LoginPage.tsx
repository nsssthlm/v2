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
  Tabs,
  TabList,
  Tab,
  Divider
} from '@mui/joy';

// URL till skogsbilden i public-mappen
const forestImageUrl = '/images/swedish-forest.webp';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulera inloggningsprocess
    setTimeout(() => {
      // Här skulle riktig inloggningslogik finnas
      setIsLoading(false);
      // Redirect till dashboard/hem efter inloggning
      window.location.href = '/dashboard';
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
      {/* Vänster sida med formulär */}
      <Box
        sx={{
          width: '100%',
          maxWidth: '450px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
          backgroundColor: 'white',
          zIndex: 2
        }}
      >
        <Card
          variant="outlined"
          sx={{
            width: '100%',
            maxWidth: '350px',
            p: 3,
            boxShadow: 'sm',
            border: '1px solid #e0e0e0'
          }}
        >
          {/* Titel */}
          <Typography
            level="h3"
            sx={{
              fontWeight: 'bold',
              mb: 1,
              color: '#333'
            }}
          >
            ValvX
          </Typography>
          <Typography
            level="body-sm"
            sx={{ mb: 3, color: '#666' }}
          >
            Sign in to your account or create a new one
          </Typography>

          {/* Tabs för Login/Register */}
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value as string)}
            sx={{ mb: 3 }}
          >
            <TabList>
              <Tab value="login">Login</Tab>
              <Tab value="register">Register</Tab>
            </TabList>
          </Tabs>
          
          {/* Inloggningsformulär */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin}>
              <Stack spacing={3}>
                <FormControl>
                  <FormLabel>Username</FormLabel>
                  <Input
                    type="text"
                    placeholder="johnsmith"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </FormControl>
                
                <Button
                  type="submit"
                  loading={isLoading}
                  fullWidth
                  sx={{ 
                    mt: 1, 
                    backgroundColor: '#4caf50', // Grön färg som matchar projektet
                    '&:hover': {
                      backgroundColor: '#388e3c'
                    }
                  }}
                >
                  Login
                </Button>
              </Stack>
            </form>
          )}
          
          {/* Registreringsformulär (enkelt visas bara i designen) */}
          {activeTab === 'register' && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography level="body-md">
                Contact your administrator to create a new account.
              </Typography>
            </Box>
          )}
        </Card>
      </Box>
      
      {/* Höger sida med bakgrundsbild */}
      <Box
        sx={{
          flexGrow: 1,
          position: 'relative',
          display: { xs: 'none', md: 'block' }
        }}
      >
        {/* Bakgrundsbilden som täcker hela högra sidan */}
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
      </Box>
      
      {/* Footer - visas endast på mobil */}
      <Box 
        sx={{ 
          position: 'absolute', 
          bottom: 10, 
          left: 0, 
          width: '100%', 
          textAlign: 'center',
          display: { md: 'none' },
          zIndex: 10
        }}
      >
        <Typography level="body-xs" sx={{ color: '#666' }}>
          © {new Date().getFullYear()} ValvX. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;