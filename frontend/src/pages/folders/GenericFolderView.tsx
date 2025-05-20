import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProject } from '../../contexts/ProjectContext';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Button, 
  List, 
  ListItem, 
  ListItemContent, 
  CircularProgress, 
  Alert, 
  IconButton, 
  Tooltip,
  Sheet,
  Table,
  Modal,
  ModalDialog,
  ModalClose,
  Divider
} from '@mui/joy';
import { API_BASE_URL } from '../../config';
import UploadDialog from '../../components/UploadDialog';
import PDFDialogEnhanced from '../../components/PDFDialogEnhanced';
import DeleteIcon from '@mui/icons-material/Delete';

interface FolderData {
  id: number | string;
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
    id?: string | number;
    name: string;
    file: string;
    uploaded_at: string;
  }[];
}

const GenericFolderView = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate(); 
  const { currentProject, setCurrentProject } = useProject(); // Hämta projektkontext
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [folderData, setFolderData] = useState<FolderData | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [folderProjectId, setFolderProjectId] = useState<string | null>(null);
  
  // Tillstånd för PDF-dialogen
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<{ url: string; filename: string } | null>(null);
  
  // Tillstånd för "Ta bort mapp"-dialogen
  const [deleteFolderDialogOpen, setDeleteFolderDialogOpen] = useState(false);
  const [deletingFolder, setDeletingFolder] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchFolderData();
    }
  }, [slug]);

  const fetchFolderData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Hämtar mappdata för slug: ${slug}`);
      const response = await axios.get(`${API_BASE_URL}/files/web/${slug}/data/`);
      
      // Spara mappdata och sätt projektID om det finns
      setFolderData(response.data);
      
      // Kontrollera om mappen har projektinformation
      if (response.data && response.data.project_id) {
        console.log(`Mappen tillhör projekt: ${response.data.project_id}`);
        setFolderProjectId(response.data.project_id.toString());
        
        // Om mappens projekt skiljer sig från nuvarande projekt, uppdatera projektkontext
        if (currentProject && currentProject.id !== response.data.project_id.toString()) {
          // Hitta det matchande projektet för att sätta rätt projektkontext
          const projects = JSON.parse(sessionStorage.getItem('projects') || '[]');
          const matchingProject = projects.find((p: any) => p.id === response.data.project_id.toString());
          
          if (matchingProject) {
            console.log('Byter till mappens projekt:', matchingProject.name);
            setCurrentProject(matchingProject);
          }
        }
      }
    } catch (err: any) {
      console.error('Fel vid hämtning av mappdata:', err);
      setError(err.message || 'Ett fel uppstod vid hämtning av mappdata');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    fetchFolderData();
  };

  // Funktion för att öppna PDF i dialog
  function openPdf(id: string | number, name: string, fileUrl: string) {
    console.log("Öppnar PDF:", {id, name, fileUrl});
    
    // Spara PDF-informationen och öppna dialogen
    setSelectedPdf({
      url: fileUrl,
      filename: name
    });
    setPdfDialogOpen(true);
  }

  // Funktion för att radera PDF-filer
  const handleDeleteFile = async (fileId: string | number) => {
    setDeleteLoading(String(fileId));
    
    try {
      await axios.delete(`${API_BASE_URL}/files/delete/${fileId}/`);
      fetchFolderData();
    } catch (err: any) {
      console.error('Fel vid radering av fil:', err);
      setError(`Kunde inte radera filen: ${err.message || 'Okänt fel'}`);
    } finally {
      setDeleteLoading(null);
    }
  };
  
  // Funktion för att öppna bekräftelsedialog för att ta bort mapp
  const openDeleteFolderDialog = () => {
    setDeleteFolderDialogOpen(true);
  };

  // Funktion för att ta bort den aktuella mappen
  const handleDeleteFolder = async () => {
    if (!slug) return;
    
    setDeletingFolder(true);
    
    try {
      console.log(`Försöker radera mapp: ${slug}`);
      const response = await axios.delete(`${API_BASE_URL}/files/delete-directory/${slug}/`);
      console.log("Svar från API efter borttagning:", response.data);
      
      // Visa meddelande om lyckad borttagning
      alert(`Mappen "${slug}" har raderats framgångsrikt.`);
      
      // Stäng dialogen för borttagningsmapp
      setDeleteFolderDialogOpen(false);
      
      // Lägg till en kort timeout så användaren ser meddelandet innan omdirigering
      setTimeout(() => {
        // Töm eventuella cachade mappar i localStorage för att tvinga omladdning
        const cacheKeys = Object.keys(localStorage).filter(key => 
          key.startsWith('sidebar_directories_') || 
          key.startsWith('folders_')
        );
        
        cacheKeys.forEach(key => localStorage.removeItem(key));
        
        // Sätt en flagga för att indikera att mappsystemet behöver uppdateras
        sessionStorage.setItem('force_refresh_directories', 'true');
        
        // Om mappen har en föräldermapp, navigera till den istället för mappöversikten
        if (folderData?.parent_slug) {
          window.location.href = `/folders/${folderData.parent_slug}`;
        } else {
          // Om det inte finns en föräldermapp, navigera till dashboard istället för mappöversikten
          window.location.href = '/';
        }
      }, 500);
      
    } catch (err: any) {
      console.error('Fel vid radering av mapp:', err);
      setError(`Kunde inte radera mappen: ${err.message || 'Okänt fel'}`);
      setDeletingFolder(false);
      setDeleteFolderDialogOpen(false);
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
      {/* Brödsmulor och navigering */}
      <Box sx={{ display: 'flex', mb: 2, fontSize: '0.85rem' }}>
        <Typography level="body-sm" sx={{ color: 'primary.500' }}>
          <Link to="/folders" style={{ textDecoration: 'none' }}>Mappar</Link>
        </Typography>
        
        {folderData?.parent_slug && (
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
        <Typography level="body-sm">{folderData?.name}</Typography>
      </Box>

      {/* Rubrik för mappen */}
      <Box sx={{ mb: 4 }}>
        <Typography level="h2">{folderData?.name}</Typography>
        {folderData?.description && (
          <Typography sx={{ mt: 1 }}>{folderData.description}</Typography>
        )}
      </Box>

      {/* PDF-filer */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography level="h3">PDF Dokument</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="solid"
              color="primary"
              onClick={() => setUploadDialogOpen(true)}
              sx={{ 
                backgroundColor: '#50af5f', 
                '&:hover': { 
                  backgroundColor: '#b3dcc8'
                }
              }}
            >
              Ladda upp PDF
            </Button>
            <Button 
              variant="solid"
              color="danger"
              onClick={openDeleteFolderDialog}
              startDecorator={<DeleteIcon />}
              sx={{ 
                backgroundColor: '#e53935', 
                '&:hover': { 
                  backgroundColor: '#d32f2f'
                }
              }}
            >
              Ta bort mapp
            </Button>
          </Box>
        </Box>
        
        {folderData?.files.length === 0 ? (
          <Sheet 
            variant="outlined" 
            sx={{ 
              p: 4, 
              borderRadius: 'md', 
              display: 'flex', 
              justifyContent: 'center' 
            }}
          >
            <Typography level="body-sm" sx={{ fontStyle: 'italic' }}>
              Inga PDF-dokument finns i denna mapp. Klicka på "Ladda upp PDF" för att lägga till en fil.
            </Typography>
          </Sheet>
        ) : (
          <Sheet
            variant="outlined"
            sx={{
              borderRadius: 'md',
              overflow: 'auto'
            }}
          >
            <Table 
              sx={{ 
                tableLayout: 'fixed',
                '& th': {
                  backgroundColor: '#f5f5f5',
                  color: '#555',
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  py: 1.5
                },
                '& td': {
                  py: 1.5,
                  fontSize: '14px',
                  borderBottom: '1px solid #eee'
                },
                '& tbody tr': {
                  backgroundColor: 'white'
                },
                '& tbody tr:hover': {
                  backgroundColor: '#e0f2e9'
                },
                '& tbody tr:hover td': {
                  backgroundColor: '#e0f2e9'
                },
                '& tbody tr:hover span': {
                  backgroundColor: '#e0f2e9'
                },
                '& tbody tr:hover button': {
                  backgroundColor: '#e0f2e9 !important'
                },
                '& tbody tr:hover div': {
                  backgroundColor: '#e0f2e9'
                }
              }}
            >
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>NAMN</th>
                  <th style={{ width: '8%' }}>VERSION</th>
                  <th style={{ width: '18%' }}>BESKRIVNING</th>
                  <th style={{ width: '10%' }}>UPPLADDAD</th>
                  <th style={{ width: '15%' }}>UPPLADDAD AV</th>
                  <th style={{ width: '10%' }}>MAPP</th>
                  <th style={{ width: '8%' }}>STATUS</th>
                  <th style={{ width: '17%' }}>ID</th>
                  <th style={{ width: '5%' }}>ÅTGÄRDER</th>
                </tr>
              </thead>
              <tbody>
                {folderData?.files.map((file, index) => (
                  <tr key={`${file.name}-${index}`} style={{ backgroundColor: "white" }}>
                    <td style={{ backgroundColor: "white" }}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: 1,
                          backgroundColor: 'white'
                        }}
                      >
                        <span style={{ color: '#3182ce', backgroundColor: 'white' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
                          </svg>
                        </span>
                        <Button
                          variant="plain"
                          color="neutral"
                          onClick={() => openPdf(file.id?.toString() || "", file.name, file.file)}
                          sx={{ 
                            p: 0.5,
                            fontWeight: 'normal',
                            justifyContent: 'flex-start',
                            backgroundColor: 'white !important',
                            color: '#3182ce'
                          }}
                        >
                          {file.name}
                        </Button>
                      </Box>
                    </td>
                    <td>1</td>
                    <td>
                      <Typography level="body-sm" noWrap>
                        Ingen beskrivning
                      </Typography>
                    </td>
                    <td>
                      <Typography level="body-sm">
                        {file.uploaded_at ? 
                          new Date(file.uploaded_at).toLocaleDateString('sv-SE', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          }).replace(/\//g, '-') : 
                          '2025-05-16'}
                      </Typography>
                    </td>
                    <td>
                      <Typography level="body-sm">
                        user@example.com
                      </Typography>
                    </td>
                    <td>
                      <Typography level="body-sm">
                        {folderData?.name || 'Huvudmapp'}
                      </Typography>
                    </td>
                    <td>
                      <Typography level="body-sm">-</Typography>
                    </td>
                    <td>
                      <Typography level="body-sm" noWrap sx={{ color: '#666' }}>
                        {file.id ? `pdf_${String(file.id).padStart(5, '0')}` : `pdf_${index.toString().padStart(5, '0')}`}
                      </Typography>
                    </td>
                    <td>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Tooltip title="Radera fil" placement="top">
                          <IconButton
                            variant="plain"
                            color="danger"
                            size="sm"
                            onClick={() => handleDeleteFile(file.id || `file_${index}`)}
                            disabled={deleteLoading === String(file.id || `file_${index}`)}
                            sx={{ 
                              '&:hover': { backgroundColor: '#f8e0e0' },
                              borderRadius: 'sm'
                            }}
                          >
                            {deleteLoading === String(file.id || `file_${index}`) ? (
                              <CircularProgress size="sm" />
                            ) : (
                              <DeleteIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Sheet>
        )}
      </Box>

      {/* Ta bort undermappar-sektion enligt användarens önskemål */}

      {/* Dialogrutor */}
      <UploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        folderSlug={slug}
        onSuccess={handleUploadSuccess}
      />
      
      {/* PDF Viewer Dialog - Ny förbättrad version med blob URL support */}
      {selectedPdf && (
        <PDFDialogEnhanced
          open={pdfDialogOpen}
          onClose={() => setPdfDialogOpen(false)}
          pdfUrl={selectedPdf.url}
          filename={selectedPdf.filename}
        />
      )}

      {/* Bekräftelsedialog för att ta bort mapp */}
      <Modal open={deleteFolderDialogOpen} onClose={() => !deletingFolder && setDeleteFolderDialogOpen(false)}>
        <ModalDialog
          variant="outlined"
          role="alertdialog"
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
          sx={{ 
            maxWidth: 500,
            borderRadius: 'md',
            p: 3,
            boxShadow: 'lg'
          }}
        >
          <ModalClose 
            disabled={deletingFolder}
            onClick={() => setDeleteFolderDialogOpen(false)}
          />
          
          <Typography
            id="delete-dialog-title"
            component="h2"
            level="title-lg"
            startDecorator={<DeleteIcon />}
            sx={{ color: 'danger.600', mb: 1 }}
          >
            Ta bort mapp
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography id="delete-dialog-description" textColor="text.tertiary" mb={3}>
            Är du säker på att du vill ta bort den här mappen? Alla undermappar till denna mapp kommer också tas bort.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              variant="plain"
              color="neutral"
              onClick={() => setDeleteFolderDialogOpen(false)}
              disabled={deletingFolder}
            >
              Avbryt
            </Button>
            <Button
              variant="solid"
              color="danger"
              onClick={handleDeleteFolder}
              loading={deletingFolder}
            >
              Ja, ta bort permanent
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default GenericFolderView;