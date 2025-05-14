import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/joy';
import { useAuth } from '../../context/AuthContext';

// Helper component for loading state
export const LoadingScreen = () => (
  <Box sx={{ 
    display: 'flex', 
    flexDirection: 'column',
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    <CircularProgress size="lg" />
    <Typography level="body-lg" sx={{ mt: 2 }}>
      Laddar ValvX...
    </Typography>
  </Box>
);

// Define the ProtectedRoute component to secure routes
export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { authState } = useAuth();
  
  if (authState.loading) {
    return <LoadingScreen />;
  }
  
  if (!authState.isAuthenticated) return <Navigate to="/login" />;
  return children;
};

// Define a component that handles the login page with auth checking
export const AuthLoginRoute = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => {
  const { authState } = useAuth();
  
  if (authState.loading) {
    return <LoadingScreen />;
  }
  
  if (authState.isAuthenticated) {
    onLoginSuccess();
    return <Navigate to="/" />;
  }
  
  // Import LoginPage dynamically to avoid circular dependencies
  const LoginPage = React.lazy(() => import('../../pages/LoginPage'));
  
  return (
    <React.Suspense fallback={<LoadingScreen />}>
      <LoginPage onLoginSuccess={onLoginSuccess} />
    </React.Suspense>
  );
};