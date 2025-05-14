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
import DescriptionIcon from '@mui/icons-material/Description';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PDFList from '../components/workspace/PDFList';
import PDFViewer from '../components/workspace/PDFViewer';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

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

// Import the PDF document type
interface PDFDocument {
  id: number;
  title: string;
  description: string;
  file_url: string;
  version: number;
  size: number;
  uploaded_by_details: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

const Workspace: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<number>(0);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPDF, setSelectedPDF] = useState<PDFDocument | null>(null);
  
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      
      setLoading(true);
      try {
        const response = await axios.get(`/api/projects/${projectId}/`);
        setProject(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Failed to load project. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [projectId]);
  
  const handleTabChange = (event: React.SyntheticEvent | null, newValue: number) => {
    setActiveTab(newValue);
  };
  
  const handleOpenPDF = (pdf: PDFDocument) => {
    setSelectedPDF(pdf);
  };
  
  const handleClosePDF = () => {
    setSelectedPDF(null);
  };
  
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
          onChange={handleTabChange}
          aria-label="Workspace tabs"
        >
          <TabList>
            <Tab startDecorator={<FolderIcon />}>Filer</Tab>
            <Tab startDecorator={<DescriptionIcon />}>PDFer</Tab>
            <Tab startDecorator={<ListAltIcon />}>Wiki</Tab>
            <Tab startDecorator={<DashboardIcon />}>Dashboard</Tab>
          </TabList>
          
          <CardContent>
            <TabPanel value={0}>
              <Typography>Filträdvy kommer snart.</Typography>
            </TabPanel>
            
            <TabPanel value={1}>
              <PDFList 
                projectId={currentProjectId} 
                onOpenPDF={handleOpenPDF} 
              />
            </TabPanel>
            
            <TabPanel value={2}>
              <Typography>Wiki kommer snart.</Typography>
            </TabPanel>
            
            <TabPanel value={3}>
              <Typography>Dashboard kommer snart.</Typography>
            </TabPanel>
          </CardContent>
        </Tabs>
      </Card>
      
      {/* PDF Viewer Modal */}
      <PDFViewer 
        pdf={selectedPDF} 
        onClose={handleClosePDF} 
      />
    </Container>
  );
};

export default Workspace;