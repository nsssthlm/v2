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
  Button,
  IconButton
} from '@mui/joy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SimplePDFViewer from '../components/workspace/SimplePDFViewer';
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
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    console.log('PDF loaded with', numPages, 'pages');
    setNumPages(numPages);
    setPageNumber(1);
  }
  
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
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                flex: 1,
                position: 'relative'
              }}>
                {/* Toolbar med knapp för att öppna i nytt fönster */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end',
                  padding: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}>
                  <IconButton 
                    variant="outlined" 
                    color="neutral"
                    onClick={() => window.open(`http://0.0.0.0:8001${selectedPDF.file_url}`, '_blank', 'noopener,noreferrer')}
                    title="Öppna i nytt fönster"
                  >
                    <OpenInNewIcon />
                  </IconButton>
                </Box>
                
                {/* PDF-visare med direkt inbäddad iframe */}
                <Box sx={{ 
                  flex: 1, 
                  overflow: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: 2
                }}>
                  <Box sx={{ 
                    width: '100%', 
                    height: '500px', 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <Typography color="danger" sx={{ mb: 2, display: 'flex', justifyContent: 'center', width: '100%' }}>
                      Kunde inte ladda PDF-filen. Försök öppna den i ett nytt fönster istället.
                    </Typography>
                    <Button 
                      onClick={() => window.open(`http://0.0.0.0:8001${selectedPDF.file_url}`, '_blank')}
                      variant="solid"
                      color="primary"
                      startDecorator={<OpenInNewIcon />}
                    >
                      Öppna i nytt fönster
                    </Button>
                  </Box>
                </Box>
                
                {/* Pagination ingår nu i SimplePDFViewer */}
              </Box>
            </Sheet>
          </ModalDialog>
        </Modal>
      )}
    </Container>
  );
};

export default Workspace;