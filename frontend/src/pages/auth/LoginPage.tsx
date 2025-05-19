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
  Divider,
  Alert
} from '@mui/joy';
import { loginUser } from '../../utils/authUtils';

// URL till skogsbilden i public-mappen
const forestImageUrl = '/images/swedish-forest.webp';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [error, setError] = useState<string | null>(null);

  // Registreringsformulär fält
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Använd loginUser från utils/authUtils
    const result = loginUser(username, password);
    
    setTimeout(() => {
      setIsLoading(false);
      
      if (result.success) {
        // Visa info om inloggad användare
        console.log(`Inloggad som ${result.user?.username} med rollen ${result.user?.role}`);
        
        // Redirect till dashboard/hem efter inloggning
        window.location.href = '/dashboard';
      } else {
        // Visa felmeddelande
        setError(result.message || 'Inloggningen misslyckades');
      }
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
      {/* Vänster sida med formulär - exakt 50% av skärmen */}
      <Box
        sx={{
          width: '50%', // Exakt halva skärmen
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
            maxWidth: '400px',
            p: 3,
            minHeight: '500px', // Fast höjd för att hålla samma storlek i flikarna
            boxShadow: 'sm',
            border: '1px solid #e0e0e0',
            borderRadius: '16px' // Mer rundade hörn
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

          {/* Login/Register knappar som i exemplet */}
          <Box 
            sx={{
              display: 'flex',
              mb: 3,
              borderBottom: '1px solid #e0e0e0'
            }}
          >
            <Button
              onClick={() => setActiveTab('login')}
              sx={{ 
                mr: 1,
                backgroundColor: activeTab === 'login' ? '#60cd18' : 'transparent',
                color: activeTab === 'login' ? 'white' : 'black',
                '&:hover': {
                  backgroundColor: '#60cd18',
                  color: 'white'
                },
                minWidth: '80px',
                borderRadius: '4px',
                textTransform: 'none',
                fontWeight: 'normal'
              }}
            >
              Login
            </Button>
            <Button
              onClick={() => setActiveTab('register')}
              sx={{ 
                backgroundColor: activeTab === 'register' ? '#60cd18' : 'transparent',
                color: activeTab === 'register' ? 'white' : 'black',
                '&:hover': {
                  backgroundColor: '#60cd18',
                  color: 'white'
                },
                minWidth: '80px',
                borderRadius: '4px',
                textTransform: 'none',
                fontWeight: 'normal'
              }}
            >
              Register
            </Button>
          </Box>
          
          {/* Inloggningsformulär */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin}>
              {error && (
                <Alert color="danger" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <Box sx={{ mb: 3 }}>
                <Typography level="body-sm" fontWeight="normal" sx={{ mb: 1 }}>Username</Typography>
                <Input
                  type="text"
                  placeholder="johnsmith"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={{ 
                    borderRadius: '8px',
                    height: '40px',
                    border: '1px solid #e0e0e0'
                  }}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography level="body-sm" fontWeight="normal" sx={{ mb: 1 }}>Password</Typography>
                <Input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{ 
                    borderRadius: '8px',
                    height: '40px',
                    border: '1px solid #e0e0e0'
                  }}
                />
              </Box>
              
              <Button
                type="submit"
                loading={isLoading}
                fullWidth
                sx={{ 
                  mt: 1, 
                  backgroundColor: '#60cd18', // Specifik grön färg enligt önskemål
                  '&:hover': {
                    backgroundColor: '#60cd18' // Samma färg för hover
                  },
                  borderRadius: '8px',
                  height: '44px',
                  textTransform: 'none', // Ingen automatisk versalisering av texten
                  fontWeight: 500
                }}
              >
                Login
              </Button>
            </form>
          )}
          
          {/* Registreringsformulär med de önskade fälten */}
          {activeTab === 'register' && (
            <form onSubmit={(e) => e.preventDefault()}>
              <Box sx={{ mb: 3 }}>
                <Typography level="body-sm" fontWeight="normal" sx={{ mb: 1 }}>Username</Typography>
                <Input
                  type="text"
                  placeholder="johndoe"
                  required
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  sx={{ 
                    borderRadius: '8px',
                    height: '40px',
                    border: '1px solid #e0e0e0'
                  }}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography level="body-sm" fontWeight="normal" sx={{ mb: 1 }}>Password</Typography>
                <Input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  sx={{ 
                    borderRadius: '8px',
                    height: '40px',
                    border: '1px solid #e0e0e0'
                  }}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography level="body-sm" fontWeight="normal" sx={{ mb: 1 }}>Confirm Password</Typography>
                <Input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  sx={{ 
                    borderRadius: '8px',
                    height: '40px',
                    border: '1px solid #e0e0e0'
                  }}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography level="body-sm" fontWeight="normal" sx={{ mb: 1 }}>Email</Typography>
                <Input
                  type="email"
                  placeholder="john.doe@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ 
                    borderRadius: '8px',
                    height: '40px',
                    border: '1px solid #e0e0e0'
                  }}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography level="body-sm" fontWeight="normal" sx={{ mb: 1 }}>Invite Code</Typography>
                <Input
                  type="text"
                  placeholder="Enter invite code"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  sx={{ 
                    borderRadius: '8px',
                    height: '40px',
                    border: '1px solid #e0e0e0'
                  }}
                />
              </Box>
              
              <Button
                type="submit"
                fullWidth
                sx={{ 
                  mt: 1, 
                  backgroundColor: '#60cd18', // Grön färg för Create Account-knappen
                  '&:hover': {
                    backgroundColor: '#60cd18'
                  },
                  borderRadius: '8px',
                  height: '44px',
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                Create Account
              </Button>
            </form>
          )}
        </Card>
      </Box>
      
      {/* Höger sida med bakgrundsbild - exakt 50% av skärmen */}
      <Box
        sx={{
          width: '50%', // Exakt halva skärmen
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