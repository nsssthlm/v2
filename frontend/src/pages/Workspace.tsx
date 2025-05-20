import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Card, 
  CardContent, 
  Tab, 
  TabList, 
  Tabs, 
  TabPanel, 
  Breadcrumbs, 
  Link, 
  CircularProgress,
  Alert
} from '@mui/joy';
import FolderIcon from '@mui/icons-material/Folder';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

interface Project {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const Workspace: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<number>(0); // Set to Files tab by default
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        if (projectId) {
          console.log('Fetching project data for ID:', projectId);
          // Use our configured API client with auth headers
          const response = await api.get(`/projects/${projectId}/`);
          console.log('Project data:', response.data);
          setProject(response.data);
          setError(null);
        } else {
          // If no projectId, fetch all projects and use the first one
          console.log('No project ID provided, fetching all projects');
          const response = await api.get('/projects/');
          if (response.data && response.data.length > 0) {
            console.log('Found projects:', response.data);
            const firstProject = response.data[0];
            setProject(firstProject);
            // Redirect to project-specific workspace
            navigate(`/workspace/${firstProject.id}`);
          } else {
            setError('Inga projekt hittades');
          }
        }
      } catch (err: any) {
        console.error("Error fetching project:", err);
        const errorMessage = err.response?.data?.detail || 
                          "Kunde inte ladda projekt. Vänligen försök igen senare.";
        setError(errorMessage);
        
        // If unauthorized, redirect to login
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [projectId, navigate]);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert color="danger">{error}</Alert>
      </Container>
    );
  }

  // Default to project ID 1 if none is provided
  const currentProjectId = projectId ? parseInt(projectId) : 1;
  
  return (
    <Container maxWidth="xl" sx={{ mt: 3 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link href="/">Projekt</Link>
        {project && <Typography>{project.name}</Typography>}
        <Typography>Workspace</Typography>
      </Breadcrumbs>
      
      <Typography level="h3" sx={{ mb: 3 }}>
        Workspace {project ? `- ${project.name}` : ''}
      </Typography>
      
      <Card variant="outlined">
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val as number)}
          aria-label="Workspace tabs"
        >
          <TabList>
            <Tab>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FolderIcon />
                <span>Filer</span>
              </Box>
            </Tab>
            <Tab>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ListAltIcon />
                <span>Wiki</span>
              </Box>
            </Tab>
            <Tab>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DashboardIcon />
                <span>Dashboard</span>
              </Box>
            </Tab>
          </TabList>
          
          <CardContent>
            <TabPanel value={0}>
              <Typography>Filträdvy kommer snart.</Typography>
            </TabPanel>
            
            <TabPanel value={1}>
              <Typography>Wiki kommer snart.</Typography>
            </TabPanel>
            
            <TabPanel value={2}>
              <Typography>Dashboard kommer snart.</Typography>
            </TabPanel>
          </CardContent>
        </Tabs>
      </Card>
    </Container>
  );
};

export default Workspace;