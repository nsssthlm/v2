import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import NotFoundPage from './pages/NotFoundPage';
import { ProjectProvider } from './contexts/ProjectContext';
import { PDFDialogProvider } from './contexts/PDFDialogContext';
import { AuthProvider } from './contexts/AuthContext';
import theme from './theme'; // Importera vårt anpassade SEB-tema
import { useEffect } from 'react';

// Vault pages
import HomePage from './pages/vault/home/HomePage';
import CommentsPage from './pages/vault/comments/CommentsPage';
import ReviewPage from './pages/vault/review/ReviewPage';
import FilesPage from './pages/vault/files/FilesPage';
import VersionsPage from './pages/vault/versions/VersionsPage';
import MeetingsPage from './pages/vault/meetings/MeetingsPage';

// Calendar page
import CalendarPage from './pages/dashboard/CalendarPage';

// Folder pages
import FolderListPage from './pages/folders/FolderListPage';
import FolderPage from './pages/folders/FolderPage';

// PDF hantering
import PDFViewerPage from './pages/PDFViewerPage';
import SimplePDFPage from './pages/SimplePDFPage';
import SimpleDirectPDFPage from './pages/SimpleDirectPDFPage';
import PDFTestPage from './components/PDFTestPage';
import DemoPDFView from './pages/DemoPDFView';

// Auth pages
import LoginPage from './pages/auth/LoginPage';

// Komponent för att fånga och hantera navigeringshändelser från sidomenyn
const NavigationHandler = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Lyssna efter anpassad navigeringshändelse från sidomenyn
    const handleFolderNavigation = (event: CustomEvent) => {
      if (event.detail?.url) {
        console.log("NavigationHandler: Fångar navigering till", event.detail.url);
        
        // Hämta och återställ tokens från sessionStorage om det behövs
        const allTokensStr = sessionStorage.getItem('all_auth_tokens');
        if (allTokensStr) {
          try {
            const allTokens = JSON.parse(allTokensStr);
            
            // Återställ alla tokens till localStorage
            if (allTokens.jwt_token) localStorage.setItem('jwt_token', allTokens.jwt_token);
            if (allTokens.auth_token) localStorage.setItem('auth_token', allTokens.auth_token);
            if (allTokens.token) localStorage.setItem('token', allTokens.token);
            if (allTokens.csrftoken) localStorage.setItem('csrftoken', allTokens.csrftoken);
            if (allTokens.currentUser) localStorage.setItem('currentUser', allTokens.currentUser);
          } catch (e) {
            console.error("Fel vid återställning av tokens:", e);
          }
        }
        
        // Rensa pendingNavigation
        if ((window as any).pendingNavigation) {
          const targetUrl = (window as any).pendingNavigation;
          (window as any).pendingNavigation = null;
          
          // Använd React Router för navigering (håller React-tillståndet intakt)
          navigate(targetUrl);
        }
      }
    };
    
    // Lägg till lyssnare för vår anpassade händelse
    window.addEventListener('folderNavigationRequested', handleFolderNavigation as EventListener);
    
    return () => {
      // Ta bort lyssnare vid upprensning
      window.removeEventListener('folderNavigationRequested', handleFolderNavigation as EventListener);
    };
  }, [navigate]);
  
  // Denna komponent renderar ingenting synligt
  return null;
};

// The main App component doesn't access context directly
function App() {
  // Handle login success - can be empty now as AuthContext handles the state
  const handleLoginSuccess = () => {
    console.log('Login successful');
  };

  return (
    <CssVarsProvider theme={theme} defaultMode="light">
      <CssBaseline />
      <AuthProvider>
        <ProjectProvider>
          <PDFDialogProvider>
            <BrowserRouter>
              {/* Lägg till vår NavigationHandler för att fånga navigeringshändelser */}
              <NavigationHandler />
              
              <Routes>
                {/* Redirect root to login page */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                
                {/* Auth routes */}
                <Route path="/login" element={<LoginPage />} />
                
                {/* Protected routes with layout */}
                <Route element={<Layout />}>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="projects" element={<ComingSoonPage title="Projekt" />} />
                  <Route path="tasks" element={<ComingSoonPage title="Uppgifter" />} />
                  <Route path="files" element={<ComingSoonPage title="Dokument" />} />
                  <Route path="team" element={<ComingSoonPage title="Team" />} />
                  <Route path="settings" element={<ComingSoonPage title="Inställningar" />} />
                  
                  {/* Folder routes */}
                  <Route path="folders" element={<FolderListPage />} />
                  <Route path="folders/:slug" element={<FolderPage />} />
                  
                  {/* Nya dedikerade PDF-viewer sidor */}
                  <Route path="pdf-viewer" element={<PDFViewerPage />} />
                  <Route path="simple-pdf" element={<SimplePDFPage />} />
                  <Route path="direct-pdf" element={<SimpleDirectPDFPage />} />
                  <Route path="pdf-test" element={<PDFTestPage />} />
                  <Route path="demo-pdf" element={<DemoPDFView />} />
                  
                  {/* Vault routes */}
                  <Route path="vault">
                    <Route path="home" element={<HomePage />} />
                    <Route path="comments" element={<CommentsPage />} />
                    <Route path="review" element={<ReviewPage />} />
                    <Route path="files" element={<FilesPage />} />
                    <Route path="versions" element={<VersionsPage />} />
                    <Route path="meetings" element={<MeetingsPage />} />
                  </Route>
                </Route>
                
                {/* 404 route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </PDFDialogProvider>
        </ProjectProvider>
      </AuthProvider>
    </CssVarsProvider>
  );
}

// Simple component to show for routes not yet implemented
const ComingSoonPage = ({ title }: { title: string }) => (
  <div style={{ padding: '20px' }}>
    <h1>{title}</h1>
    <p>Denna sida är under utveckling och kommer snart.</p>
  </div>
);

export default App;