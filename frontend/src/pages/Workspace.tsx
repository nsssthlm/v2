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
  Alert,
  Modal,
  ModalDialog,
  ModalClose,
  Sheet,
  Button
} from '@mui/joy';
import FolderIcon from '@mui/icons-material/Folder';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DescriptionIcon from '@mui/icons-material/Description';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PDFList from '../components/workspace/PDFList';
import PDFViewer from '../components/workspace/PDFViewer';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api';
import { PDFDocument } from '../types';

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
  
  const [activeTab, setActiveTab] = useState<number>(1); // Set to PDF tab by default
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPDF, setSelectedPDF] = useState<PDFDocument | null>(null);
  
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
  
  // Tab change is handled inline with the onChange handler
  
  const handleOpenPDF = (pdf: PDFDocument) => {
    console.log('Opening PDF:', pdf);
    // Force update with setTimeout to ensure state update is processed
    setTimeout(() => {
      setSelectedPDF(pdf);
      console.log('selectedPDF has been set to:', pdf.title);
    }, 0);
  };
  
  const handleClosePDF = () => {
    console.log('Closing PDF viewer');
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
                <DescriptionIcon />
                <span>PDFer</span>
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
      
      {/* PDF Viewer Modal - implemented directly in Workspace */}
      {selectedPDF && (
        <Modal
          open={true}
          onClose={handleClosePDF}
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1400
          }}
        >
          <ModalDialog 
            variant="outlined"
            layout="fullscreen" 
            sx={{ 
              p: 3, 
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxWidth: '80vw',
              maxHeight: '85vh',
              margin: 'auto',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <ModalClose />
            <Typography level="h4" sx={{ mb: 2 }}>
              {selectedPDF.title}
            </Typography>
            
            <Sheet 
              variant="outlined"
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                flex: 1,
                overflow: 'hidden',
                borderRadius: 'sm'
              }}
            >
              <Box sx={{ p: 2, mb: 2 }}>
                <Typography level="body-sm">
                  <strong>Filnamn:</strong> {selectedPDF.title}
                </Typography>
                <Typography level="body-sm">
                  <strong>Uppladdad av:</strong> {selectedPDF.uploaded_by_details.first_name} {selectedPDF.uploaded_by_details.last_name}
                </Typography>
                <Typography level="body-sm">
                  <strong>Uppladdad:</strong> {new Date(selectedPDF.created_at).toLocaleDateString('sv-SE')}
                </Typography>
                <Typography level="body-sm">
                  <strong>Filstorlek:</strong> {Math.round(selectedPDF.size / 1024 / 1024 * 10) / 10} MB
                </Typography>
              </Box>
              
              {/* Visa en knapp för att öppna PDF i ny flik istället för iframe */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                p: 4, 
                flex: 1,
                textAlign: 'center'
              }}>
                <Typography level="body-md" sx={{ mb: 3 }}>
                  PDF kan inte visas direkt i applikationen på grund av säkerhetsinställningar.
                </Typography>
                <Button 
                  variant="solid" 
                  color="primary" 
                  size="lg"
                  onClick={() => window.open(`http://0.0.0.0:8001${selectedPDF.file_url}`, '_blank', 'noopener,noreferrer')}
                >
                  Öppna PDF i nytt fönster
                </Button>
              </Box>
            </Sheet>
          </ModalDialog>
        </Modal>
      )}
    </Container>
  );
};

export default Workspace;