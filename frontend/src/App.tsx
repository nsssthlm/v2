import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import NoticeBoardPage from './pages/NoticeBoard';
import VaultPage from './pages/Vault';
import Workspace from './pages/Workspace';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFound';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, CircularProgress, Typography } from '@mui/joy';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Konfigurera axios för att automatiskt lägga till auth-token i alla anrop
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Kontrollera om användaren är inloggad när appen laddas
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      try {
        // Testa token genom att hämta projekt
        await axios.get('/api/projects/');
        setIsAuthenticated(true);
      } catch (error) {
        // Om tokenen är ogiltig, ta bort den
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Hantera inloggning
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
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
    <AuthProvider>
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
    </AuthProvider>
  );
}

export default App;
