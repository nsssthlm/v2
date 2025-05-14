import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import NoticeBoardPage from './pages/NoticeBoard';
import VaultPage from './pages/Vault';
import Workspace from './pages/Workspace';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFound';
import { Box, CircularProgress, Typography } from '@mui/joy';
import { useState, useEffect } from 'react';

// Helper component for loading state
const LoadingScreen = () => (
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

// Define the ProtectedRoute component outside of the main App function
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { authState } = useAuth();
  
  if (authState.loading) {
    return <LoadingScreen />;
  }
  
  if (!authState.isAuthenticated) return <Navigate to="/login" />;
  return children;
};

// Define a component that handles the login page with auth checking
const AuthLoginRoute = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => {
  const { authState } = useAuth();
  
  if (authState.loading) {
    return <LoadingScreen />;
  }
  
  if (authState.isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return <LoginPage onLoginSuccess={onLoginSuccess} />;
};

// The main App component doesn't access context directly
function App() {
  // Handle login success - can be empty now as AuthContext handles the state
  const handleLoginSuccess = () => {
    console.log('Login successful');
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            <AuthLoginRoute onLoginSuccess={handleLoginSuccess} />
          } />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/calendar" element={
            <ProtectedRoute>
              <Layout>
                <Calendar />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/notice-board" element={
            <ProtectedRoute>
              <Layout>
                <NoticeBoardPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/vault" element={
            <ProtectedRoute>
              <Layout>
                <VaultPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/workspace/*" element={
            <ProtectedRoute>
              <Layout>
                <Workspace />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
