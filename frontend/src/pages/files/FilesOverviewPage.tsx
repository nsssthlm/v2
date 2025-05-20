import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress, 
  Alert,
  Stack
} from '@mui/joy';
import { API_BASE_URL } from '../../config';

interface DirectoryData {
  id: number | string;
  name: string;
  slug: string;
  description: string | null;
  files_count: number;
  subdirectories_count: number;
}

const FilesOverviewPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [directories, setDirectories] = useState<DirectoryData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDirectories = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${API_BASE_URL}/files/directories/`);
        // Vi behåller bara rot-mappar här (de utan förälder)
        const rootDirs = response.data.results.filter((dir: any) => dir.parent === null);
        setDirectories(rootDirs);
      } catch (err: any) {
        console.error('Fel vid hämtning av mappar:', err);
        setError(err.message || 'Ett fel uppstod vid hämtning av mapplistan');
      } finally {
        setLoading(false);
      }
    };

    fetchDirectories();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert color="danger" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography level="h2" sx={{ mb: 4 }}>Alla PDF-dokument</Typography>
      
      <Typography level="body-lg" sx={{ mb: 3 }}>
        Välj en mapp nedan för att se dess PDF-filer. Klicka på en PDF för att visa den direkt i gränssnittet.
      </Typography>
      
      {directories.length === 0 ? (
        <Alert color="neutral" sx={{ mb: 2 }}>
          Inga mappar hittades. Skapa en ny mapp för att börja hantera filer.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {directories.map((directory) => (
            <Grid xs={12} sm={6} md={4} key={directory.id}>
              <Card 
                variant="outlined" 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 20px -10px rgba(0, 0, 0, 0.1)'
                  }
                }}
                onClick={() => navigate(`/folders/${directory.slug}`)}
              >
                <CardContent>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <span style={{ color: '#f59e0b' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                        </svg>
                      </span>
                      <Typography level="title-lg">{directory.name}</Typography>
                    </Box>
                    
                    {directory.description && (
                      <Typography level="body-sm">
                        {directory.description}
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Typography level="body-sm">
                        {directory.files_count || 0} PDF-filer
                      </Typography>
                      
                      {directory.subdirectories_count > 0 && (
                        <Typography level="body-sm">
                          {directory.subdirectories_count} undermappar
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default FilesOverviewPage;