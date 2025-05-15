import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Button, List, ListItem, ListItemContent, CircularProgress, Divider, Alert } from '@mui/joy';
import { API_BASE_URL } from '../../config';

interface FolderData {
  name: string;
  description: string | null;
  page_title: string | null;
  parent_name?: string;
  parent_slug?: string;
  subfolders: {
    name: string;
    slug: string;
  }[];
  files: {
    name: string;
    file: string;
    uploaded_at: string;
  }[];
}

const FolderPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [folderData, setFolderData] = useState<FolderData | null>(null);

  useEffect(() => {
    const fetchFolderData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${API_BASE_URL}/files/web/${slug}/data/`);
        setFolderData(response.data);
      } catch (err: any) {
        console.error('Fel vid hämtning av mappdata:', err);
        setError(err.message || 'Ett fel uppstod vid hämtning av mappdata');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchFolderData();
    }
  }, [slug]);

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

  if (!folderData) {
    return (
      <Alert color="warning" sx={{ mb: 2 }}>
        Ingen information hittades för den här mappen.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Brödsmulor */}
      <Box sx={{ display: 'flex', mb: 2, fontSize: '0.85rem' }}>
        <Typography level="body-sm" sx={{ color: 'primary.500' }}>
          <Link to="/folders" style={{ textDecoration: 'none' }}>Mappar</Link>
        </Typography>
        
        {folderData.parent_slug && (
          <>
            <Typography level="body-sm" sx={{ mx: 0.5 }}>/</Typography>
            <Typography level="body-sm" sx={{ color: 'primary.500' }}>
              <Link to={`/folders/${folderData.parent_slug}`} style={{ textDecoration: 'none' }}>
                {folderData.parent_name}
              </Link>
            </Typography>
          </>
        )}
        
        <Typography level="body-sm" sx={{ mx: 0.5 }}>/</Typography>
        <Typography level="body-sm">{folderData.name}</Typography>
      </Box>

      {/* Rubrik och beskrivning */}
      <Box sx={{ mb: 4 }}>
        <Typography level="h2">{folderData.page_title || folderData.name}</Typography>
        {folderData.description && (
          <Typography sx={{ mt: 1 }}>{folderData.description}</Typography>
        )}
      </Box>

      {/* Undermappar */}
      {folderData.subfolders.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography level="h3" sx={{ mb: 2 }}>Undermappar</Typography>
          <List>
            {folderData.subfolders.map((subfolder) => (
              <ListItem key={subfolder.slug}>
                <ListItemContent>
                  <Link 
                    to={`/folders/${subfolder.slug}`} 
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                  >
                    <span style={{ marginRight: '8px', color: '#e3a008' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                      </svg>
                    </span>
                    {subfolder.name}
                  </Link>
                </ListItemContent>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Filer */}
      <Box sx={{ mb: 4 }}>
        <Typography level="h3" sx={{ mb: 2 }}>PDF Dokument</Typography>
        
        {folderData.files.length === 0 ? (
          <Typography level="body-sm" sx={{ fontStyle: 'italic' }}>
            Inga dokument finns i denna mapp.
          </Typography>
        ) : (
          <List>
            {folderData.files.map((file) => (
              <ListItem key={file.name}>
                <ListItemContent>
                  <a 
                    href={file.file} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                  >
                    <span style={{ marginRight: '8px', color: '#3182ce' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
                      </svg>
                    </span>
                    {file.name}
                  </a>
                </ListItemContent>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Hanteringsalternativ */}
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          variant="outlined" 
          color="neutral"
          onClick={() => navigate(`/folders/${slug}/edit`)}
        >
          Redigera sida
        </Button>
        <Button 
          variant="solid" 
          color="primary"
          onClick={() => navigate(`/folders/${slug}/upload`)}
        >
          Ladda upp PDF
        </Button>
      </Box>
    </Box>
  );
};

export default FolderPage;