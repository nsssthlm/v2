import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Protected routes with layout */}
        <Route element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<ComingSoonPage title="Projekt" />} />
          <Route path="tasks" element={<ComingSoonPage title="Uppgifter" />} />
          <Route path="files" element={<ComingSoonPage title="Dokument" />} />
          <Route path="team" element={<ComingSoonPage title="Team" />} />
          <Route path="settings" element={<ComingSoonPage title="Inställningar" />} />
        </Route>
        
        {/* 404 route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
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
