import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Button, List, ListItem, ListItemContent, CircularProgress, Divider, Alert, Grid, IconButton, Tooltip } from '@mui/joy';
import { API_BASE_URL } from '../../config';
import UploadDialog from '../../components/UploadDialog';
import UltimatePDFDialog from '../../components/UltimatePDFDialog';
import { usePDFDialog } from '../../contexts/PDFDialogContext';
import PDFUploader from '../../components/PDFUploader';
import DeleteIcon from '@mui/icons-material/Delete';
import { useProject } from '../../contexts/ProjectContext';

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
    id?: string;
    name: string;
    file: string;
    uploaded_at: string;
    uploaded_by?: string;
    description?: string;
    version?: number;
  }[];
}

const FolderPage = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [folderData, setFolderData] = useState<FolderData | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // PDF-visare via kontext
  const { openPDFDialog } = usePDFDialog();
  const [selectedPdf, setSelectedPdf] = useState<{ url: string; name: string, folderId: string } | null>(null);
  
  // Projektkontexten för nuvarande användare
  const projectContext = useProject();
  
  // Hantera klick på PDF-filer - öppna i vår förbättrade dialogruta
  const handlePdfClick = (fileUrl: string, fileName: string, fileId: string) => {
    console.log("Öppnar PDF:", fileUrl, fileName, "FileID:", fileId);
    
    // Skapa olika URL-varianter för att öka chansen att PDF:en visas korrekt
    let pdfUrl = fileUrl;
    
    // Kontrollera om URL:en innehåller projektfilssökvägar - förbered då en direkt media-URL
    if (fileUrl.includes('project_files')) {
      // Försök extrahera datum och filnamn för att skapa en direkt mediasökväg
      const mediaUrlPattern = /project_files\/(\d{4})\/(\d{2})\/(\d{2})\/([^?]+)/;
      const match = fileUrl.match(mediaUrlPattern);
      
      if (match) {
        const [fullMatch, year, month, day, filename] = match;
        const directMediaUrl = `/media/project_files/${year}/${month}/${day}/${filename}`;
        console.log("Använda direkt media-URL:", directMediaUrl);
        pdfUrl = directMediaUrl;
      }
    }
    
    console.log("Använder final PDF URL:", pdfUrl);
    
    // Logga projektkontext och aktuell slug för felsökning
    console.log("PDF Debug:", { 
      currentProject: projectContext.currentProject 
    });
    
    // Sätt selected PDF för att visa i SuperReliablePDFDialog som har maximal kompatibilitet
    setSelectedPdf({
      url: pdfUrl,
      name: fileName,
      folderId: slug
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
  
  // Funktion för att radera PDF-filer
  const handleDeleteFile = async (fileId: string) => {
    // Sätt laddningsstatus för den specifika filen
    setDeleteLoading(fileId);
    setDeleteError(null);
    
    try {
      console.log("Radera fil:", fileId);
      
      // Anropa API för att radera filen - använd vår nya specialgjorda endpoint
      console.log("Försöker radera fil med ID:", fileId);
      const response = await axios.delete(`${API_BASE_URL}/files/delete/${fileId}/`);
      console.log("Svar från radering:", response.data);
      
      // Visa meddelande om lyckad radering
      console.log("Fil raderad:", fileId);
      
      // Rensa cachen för denna mapp
      delete folderDataCache[slug];
      
      // Ladda om data
      fetchFolderData();
    } catch (err: any) {
      console.error('Fel vid radering av fil:', err);
      setDeleteError(`Kunde inte radera filen: ${err.message || 'Okänt fel'}`);
    } finally {
      setDeleteLoading(null);
    }
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
                  <ListItem 
                    key={`${file.name}-${index}`}
                    endAction={
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Tooltip title="Radera fil" placement="top">
                          <IconButton
                            variant="plain"
                            color="danger"
                            size="sm"
                            onClick={() => handleDeleteFile(file.id || `pdf_${index}`)}
                            disabled={deleteLoading === (file.id || `pdf_${index}`)}
                            sx={{ 
                              '&:hover': { backgroundColor: '#f8e0e0' },
                              borderRadius: 'sm'
                            }}
                          >
                            {deleteLoading === (file.id || `pdf_${index}`) ? (
                              <CircularProgress size="sm" />
                            ) : (
                              <DeleteIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  >
                    <ListItemContent>
                      <Button
                        variant="plain"
                        color="neutral"
                        onClick={() => handlePdfClick(file.file, file.name, file.id || `pdf_${index}`)}
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
          
          {/* Använd vår UltimatePDFDialog med parallella renderingsmetoder */}
          {selectedPdf && selectedPdf.url && (
            <UltimatePDFDialog 
              open={!!selectedPdf}
              onClose={() => setSelectedPdf(null)}
              pdfUrl={selectedPdf.url}
              filename={selectedPdf.name}
            />
          )}
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