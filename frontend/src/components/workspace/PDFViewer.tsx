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
  Grid,
  Tabs,
  TabList,
  Tab,
  TabPanel
} from '@mui/joy';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ListAltIcon from '@mui/icons-material/ListAlt';
import axios from 'axios';
import { format } from 'date-fns';
import { useParams, useNavigate } from 'react-router-dom';
import PDFList from './PDFList';

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
  size?: number;
  version?: number;
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
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<number>(0); // 0 = list view, 1 = single pdf view
  
  // Fetch PDF documents for the project
  useEffect(() => {
    const fetchPdfs = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/workspace/pdf/', {
          params: { project: projectId }
        });
        
        // Add version field to each document (default 1)
        const pdfsWithVersion = response.data.map((pdf: PDFDocument) => ({
          ...pdf,
          version: 1
        }));
        
        setPdfs(pdfsWithVersion);
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
        setViewMode(1); // Switch to single pdf view
      } else {
        setError(`PDF with ID ${id} not found`);
      }
    } else if (pdfs.length > 0 && !id) {
      // Stay in list view
      setViewMode(0);
    }
  }, [id, pdfs]);
  
  const handlePdfSelect = (pdf: PDFDocument) => {
    setSelectedPdf(pdf);
    setViewMode(1); // Switch to single pdf view
    navigate(`/workspace/pdf/${pdf.id}`);
  };
  
  const handleDelete = async () => {
    if (!selectedPdf) return;
    
    if (!confirm(`Är du säker på att du vill ta bort "${selectedPdf.title}"?`)) {
      return;
    }
    
    try {
      await axios.delete(`/api/workspace/pdf/${selectedPdf.id}/`);
      
      // Remove from PDF list
      const newPdfList = pdfs.filter(p => p.id !== selectedPdf.id);
      setPdfs(newPdfList);
      
      // Switch back to list view
      setSelectedPdf(null);
      setViewMode(0);
      navigate(`/workspace/pdf`);
    } catch (err) {
      console.error('Error deleting PDF:', err);
      setError('Failed to delete PDF');
    }
  };
  
  const handleBackToList = () => {
    setViewMode(0);
    navigate(`/workspace/pdf`);
  };
  
  if (loading && pdfs.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={viewMode} onChange={(e, v) => setViewMode(v as number)} sx={{ display: selectedPdf ? 'block' : 'none' }}>
        <TabList sx={{ mb: 2 }}>
          <Tab startDecorator={<ListAltIcon />} onClick={handleBackToList}>Lista</Tab>
          <Tab startDecorator={<PictureAsPdfIcon />} disabled={!selectedPdf}>PDF Visare</Tab>
        </TabList>
      </Tabs>
      
      {viewMode === 0 ? (
        // List View
        <PDFList 
          projectId={projectId} 
          onSelectPDF={handlePdfSelect}
        />
      ) : (
        // Single PDF View
        selectedPdf && (
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              {error && (
                <Alert color="danger" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <Stack 
                direction="row" 
                justifyContent="space-between" 
                alignItems="center" 
                sx={{ mb: 2 }}
              >
                <Box>
                  <Typography level="h4">{selectedPdf.title}</Typography>
                  <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                    Uppladdad av {selectedPdf.uploaded_by_details.first_name} {selectedPdf.uploaded_by_details.last_name} 
                    den {format(new Date(selectedPdf.created_at), 'd MMM yyyy')}
                  </Typography>
                </Box>
                
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    color="neutral"
                    onClick={handleBackToList}
                  >
                    Tillbaka till listan
                  </Button>
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
              
              <Box sx={{ height: 'calc(100vh - 300px)', minHeight: '500px', width: '100%' }}>
                <iframe 
                  src={`${selectedPdf.file_url}#view=FitH`}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title={selectedPdf.title}
                />
              </Box>
            </CardContent>
          </Card>
        )
      )}
    </Box>
  );
};

export default PDFViewer;