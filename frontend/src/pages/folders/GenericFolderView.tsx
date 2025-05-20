import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  Modal,
  ModalDialog,
  ModalClose,
  Divider
} from '@mui/joy';
import { API_BASE_URL } from '../../config';
import UploadDialog from '../../components/UploadDialog';
import DeleteIcon from '@mui/icons-material/Delete';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DownloadIcon from '@mui/icons-material/Download';

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

// Gränssnitt för PDF-fil
interface PDFFile {
  id: string | number;
  name: string;
  fileUrl: string;
  uploaded: string;
}

const GenericFolderView = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [folderData, setFolderData] = useState<FolderData | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  
  // PDF-visare från VersionsPage
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfViewerReady, setPdfViewerReady] = useState(false);
  const [activePdfFile, setActivePdfFile] = useState<PDFFile | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (slug) {
      fetchFolderData();
    }
  }, [slug]);

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

  const handleUploadSuccess = () => {
    fetchFolderData();
  };

  // Funktion för att öppna PDF direkt med iframe
  function openPdf(id: string | number, name: string, fileUrl: string) {
    console.log("Öppnar PDF:", {id, name, fileUrl});
    
    // Konvertera backend-URL:en till en frontend-proxyer URL
    // Detta löser Mixed Content-problemet genom att använda samma protokoll som frontend
    const proxyUrl = `/api/proxy-pdf?url=${encodeURIComponent(fileUrl)}`;
    
    const pdfFile: PDFFile = {
      id: id,
      name: name,
      fileUrl: fileUrl,
      uploaded: new Date().toISOString()
    };
    
    setActivePdfFile(pdfFile);
    setPdfUrl(proxyUrl); // Använd den proxyade URL:en istället
    setPdfModalOpen(true);
    setPdfViewerReady(true);
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
          <Button 
            variant="solid"
            color="primary"
            onClick={() => setUploadDialogOpen(true)}
          >
            Ladda upp PDF
          </Button>
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
          <List>
            {folderData?.files.map((file, index) => (
              <ListItem 
                key={`${file.name}-${index}`}
                endAction={
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
                }
              >
                <ListItemContent>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <span style={{ color: '#3182ce' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
                      </svg>
                    </span>
                    <Button
                      variant="solid"
                      color="primary"
                      onClick={() => openPdf(file.id?.toString() || "", file.name, file.file)}
                      sx={{ 
                        p: 1,
                        fontWeight: 'normal',
                        justifyContent: 'flex-start'
                      }}
                    >
                      {file.name}
                    </Button>
                  </Box>
                </ListItemContent>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Undermappar om det finns några */}
      {folderData.subfolders.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography level="h3" sx={{ mb: 2 }}>Undermappar</Typography>
          <List>
            {folderData.subfolders.map((subfolder) => (
              <ListItem key={subfolder.slug}>
                <ListItemContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ color: '#f59e0b' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                      </svg>
                    </span>
                    <Link 
                      to={`/folders/${subfolder.slug}`} 
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <Typography sx={{ '&:hover': { textDecoration: 'underline' } }}>
                        {subfolder.name}
                      </Typography>
                    </Link>
                  </Box>
                </ListItemContent>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Dialogrutor */}
      <UploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        folderSlug={slug}
        onSuccess={handleUploadSuccess}
      />

      {/* PDF Viewer Modal - exakt som i VersionsPage */}
      <Modal
        open={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          p: 1
        }}
      >
        <ModalDialog
          size="lg"
          variant="outlined"
          layout="fullscreen"
          sx={{ 
            width: '100%', 
            height: '100%',
            p: 0,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column'
          }}>
            {/* Header */}
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography level="title-lg">
                {activePdfFile?.name}
              </Typography>
              <ModalClose />
            </Box>
            
            {/* Controls */}
            <Box sx={{ 
              p: 1, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: 'neutral.softBg'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton 
                  size="sm" 
                  variant="soft"
                  onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))}
                >
                  <ZoomOutIcon />
                </IconButton>
                <IconButton 
                  size="sm" 
                  variant="soft"
                  onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.1))}
                >
                  <ZoomInIcon />
                </IconButton>
                
                <Typography level="body-sm" sx={{ mx: 1 }}>
                  {Math.round(zoomLevel * 100)}%
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton 
                  size="sm" 
                  variant="soft"
                  disabled={currentPage <= 1}
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(prev => prev - 1);
                    }
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>
                
                <Typography level="body-sm">
                  Sid {currentPage} / {totalPages || '?'}
                </Typography>
                
                <IconButton 
                  size="sm" 
                  variant="soft"
                  disabled={currentPage >= totalPages}
                  onClick={() => {
                    if (currentPage < totalPages) {
                      setCurrentPage(prev => prev + 1);
                    }
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Box>
              
              <Box>
                <Tooltip title="Ladda ner PDF" placement="top">
                  <IconButton 
                    size="sm" 
                    variant="soft"
                    component="a" 
                    href={pdfUrl || '#'} 
                    download 
                    target="_blank"
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            {/* PDF Document */}
            <Box 
              sx={{ 
                flex: 1, 
                overflow: 'auto', 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'flex-start',
                p: 2,
                bgcolor: 'grey.100'
              }}
            >
              {pdfUrl ? (
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: '100%', 
                    position: 'relative'
                  }}
                >
                  <iframe
                    src={`/pdfjs-viewer.html?url=${encodeURIComponent(pdfUrl)}`}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="fullscreen"
                  />
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  width: '100%', 
                  height: '100%' 
                }}>
                  <Typography level="body-lg">Ingen PDF vald</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default GenericFolderView;