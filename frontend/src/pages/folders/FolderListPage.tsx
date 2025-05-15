import { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, List, ListItem, ListItemContent, CircularProgress, Alert } from '@mui/joy';
import { DIRECT_API_URL } from '../../config';

interface Folder {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
}

const FolderListPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    const fetchFolders = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${DIRECT_API_URL}/files/directories/`);
        
        // API svarar med en results-array om pagination är aktiverad
        const data = response.data.results || response.data;
        
        // Filtrera för att bara visa toppnivåmappar
        const rootFolders = data.filter((folder: Folder) => folder.parent === null);
        
        setFolders(rootFolders);
      } catch (err: any) {
        console.error('Fel vid hämtning av mappar:', err);
        setError(err.message || 'Ett fel uppstod vid hämtning av mappar');
      } finally {
        setLoading(false);
      }
    };

    fetchFolders();
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
      <Typography level="h2" sx={{ mb: 3 }}>Mappar</Typography>
      
      {folders.length === 0 ? (
        <Typography level="body-sm" sx={{ fontStyle: 'italic' }}>
          Inga mappar har skapats ännu.
        </Typography>
      ) : (
        <List>
          {folders.map((folder) => (
            <ListItem key={folder.id}>
              <ListItemContent>
                <a 
                  href={`/folders/${folder.slug}`} 
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                >
                  <span style={{ marginRight: '8px', color: '#e3a008' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                    </svg>
                  </span>
                  {folder.name}
                </a>
              </ListItemContent>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default FolderListPage;