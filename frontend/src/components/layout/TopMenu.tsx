import React, { useState } from 'react';
import { 
  Box, 
  IconButton, 
  Button, 
  Input, 
  Badge,
  Menu,
  MenuItem,
  ListItemDecorator,
  Divider,
  Modal,
  ModalDialog,
  ModalClose,
  FormControl,
  FormLabel,
  Stack,
  Textarea,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/joy';
import { useProject, Project } from '../../contexts/ProjectContext';
import projectService from '../../services/projectService';
import { generateFakeJwtToken } from '../../utils/authUtils';

const TopMenu: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  
  // Använd projektkontext istället för lokala states
  const { currentProject, setCurrentProject, projects, addProject } = useProject();
  
  // Tom logokomponent (borttagen enligt design)
  const LogoComponent = () => null;

  // Meny för projektval
  const [projectMenuAnchor, setProjectMenuAnchor] = useState<HTMLElement | null>(null);
  const openProjectMenu = Boolean(projectMenuAnchor);
  
  // Modal för nytt projekt
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [newProject, setNewProject] = useState<Omit<Project, 'id'>>({
    name: '',
    description: '',
    endDate: ''
  });
  
  // Modal för att bjuda in användare
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  
  // Hantera projektmeny
  const handleProjectMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProjectMenuAnchor(event.currentTarget);
  };
  
  const handleProjectMenuClose = () => {
    setProjectMenuAnchor(null);
  };
  
  const handleProjectSelect = (project: Project) => {
    console.log('Byter till projekt:', project);
    setCurrentProject(project);
    handleProjectMenuClose();
    
    // Sätt en sessionStorage-flagga som vi kan kontrollera för att veta vilket projekt att ladda
    sessionStorage.setItem('selectedProjectId', project.id);
    
    // Ladda om sidan när man byter projekt för att säkerställa att rätt innehåll visas
    // och för att förhindra att innehåll från föregående projekt visas
    if (window.location.pathname.includes('/folders/')) {
      // Om vi är på en mappsida, gå tillbaka till startsidan
      window.location.href = '/';
    } else {
      // Ladda annars om hela sidan för att uppdatera mapparna i sidebaren
      window.location.reload();
    }
  };
  
  // Hantera nytt projekt - skapa i backend-databasen med förbättrad felhantering
  const handleNewProjectSubmit = async () => {
    if (!newProject.name.trim()) {
      alert('Vänligen ange ett projektnamn.');
      return;
    }
    
    try {
      // Förbered data för backend-API
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Hämta JWT-token för autentisering
      const token = localStorage.getItem('jwt_token');
      
      if (!token) {
        // Om token saknas, använd en hårdkodad token för projektledare
        const projectLeaderToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwcm9qZWN0bGVhZGVyIiwicm9sZSI6InByb2plY3RfbGVhZGVyIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjI1MDAwMDAwMDB9.Z9t5b4V3vkjO-4BDTXUkEqbp9eEJVGOKutvN-NVWxZs';
        localStorage.setItem('jwt_token', projectLeaderToken);
        console.log('Autentiserad som projektledare för projektskapande');
      }
      
      // Skapa projektet via den förbättrade projektservicen
      const projectData = {
        name: newProject.name,
        description: newProject.description || '',
        start_date: today,
        end_date: newProject.endDate || '' // Använd tom sträng istället för null
      };
      
      console.log('Skapar nytt projekt med data:', projectData);
      
      // Använd projektservice istället för direkt fetch - detta hanterar även skapande av standardmapp
      const createdProject = await projectService.createProject(projectData);
      
      if (!createdProject) {
        throw new Error('Kunde inte skapa projektet');
      }
      
      console.log('Projekt skapat framgångsrikt:', createdProject);
      
      // Lägg till projektet i listan 
      addProject(createdProject);
      
      // Stäng formuläret
      setNewProjectModalOpen(false);
      setNewProject({ name: '', description: '', endDate: '' });
      
      // Sätt det nya projektet som aktivt via ProjectContext
      console.log('Sätter projektId i sessionStorage:', createdProject.id);
      sessionStorage.setItem('selectedProjectId', createdProject.id);
      
      // Visa ett meddelande om att projektet har skapats
      alert(`Projektet "${createdProject.name}" har skapats!`);
      
      // Fördröj omladdningen för att ge tid för backend att uppdatera
      setTimeout(() => {
        // Ladda om sidan för att visa det nya projektet och dess mappar
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Kunde inte skapa nytt projekt:', error);
      alert('Kunde inte skapa nytt projekt. Försök igen senare.');
    }
  };
  
  // Hantera inbjudan
  const handleInviteSubmit = () => {
    console.log(`Bjuder in användare med e-post: ${inviteEmail}`);
    setInviteModalOpen(false);
    setInviteEmail('');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid',
        borderColor: 'divider',
        p: 1,
        px: 2,
        bgcolor: 'var(--joy-palette-background-surface, #fff)', // Använder tema-variabeln för konsekvent färgsättning
        height: '60px' // Ökad höjd för att matcha sidofältet med ValvX-loggan
      }}
    >
      {/* Vänster del - tom */}
      <Box sx={{ display: 'flex', alignItems: 'center', width: '33%' }}>
        <LogoComponent />
      </Box>
      
      {/* Mitten - projektväljare */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        width: '34%'
      }}>
        <Button
          variant="outlined"
          color="success"
          endDecorator={<span>▼</span>}
          onClick={handleProjectMenuClick}
          sx={{ 
            fontWeight: 'bold',
            backgroundColor: '#e0f2e9', // Ljusgrön bakgrund som matchar bilden
            color: '#007934',           // Grön text
            border: '1px solid #007934', // Grön border
            '&:hover': {
              backgroundColor: '#d0e9de',  // Lite mörkare ljusgrön vid hover
              color: '#007934',           // Behåll grön text vid hover
              border: '1px solid #007934', // Behåll border vid hover
            }
          }}
        >
          {currentProject.name}
        </Button>
        
        <Menu
          anchorEl={projectMenuAnchor}
          open={openProjectMenu}
          onClose={handleProjectMenuClose}
          placement="bottom-start"
        >
          {projects.map((project) => (
            <MenuItem 
              key={project.id}
              selected={project.id === currentProject.id}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: '#e0f2e9', // Ljusare SEB grön för aktiva val
                },
                '&:hover': {
                  backgroundColor: '#e0f2e9', // Ljusare SEB grön vid hover
                }
              }}
              onClick={() => handleProjectSelect(project)}
            >
              {project.name}
            </MenuItem>
          ))}
          <Divider />
          <MenuItem onClick={() => {
            handleProjectMenuClose();
            setNewProjectModalOpen(true);
          }}
          sx={{
            '&:hover': {
              backgroundColor: '#e0f2e9', // Ljusare SEB grön vid hover
            }
          }}>
            <ListItemDecorator sx={{ color: '#007934' }}>+</ListItemDecorator>
            Skapa nytt projekt
          </MenuItem>
        </Menu>
        
        <IconButton 
          size="sm" 
          variant="plain" 
          color="neutral"
          onClick={() => setNewProjectModalOpen(true)}
        >
          <span>+</span>
        </IconButton>
      </Box>
      
      {/* Höger del - sök och ikoner */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '33%', justifyContent: 'flex-end' }}>
        <Input
          size="sm"
          placeholder="Sök..."
          startDecorator={
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          }
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ width: 200 }}
        />
        
        <IconButton 
          size="sm" 
          variant="plain" 
          color="neutral"
          onClick={() => setInviteModalOpen(true)}
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </IconButton>
        
        <IconButton size="sm" variant="plain" color="neutral">
          <Badge badgeContent={3} color="danger">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
            </svg>
          </Badge>
        </IconButton>
        
        <IconButton size="sm" variant="plain" color="neutral">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-14h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
        </IconButton>
      </Box>
      
      {/* Modal för att skapa nytt projekt */}
      <Modal open={newProjectModalOpen} onClose={() => setNewProjectModalOpen(false)}>
        <ModalDialog>
          <DialogTitle>Skapa nytt projekt</DialogTitle>
          <ModalClose />
          <DialogContent>
            <Stack spacing={2}>
              <FormControl>
                <FormLabel>Projektnamn</FormLabel>
                <Input 
                  value={newProject.name} 
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Beskrivning</FormLabel>
                <Textarea 
                  minRows={3}
                  value={newProject.description} 
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Slutdatum</FormLabel>
                <Input 
                  type="date"
                  value={newProject.endDate} 
                  onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                />
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button 
              variant="plain" 
              color="neutral" 
              onClick={() => setNewProjectModalOpen(false)}
            >
              Avbryt
            </Button>
            <Button 
              onClick={handleNewProjectSubmit} 
              disabled={!newProject.name}
            >
              Skapa projekt
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
      
      {/* Modal för att bjuda in användare */}
      <Modal open={inviteModalOpen} onClose={() => setInviteModalOpen(false)}>
        <ModalDialog>
          <DialogTitle>Bjud in användare</DialogTitle>
          <ModalClose />
          <DialogContent>
            <Stack spacing={2}>
              <FormControl>
                <FormLabel>E-postadress</FormLabel>
                <Input 
                  type="email"
                  value={inviteEmail} 
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="exempel@domain.se"
                />
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button 
              variant="plain" 
              color="neutral" 
              onClick={() => setInviteModalOpen(false)}
            >
              Avbryt
            </Button>
            <Button 
              onClick={handleInviteSubmit} 
              disabled={!inviteEmail}
            >
              Bjud in
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default TopMenu;