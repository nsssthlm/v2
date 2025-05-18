import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Button, List, ListItem, ListItemContent, CircularProgress, Divider, Alert, Grid } from '@mui/joy';
import { API_BASE_URL } from '../../config';
import UploadDialog from '../../components/UploadDialog';
import SimplePDFViewer from '../../components/SimplePDFViewer';
import { usePDFDialog } from '../../contexts/PDFDialogContext';
import PDFUploader from '../../components/PDFUploader';

// Cache för mappdata för att minska inladdningstiden
const folderDataCache: Record<string, {data: any, timestamp: number}> = {};
const CACHE_EXPIRY = 10000; // 10 sekunder

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
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [folderData, setFolderData] = useState<FolderData | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  // PDF-visare via kontext
  const { openPDFDialog } = usePDFDialog();
  const [selectedPdf, setSelectedPdf] = useState<{ url: string; name: string, folderId: string } | null>(null);
  
  // Hantera klick på PDF-filer
  const handlePdfClick = (fileUrl: string, fileName: string) => {
    console.log("Öppnar PDF:", fileUrl, fileName);
    // Öppna PDF i vår dialogkontext istället
    openPDFDialog({
      initialUrl: fileUrl,
      filename: fileName,
      folderId: slug || ''
    });
  };

  const fetchFolderData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Kontrollera om vi har giltig data i cachen
      const now = Date.now();
      const cachedData = folderDataCache[slug];
      
      if (cachedData && (now - cachedData.timestamp < CACHE_EXPIRY)) {
        // Om data finns i cache och inte är för gammal, använd den
        setFolderData(cachedData.data);
        setLoading(false);
        return;
      }
      
      // Hämta data från API
      const response = await axios.get(`${API_BASE_URL}/files/web/${slug}/data/`);
      
      // Spara resultatet i cache
      folderDataCache[slug] = {
        data: response.data,
        timestamp: now
      };
      
      setFolderData(response.data);
    } catch (err: any) {
      console.error('Fel vid hämtning av mappdata:', err);
      setError(err.message || 'Ett fel uppstod vid hämtning av mappdata');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchFolderData();
    }
  }, [slug]);

  const handleUploadSuccess = () => {
    fetchFolderData();
  };

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
      {!selectedPdf ? (
        // Normal visning av mappinnehåll när ingen PDF är vald
        <>
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

          {/* Filer */}
          <Box sx={{ mb: 4 }}>
            <Typography level="h3" sx={{ mb: 2 }}>PDF Dokument</Typography>
            
            {folderData.files.length === 0 ? (
              <Typography level="body-sm" sx={{ fontStyle: 'italic' }}>
                Inga dokument finns i denna mapp.
              </Typography>
            ) : (
              <List>
                {folderData.files.map((file, index) => (
                  <ListItem key={`${file.name}-${index}`}>
                    <ListItemContent>
                      <Button
                        variant="plain"
                        color="neutral"
                        onClick={() => handlePdfClick(file.file, file.name)}
                        sx={{ 
                          justifyContent: 'flex-start', 
                          textAlign: 'left', 
                          gap: 1 
                        }}
                      >
                        <span style={{ color: '#3182ce' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
                          </svg>
                        </span>
                        {file.name}
                      </Button>
                    </ListItemContent>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {/* Hanteringsalternativ */}
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <PDFUploader
              folderId={slug}
              onUploadSuccess={handleUploadSuccess}
            />
          </Box>
        </>
      ) : (
        // Visa den nya PDF-läsaren när en PDF är vald
        <Box sx={{ 
          height: 'calc(100vh - 120px)', 
          width: '100%', 
          position: 'relative',
          mb: 2
        }}>
          <Box sx={{ position: 'absolute', top: -8, left: 0, zIndex: 10 }}>
            <Button 
              variant="outlined" 
              color="neutral"
              size="sm"
              onClick={() => setSelectedPdf(null)}
              sx={{ mb: 1 }}
            >
              &larr; Tillbaka till {folderData.name}
            </Button>
          </Box>
          
          <SimplePDFViewer
            initialUrl={selectedPdf.url}
            filename={selectedPdf.name}
            onClose={() => setSelectedPdf(null)}
          />
        </Box>
      )}
      
      {/* Upload Dialog */}
      <UploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        folderSlug={slug}
        onSuccess={handleUploadSuccess}
      />
    </Box>
  );
};

export default FolderPage;