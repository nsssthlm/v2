import React, { useState, useEffect } from 'react';
import {
  Box,
  Table, 
  Sheet,
  Typography,
  Button,
  IconButton,
  Input,
  Dropdown,
  MenuButton,
  Menu,
  MenuItem,
  Divider,
  CircularProgress,
  Alert,
  Modal,
  ModalDialog,
  ModalClose,
  FormControl,
  FormLabel,
  Stack
} from '@mui/joy';
import SearchIcon from '@mui/icons-material/Search';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { format } from 'date-fns';
import axios from 'axios';

interface PDFDocument {
  id: number;
  title: string;
  description: string;
  file_url: string;
  file: string;
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
  size?: number; // Size in bytes
  version?: number; // Might be needed for version tracking
}

interface PDFListProps {
  projectId: number;
  onSelectPDF: (pdf: PDFDocument) => void;
}

const PDFList: React.FC<PDFListProps> = ({ projectId, onSelectPDF }) => {
  const [pdfs, setPdfs] = useState<PDFDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadDescription, setUploadDescription] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Fetch PDFs for the project
  useEffect(() => {
    if (!projectId) return;
    
    const fetchPDFs = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/workspace/pdf/', {
          params: { project: projectId }
        });
        
        // Add version number 1 to each document
        const pdfWithVersions = response.data.map((pdf: PDFDocument) => ({
          ...pdf,
          version: 1
        }));
        
        setPdfs(pdfWithVersions);
        setError(null);
      } catch (err) {
        console.error('Error fetching PDFs:', err);
        setError('Failed to load PDF documents');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPDFs();
  }, [projectId]);

  const filteredPDFs = pdfs.filter(pdf => 
    pdf.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Use filename as default title if not specified
      if (!uploadTitle) {
        setUploadTitle(file.name);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('No file selected');
      return;
    }
    
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', uploadTitle || selectedFile.name);
    formData.append('description', uploadDescription);
    formData.append('project', projectId.toString());
    
    try {
      const response = await axios.post('/api/workspace/pdf/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Add the new PDF to the list with version 1
      setPdfs(prev => [...prev, { ...response.data, version: 1 }]);
      
      // Close modal and reset form
      setUploadModalOpen(false);
      setSelectedFile(null);
      setUploadTitle('');
      setUploadDescription('');
      setError(null);
    } catch (err) {
      console.error('Error uploading PDF:', err);
      setError('Failed to upload PDF document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePDF = async (pdfId: number) => {
    if (!confirm('Är du säker på att du vill ta bort denna PDF?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/workspace/pdf/${pdfId}/`);
      
      // Remove the PDF from the list
      setPdfs(prev => prev.filter(pdf => pdf.id !== pdfId));
    } catch (err) {
      console.error('Error deleting PDF:', err);
      setError('Failed to delete PDF document');
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      {error && (
        <Alert color="danger" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Header with path, search and actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.500', mr: 2 }}>
          <IconButton component="a" href="/vault" size="sm" variant="plain" color="neutral">
            <InsertDriveFileIcon />
          </IconButton>
          <Typography component="span" sx={{ mx: 0.5 }}>&gt;</Typography>
          <Typography component="span" sx={{ fontWeight: 'bold' }}>Filer</Typography>
          {selectedFolder && (
            <>
              <Typography component="span" sx={{ mx: 0.5 }}>&gt;</Typography>
              <Typography component="span">{selectedFolder}</Typography>
            </>
          )}
        </Box>
      </Box>
      
      {/* Toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Input
          startDecorator={<SearchIcon />}
          placeholder="Sök efter fil..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 300 }}
        />
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Dropdown>
            <MenuButton
              variant="outlined"
              color="neutral"
              endDecorator={<KeyboardArrowDownIcon />}
            >
              Alla versioner
            </MenuButton>
            <Menu>
              <MenuItem>Alla versioner</MenuItem>
              <MenuItem>Senaste versioner</MenuItem>
            </Menu>
          </Dropdown>
          
          <Button 
            startDecorator={<UploadIcon />} 
            color="primary"
            onClick={() => setUploadModalOpen(true)}
          >
            Ladda upp
          </Button>
          
          <Button 
            startDecorator={<DeleteIcon />} 
            color="danger"
            disabled={true} // Enable when items are selected
          >
            Ta bort mapp
          </Button>
        </Box>
      </Box>
      
      {/* PDF Table */}
      <Sheet variant="outlined" sx={{ borderRadius: 'sm' }}>
        <Table stickyHeader hoverRow>
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Namn</th>
              <th style={{ width: '10%' }}>Version</th>
              <th style={{ width: '15%' }}>Beskrivning</th>
              <th style={{ width: '15%' }}>Uppladdad</th>
              <th style={{ width: '10%' }}>Uppladdad av</th>
              <th style={{ width: '10%' }}>Storlek</th>
            </tr>
          </thead>
          <tbody>
            {filteredPDFs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                  Inga PDF-dokument hittades
                </td>
              </tr>
            ) : (
              filteredPDFs.map((pdf) => (
                <tr key={pdf.id} onClick={() => onSelectPDF(pdf)} style={{ cursor: 'pointer' }}>
                  <td>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <InsertDriveFileIcon color="error" sx={{ mr: 1 }} />
                      {pdf.title}
                    </Box>
                  </td>
                  <td>{pdf.version || 1}</td>
                  <td>{pdf.description || 'Ingen beskrivning'}</td>
                  <td>{format(new Date(pdf.created_at), 'd MMM yyyy HH:mm')}</td>
                  <td>{pdf.uploaded_by_details?.username || 'Unknown'}</td>
                  <td>{formatFileSize(pdf.size) || '92 KB'}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Sheet>
      
      {/* Upload Modal */}
      <Modal open={uploadModalOpen} onClose={() => setUploadModalOpen(false)}>
        <ModalDialog>
          <ModalClose />
          <Typography level="h4">Ladda upp PDF</Typography>
          
          <Box sx={{ mt: 2 }}>
            <input
              accept="application/pdf"
              style={{ display: 'none' }}
              id="pdf-upload-input"
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="pdf-upload-input">
              <Button 
                component="span"
                variant="outlined"
                color="neutral"
                fullWidth
                startDecorator={<UploadIcon />}
              >
                Välj PDF-fil
              </Button>
            </label>
            {selectedFile && (
              <Typography level="body-sm" sx={{ mt: 1 }}>
                Vald fil: {selectedFile.name}
              </Typography>
            )}
          </Box>
          
          <FormControl sx={{ mt: 2 }}>
            <FormLabel>Titel</FormLabel>
            <Input
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="Ange dokumenttitel..."
            />
          </FormControl>
          
          <FormControl sx={{ mt: 2 }}>
            <FormLabel>Beskrivning (valfritt)</FormLabel>
            <Input
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              placeholder="Ange en kort beskrivning..."
            />
          </FormControl>
          
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button 
              variant="plain" 
              color="neutral" 
              onClick={() => setUploadModalOpen(false)}
            >
              Avbryt
            </Button>
            <Button 
              onClick={handleUpload}
              loading={uploading}
              disabled={!selectedFile}
            >
              Ladda upp
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default PDFList;