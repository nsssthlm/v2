import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Card, 
  List,
  ListItem,
  ListItemContent,
  ListDivider,
  Button,
  IconButton,
  Stack
} from '@mui/joy';
import { 
  FileUpload as FileUploadIcon,
  Description as DescriptionIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useProject } from '../../contexts/ProjectContext';
import api from '../../services/api';

// Förenklad version för tidsrapportering
const SimpleTimeReportingPage = () => {
  const { activeProject } = useProject();
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Hämta data när komponenten monteras
    fetchData();
  }, [activeProject]);

  const fetchData = async () => {
    if (!activeProject?.id) return;
    
    // Kod för att hämta tidsrapporteringsdata
    try {
      // Simulera API-anrop
      console.log('Hämtar tidsrapportering för projekt:', activeProject.id);
      // const response = await api.get(`/api/timereporting/project/${activeProject.id}`);
      // Använd response.data här
    } catch (error) {
      console.error('Fel vid hämtning av tidsrapporteringsdata:', error);
    }
  };

  // Funktion för att hantera filuppladdning
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      const file = files[0];
      console.log('Fil uppladdad:', file.name);
      
      // Kod för att hantera filuppladdning
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', activeProject?.id?.toString() || '');
      
      // Simulera API-anrop för uppladdning
      // const response = await api.post('/api/timereporting/upload', formData);
      
      // Uppdatera listan efter uppladdning
      fetchData();
    } catch (error) {
      console.error('Fel vid filuppladdning:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography level="h1" component="h1" sx={{ mb: 4 }}>
        Tidsrapportering
      </Typography>

      <Card variant="outlined" sx={{ mb: 4, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography level="h3">Dokument</Typography>
          <Button
            component="label"
            color="primary"
            startDecorator={<FileUploadIcon />}
            disabled={isUploading}
          >
            Ladda upp dokument
            <input 
              type="file"
              hidden 
              onChange={handleFileUpload} 
            />
          </Button>
        </Box>
        
        <List>
          <ListItem>
            <ListItemContent>
              <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
                <DescriptionIcon sx={{ fontSize: 48, color: 'neutral.400' }} />
                <Typography level="body-sm" textAlign="center">
                  Inga dokument har laddats upp än.
                </Typography>
                <Button
                  component="label"
                  size="sm"
                  startDecorator={<FileUploadIcon />}
                >
                  Ladda upp dokument
                  <input 
                    type="file" 
                    hidden 
                    onChange={handleFileUpload} 
                  />
                </Button>
              </Stack>
            </ListItemContent>
          </ListItem>
        </List>
      </Card>

      <Card variant="outlined" sx={{ p: 3 }}>
        <Typography level="h3" sx={{ mb: 3 }}>Rapportera tid</Typography>
        <Stack spacing={2} sx={{ maxWidth: 600, mx: 'auto' }}>
          <Typography>
            Funktionalitet för tidsrapportering kommer att läggas till här.
          </Typography>
          <Button size="lg" color="primary">
            Skapa ny tidsrapport
          </Button>
        </Stack>
      </Card>
    </Container>
  );
};

export default SimpleTimeReportingPage;