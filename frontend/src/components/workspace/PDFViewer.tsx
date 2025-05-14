import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  Stack,
  Divider,
  IconButton,
  Button,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  Grid
} from '@mui/joy';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { format } from 'date-fns';
import { useParams, useNavigate } from 'react-router-dom';

interface PDFDocument {
  id: number;
  title: string;
  description: string;
  file: string;
  file_url: string;
  project: number;
  uploaded_by: number;
  uploaded_by_details: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  updated_at: string;
}

interface PDFViewerProps {
  projectId: number;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ projectId }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [pdfs, setPdfs] = useState<PDFDocument[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<PDFDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch PDF documents for the project
  useEffect(() => {
    const fetchPdfs = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/workspace/pdf/', {
          params: { project: projectId }
        });
        setPdfs(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching PDF documents:', err);
        setError('Failed to load PDF documents');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPdfs();
  }, [projectId]);
  
  // Load selected PDF by ID from URL params
  useEffect(() => {
    if (id && pdfs.length > 0) {
      const pdf = pdfs.find(p => p.id === parseInt(id));
      if (pdf) {
        setSelectedPdf(pdf);
      } else {
        setError(`PDF with ID ${id} not found`);
      }
    } else if (pdfs.length > 0 && !id) {
      // Select first PDF by default if no ID in URL
      setSelectedPdf(pdfs[0]);
    }
  }, [id, pdfs]);
  
  const handlePdfSelect = (pdf: PDFDocument) => {
    setSelectedPdf(pdf);
    navigate(`/workspace/pdf/${pdf.id}`);
  };
  
  const handleDelete = async () => {
    if (!selectedPdf) return;
    
    if (!confirm(`Are you sure you want to delete "${selectedPdf.title}"?`)) {
      return;
    }
    
    try {
      await axios.delete(`/api/workspace/pdf/${selectedPdf.id}/`);
      
      // Remove from PDF list
      const newPdfList = pdfs.filter(p => p.id !== selectedPdf.id);
      setPdfs(newPdfList);
      
      // Select another PDF if available
      if (newPdfList.length > 0) {
        handlePdfSelect(newPdfList[0]);
      } else {
        setSelectedPdf(null);
      }
    } catch (err) {
      console.error('Error deleting PDF:', err);
      setError('Failed to delete PDF');
    }
  };
  
  const handleUpload = () => {
    // Create and trigger file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/pdf';
    fileInput.onchange = uploadFile;
    fileInput.click();
  };
  
  const uploadFile = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;
    
    const file = target.files[0];
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }
    
    // Prompt for title and description
    const title = prompt('Enter a title for the PDF:', file.name.replace('.pdf', ''));
    if (!title) return;
    
    const description = prompt('Enter a description (optional):') || '';
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('project', projectId.toString());
    
    setUploading(true);
    try {
      const response = await axios.post('/api/workspace/pdf/', formData);
      
      // Add to PDF list and select it
      const newPdf = response.data;
      setPdfs([...pdfs, newPdf]);
      handlePdfSelect(newPdf);
      setError(null);
    } catch (err) {
      console.error('Error uploading PDF:', err);
      setError('Failed to upload PDF');
    } finally {
      setUploading(false);
    }
  };
  
  if (loading && pdfs.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Grid container spacing={2} sx={{ height: '100%' }}>
      {/* PDF sidebar */}
      <Grid xs={12} md={3}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography level="title-lg">PDF Documents</Typography>
              <Button 
                startDecorator={<AddIcon />} 
                size="sm"
                onClick={handleUpload}
                loading={uploading}
              >
                Upload
              </Button>
            </Stack>
            
            <Divider sx={{ my: 1 }} />
            
            <List>
              {pdfs.length === 0 ? (
                <ListItem>
                  <ListItemContent>
                    <Typography level="body-sm" sx={{ color: 'text.tertiary', fontStyle: 'italic' }}>
                      No PDF documents yet
                    </Typography>
                  </ListItemContent>
                </ListItem>
              ) : (
                pdfs.map((pdf) => (
                  <ListItem key={pdf.id}>
                    <ListItemButton 
                      selected={selectedPdf?.id === pdf.id}
                      onClick={() => handlePdfSelect(pdf)}
                    >
                      <ListItemContent>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <PictureAsPdfIcon fontSize="small" color="error" />
                          <Typography level="body-sm">{pdf.title}</Typography>
                        </Stack>
                      </ListItemContent>
                    </ListItemButton>
                  </ListItem>
                ))
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>
      
      {/* PDF viewer */}
      <Grid xs={12} md={9}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            {error && (
              <Alert color="danger" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {!selectedPdf ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%',
                p: 4
              }}>
                <Typography level="body-lg" sx={{ color: 'text.tertiary', mb: 2 }}>
                  {pdfs.length === 0 ? 'No PDF documents available' : 'Select a PDF document'}
                </Typography>
                <Button 
                  startDecorator={<UploadIcon />}
                  onClick={handleUpload}
                  loading={uploading}
                >
                  Upload PDF
                </Button>
              </Box>
            ) : (
              <>
                <Stack 
                  direction="row" 
                  justifyContent="space-between" 
                  alignItems="center" 
                  sx={{ mb: 2 }}
                >
                  <Box>
                    <Typography level="h4">{selectedPdf.title}</Typography>
                    <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                      Uploaded by {selectedPdf.uploaded_by_details.first_name} {selectedPdf.uploaded_by_details.last_name} on {format(new Date(selectedPdf.created_at), 'MMM d, yyyy')}
                    </Typography>
                  </Box>
                  
                  <Stack direction="row" spacing={1}>
                    <IconButton 
                      variant="outlined"
                      color="primary"
                      component="a"
                      href={selectedPdf.file_url}
                      download
                    >
                      <DownloadIcon />
                    </IconButton>
                    <IconButton 
                      variant="outlined"
                      color="danger"
                      onClick={handleDelete}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Stack>
                
                {selectedPdf.description && (
                  <Typography level="body-md" sx={{ mb: 2 }}>
                    {selectedPdf.description}
                  </Typography>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ height: 'calc(100vh - 300px)', minHeight: '400px', width: '100%' }}>
                  <iframe 
                    src={`${selectedPdf.file_url}#view=FitH`}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title={selectedPdf.title}
                  />
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default PDFViewer;