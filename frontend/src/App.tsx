import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import NotFoundPage from './pages/NotFoundPage';
import { ProjectProvider } from './contexts/ProjectContext';
import theme from './theme'; // Importera vårt anpassade SEB-tema

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
import FolderPageNew from './pages/folders/FolderPageNew';
import FolderListPage from './pages/folders/FolderListPage';
import GenericFolderView from './pages/folders/GenericFolderView';
import FilesOverviewPage from './pages/files/FilesOverviewPage';

// Tidsrapportering
import BasicTimeReportingPage from './pages/timereporting/BasicTimeReportingPage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';

// The main App component doesn't access context directly
function App() {
  // Handle login success - can be empty now as AuthContext handles the state
  const handleLoginSuccess = () => {
    console.log('Login successful');
  };

  return (
    <CssVarsProvider theme={theme} defaultMode="light">
      <CssBaseline />
      <ProjectProvider>
        <BrowserRouter>
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
              <Route path="files" element={<FilesOverviewPage />} />
              <Route path="team" element={<ComingSoonPage title="Team" />} />
              <Route path="settings" element={<ComingSoonPage title="Inställningar" />} />
              <Route path="timereporting" element={<BasicTimeReportingPage />} />
              
              {/* Folder routes */}
              <Route path="folders" element={<FolderListPage />} />
              <Route path="folders/:slug" element={<GenericFolderView />} />
              
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
      </ProjectProvider>
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