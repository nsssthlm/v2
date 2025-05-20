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

// Enkel dokument-interface
interface Document {
  id: string;
  name: string;
  uploadDate: string;
  description?: string;
  uploadedBy: string;
}

// Förenklad tidsrapporteringssida utan PDF-hantering
const SimpleTimeReportingPage = () => {
  const { activeProject } = useProject();
  const [documentList, setDocumentList] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  useEffect(() => {
    // Hämta data när komponenten monteras eller projektet ändras
    if (activeProject?.id) {
      fetchData();
    }
  }, [activeProject]);

  const fetchData = async () => {
    try {
      // Simulera API-anrop för att hämta dokumentlista
      console.log('Hämtar dokument för projekt:', currentProject?.id);
      
      // Exempel på data som skulle hämtas från servern
      const dummyDocs: Document[] = [
        {
          id: '1',
          name: 'Tidsrapport Mars 2025',
          uploadDate: '2025-04-02',
          description: 'Månadsrapport för mars',
          uploadedBy: 'Anna Svensson'
        },
        {
          id: '2',
          name: 'Kvartalsrapport Q1 2025',
          uploadDate: '2025-04-15',
          description: 'Sammanställning av Q1',
          uploadedBy: 'Erik Johansson'
        }
      ];
      
      setDocumentList(dummyDocs);
    } catch (error) {
      console.error('Fel vid hämtning av dokumentlista:', error);
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
      
      // Förberett för filuppladdning
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', currentProject?.id?.toString() || '');
      
      // Simulera API-anrop för uppladdning
      // const response = await api.post('/api/timereporting/upload', formData);
      
      // Lägg till i listan för demo
      const newDoc: Document = {
        id: Date.now().toString(),
        name: file.name,
        uploadDate: new Date().toISOString().split('T')[0],
        description: 'Nytt dokument',
        uploadedBy: 'Aktuell användare'
      };
      
      setDocumentList(prevList => [...prevList, newDoc]);
    } catch (error) {
      console.error('Fel vid filuppladdning:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Funktion för att ta bort ett dokument
  const handleDelete = (id: string) => {
    // Simulera API-anrop för borttagning
    // await api.delete(`/api/timereporting/documents/${id}`);
    
    // Ta bort från listan
    setDocumentList(prevList => prevList.filter(doc => doc.id !== id));
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
          {documentList.length > 0 ? (
            documentList.map((doc, index) => (
              <React.Fragment key={doc.id}>
                {index > 0 && <ListDivider />}
                <ListItem
                  sx={{ 
                    py: 2
                  }}
                >
                  <ListItemContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <DescriptionIcon sx={{ color: 'primary.400', fontSize: 30 }} />
                        <Box>
                          <Typography level="title-sm">
                            {doc.name}
                          </Typography>
                          <Typography level="body-sm">
                            Uppladdad: {doc.uploadDate} • {doc.uploadedBy}
                          </Typography>
                          {doc.description && (
                            <Typography level="body-sm" color="neutral">
                              {doc.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <IconButton 
                        variant="plain" 
                        color="neutral" 
                        size="sm"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItemContent>
                </ListItem>
              </React.Fragment>
            ))
          ) : (
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
          )}
        </List>
      </Card>

      <Card variant="outlined" sx={{ p: 3 }}>
        <Typography level="h3" sx={{ mb: 3 }}>Registrera tid</Typography>
        <Stack spacing={2} sx={{ maxWidth: 600, mx: 'auto' }}>
          <Typography>
            Här kommer du kunna registrera arbetstimmar för specifika aktiviteter i projektet.
          </Typography>
          <Button size="lg" color="primary">
            Registrera ny tidsrapport
          </Button>
        </Stack>
      </Card>
    </Container>
  );
};

export default SimpleTimeReportingPage;