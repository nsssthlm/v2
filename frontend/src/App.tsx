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

// Inner component that uses the AuthContext
function AppRoutes() {
  const { authState } = useAuth();
  const { isAuthenticated, loading } = authState;

  // Login success callback (no longer needed but kept for compatibility)
  const handleLoginSuccess = () => {
    // Login is now handled by the AuthContext
  };

  // Skydda rutter som kräver inloggning
  const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    if (loading) {
      return (
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
    }
    
    if (!isAuthenticated) return <Navigate to="/login" />;
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" /> : <LoginPage onLoginSuccess={handleLoginSuccess} />
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
  );
}

// Main App component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
