import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Select,
  Option,
  Stack,
  Alert,
  Button
} from '@mui/joy';
import FolderIcon from '@mui/icons-material/Folder';
import ArticleIcon from '@mui/icons-material/Article';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import StorageIcon from '@mui/icons-material/Storage';
import { useParams, useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import axios from 'axios';

// Import workspace components
import FileTree from '../components/workspace/FileTree';
import FileViewer from '../components/workspace/FileViewer';
import WikiView from '../components/workspace/WikiView';
import PDFViewer from '../components/workspace/PDFViewer';
import Dashboard from '../components/workspace/Dashboard';

interface Project {
  id: number;
  name: string;
  description: string;
}

interface FileNode {
  id: number;
  name: string;
  type: string;
  project: number;
  parent: number | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}

const Workspace: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { "*": path } = useParams<{ "*": string }>();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Parse querystring for project and file IDs
  const searchParams = new URLSearchParams(location.search);
  const projectIdParam = searchParams.get('project');
  const fileIdParam = searchParams.get('file');
  
  // Determine active tab based on the current route
  const getActiveTab = () => {
    if (path === undefined || path === '') return 0; // Main workspace view (files)
    if (path.startsWith('wiki')) return 1;
    if (path.startsWith('pdf')) return 2;
    return 0;
  };
  
  // Fetch available projects
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/projects/');
        setProjects(response.data);
        
        // If projectIdParam is specified, select that project
        if (projectIdParam && response.data.length > 0) {
          const project = response.data.find(
            (p: Project) => p.id === parseInt(projectIdParam)
          );
          if (project) {
            setSelectedProject(project);
          } else {
            // If project not found but we have projects, select the first one
            setSelectedProject(response.data[0]);
          }
        } else if (response.data.length > 0) {
          // Otherwise, select the first project
          setSelectedProject(response.data[0]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, [projectIdParam]);
  
  // Fetch selected file when file ID changes in URL
  useEffect(() => {
    if (!fileIdParam || !selectedProject) {
      setSelectedFile(null);
      return;
    }
    
    const fetchFile = async () => {
      try {
        const response = await axios.get(`/api/workspace/files/${fileIdParam}/`);
        setSelectedFile(response.data);
      } catch (err) {
        console.error('Error fetching file:', err);
        setSelectedFile(null);
      }
    };
    
    fetchFile();
  }, [fileIdParam, selectedProject]);
  
  const handleProjectChange = (event: React.SyntheticEvent | null, newValue: string | null) => {
    if (!newValue) return;
    
    const projectId = parseInt(newValue);
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      navigate(`/workspace?project=${projectId}`);
    }
  };
  
  const handleTabChange = (event: React.SyntheticEvent | null, newValue: number) => {
    if (newValue === 0) navigate(`/workspace${selectedProject ? `?project=${selectedProject.id}` : ''}`);
    if (newValue === 1) navigate(`/workspace/wiki${selectedProject ? `?project=${selectedProject.id}` : ''}`);
    if (newValue === 2) navigate(`/workspace/pdf${selectedProject ? `?project=${selectedProject.id}` : ''}`);
  };
  
  const handleFileSelect = (file: FileNode) => {
    setSelectedFile(file);
    navigate(`/workspace?project=${selectedProject?.id}&file=${file.id}`);
  };
  
  if (loading && !selectedProject) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!selectedProject && projects.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert color="warning" sx={{ mb: 2 }}>
          No projects available. Create a project to use the workspace.
        </Alert>
        <Button 
          color="primary" 
          variant="solid" 
          onClick={() => navigate('/new-project')}
        >
          Create Project
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 0 }}>
      {error && (
        <Alert color="danger" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Project selector */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <Typography level="title-lg">Project Workspace:</Typography>
          
          <Select
            value={selectedProject?.id.toString() || ''}
            onChange={handleProjectChange}
            sx={{ minWidth: 200 }}
          >
            {projects.map((project) => (
              <Option key={project.id} value={project.id.toString()}>
                {project.name}
              </Option>
            ))}
          </Select>
        </Stack>
      </Box>
      
      {/* Main content with tabs */}
      <Tabs 
        value={getActiveTab()}
        onChange={handleTabChange}
        sx={{ bgcolor: 'background.surface' }}
      >
        <TabList>
          <Tab startDecorator={<StorageIcon />}>Files & Dashboard</Tab>
          <Tab startDecorator={<ArticleIcon />}>Wiki</Tab>
          <Tab startDecorator={<PictureAsPdfIcon />}>PDF Documents</Tab>
        </TabList>
        
        {/* Files & Dashboard */}
        <TabPanel value={0}>
          <Routes>
            <Route path="/" element={
              path === '' || path === undefined ? (
                <Grid container spacing={2}>
                  <Grid xs={12}>
                    {/* Dashboard at the top */}
                    <Dashboard projectId={selectedProject?.id || 0} />
                  </Grid>
                  <Grid xs={12} md={4}>
                    {/* File tree on the left */}
                    <Card variant="outlined">
                      <CardContent>
                        <Typography level="title-lg" startDecorator={<FolderIcon />} sx={{ mb: 2 }}>
                          Files
                        </Typography>
                        <FileTree 
                          projectId={selectedProject?.id || 0} 
                          onNodeSelect={handleFileSelect} 
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid xs={12} md={8}>
                    {/* File viewer on the right */}
                    <FileViewer fileNode={selectedFile} />
                  </Grid>
                </Grid>
              ) : null
            } />
          </Routes>
        </TabPanel>
        
        {/* Wiki */}
        <TabPanel value={1}>
          <Routes>
            <Route path="/wiki/*" element={
              <WikiView projectId={selectedProject?.id || 0} />
            } />
          </Routes>
        </TabPanel>
        
        {/* PDF Documents */}
        <TabPanel value={2}>
          <Routes>
            <Route path="/pdf/*" element={
              <PDFViewer projectId={selectedProject?.id || 0} />
            } />
          </Routes>
        </TabPanel>
      </Tabs>
    </Box>
  );
};

export default Workspace;