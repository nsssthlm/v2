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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Kontrollera om användaren är inloggad när appen laddas
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('/api/user/');
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Skydda rutter som kräver inloggning
  const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    if (loading) return <div>Laddar...</div>;
    if (!isAuthenticated) return <Navigate to="/login" />;
    return children;
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" /> : <LoginPage />
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
