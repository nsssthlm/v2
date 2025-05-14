import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Table, 
  Typography, 
  IconButton, 
  Chip,
  Button,
  Sheet,
  Divider, 
  Input,
  Textarea,
  Modal,
  ModalDialog,
  ModalClose
} from '@mui/joy';
import { 
  Search as SearchIcon, 
  Download as DownloadIcon, 
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import api from '../../services/api';
import { PDFDocument } from '../../types';

interface PDFListProps {
  projectId: number;
  onOpenPDF: (pdf: PDFDocument) => void;
}

const PDFList: React.FC<PDFListProps> = ({ projectId, onOpenPDF }) => {
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<PDFDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: ''
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching PDFs for project:', projectId);
        const response = await api.get(`/workspace/pdfs/?project=${projectId}`);
        console.log('PDF response:', response.data);
        setDocuments(response.data);
        setFilteredDocuments(response.data);
      } catch (err: any) {
        console.error('Error fetching PDF documents', err);
        const errorMessage = err.response?.data?.detail || 
                            err.response?.data?.message || 
                            'Kunde inte hämta PDF-dokument. Försök igen senare.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchDocuments();
    } else {
      // If no projectId is available, set empty state
      setDocuments([]);
      setFilteredDocuments([]);
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDocuments(documents);
    } else {
      const filtered = documents.filter(doc => 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        doc.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDocuments(filtered);
    }
  }, [searchQuery, documents]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
      // Auto-fill title with filename (without extension)
      const fileName = e.target.files[0].name;
      const titleWithoutExtension = fileName.split('.').slice(0, -1).join('.');
      setUploadData({
        ...uploadData,
        title: titleWithoutExtension || fileName
      });
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadData.title) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);
    formData.append('file', uploadFile);
    formData.append('project', String(projectId));

    try {
      console.log('Uploading PDF:', uploadData.title);
      const response = await api.post('/workspace/pdfs/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Upload response:', response.data);
      // Add the new document to the list
      setDocuments(prev => [response.data, ...prev]);
      setFilteredDocuments(prev => [response.data, ...prev]);
      
      // Reset form
      setUploadFile(null);
      setUploadData({ title: '', description: '' });
      setUploadOpen(false);
      setError(null); // Clear any previous errors
    } catch (err: any) {
      console.error('Error uploading PDF', err);
      const errorMessage = err.response?.data?.detail || 
                           err.response?.data?.message ||
                           'Kunde inte ladda upp PDF. Kontrollera att filen är en giltig PDF.';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Är du säker på att du vill ta bort detta dokument?')) return;
    
    try {
      console.log('Deleting PDF with ID:', id);
      await api.delete(`/workspace/pdfs/${id}/`);
      
      console.log('PDF deleted successfully');
      // Remove the document from both lists
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      setFilteredDocuments(prev => prev.filter(doc => doc.id !== id));
      setError(null); // Clear any previous errors
    } catch (err: any) {
      console.error('Error deleting PDF', err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message ||
                          'Kunde inte ta bort dokumentet. Försök igen senare.';
      setError(errorMessage);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Box sx={{ width: '100%', overflow: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography level="h3">PDF-dokument</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Input 
            placeholder="Sök dokument..." 
            startDecorator={<SearchIcon />} 
            value={searchQuery}
            onChange={handleSearch}
            sx={{ width: 250 }}
          />
          <Button 
            startDecorator={<UploadIcon />} 
            onClick={() => setUploadOpen(true)}
          >
            Ladda upp
          </Button>
        </Box>
      </Box>

      {error && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'danger.softBg', borderRadius: 'sm' }}>
          <Typography color="danger">{error}</Typography>
        </Box>
      )}

      <Sheet variant="outlined" sx={{ borderRadius: 'md', overflow: 'auto' }}>
        <Table stickyHeader sx={{ '--TableCell-headBackground': 'var(--joy-palette-background-level1)' }}>
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Dokument</th>
              <th style={{ width: '15%' }}>Uppladdad av</th>
              <th style={{ width: '15%' }}>Datum</th>
              <th style={{ width: '10%' }}>Storlek</th>
              <th style={{ width: '10%' }}>Version</th>
              <th style={{ width: '10%' }}>Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <Typography>Laddar dokument...</Typography>
                  </Box>
                </td>
              </tr>
            ) : filteredDocuments.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <Typography>Inga dokument hittades</Typography>
                  </Box>
                </td>
              </tr>
            ) : (
              filteredDocuments.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography fontWeight="lg">{doc.title}</Typography>
                      <Typography level="body-sm" noWrap sx={{ maxWidth: 350 }}>
                        {doc.description || <i>Ingen beskrivning</i>}
                      </Typography>
                    </Box>
                  </td>
                  <td>
                    <Typography>
                      {doc.uploaded_by_details.first_name 
                        ? `${doc.uploaded_by_details.first_name} ${doc.uploaded_by_details.last_name}` 
                        : doc.uploaded_by_details.username}
                    </Typography>
                  </td>
                  <td>
                    <Typography>
                      {format(new Date(doc.created_at), 'dd MMM yyyy', { locale: sv })}
                    </Typography>
                  </td>
                  <td>
                    <Chip size="sm" variant="soft">
                      {formatFileSize(doc.size)}
                    </Chip>
                  </td>
                  <td>
                    <Typography>v{doc.version}</Typography>
                  </td>
                  <td>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="sm" 
                        variant="plain" 
                        color="primary" 
                        onClick={() => {
                          console.log('Clicked View PDF button for:', doc.title);
                          onOpenPDF(doc);
                        }}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton 
                        size="sm" 
                        variant="plain" 
                        component="a" 
                        href={doc.file_url} 
                        download 
                        target="_blank"
                      >
                        <DownloadIcon />
                      </IconButton>
                      <IconButton 
                        size="sm" 
                        variant="plain" 
                        color="danger" 
                        onClick={() => handleDelete(doc.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Sheet>

      {/* Upload Modal */}
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)}>
        <ModalDialog
          aria-labelledby="upload-modal-title"
          aria-describedby="upload-modal-description"
          sx={{ maxWidth: 500 }}
        >
          <ModalClose />
          <Typography id="upload-modal-title" level="h2">
            Ladda upp PDF-dokument
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <Box
            component="form"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              '& > div': { width: '100%' },
            }}
          >
            <Box sx={{ textAlign: 'center', py: 2, border: '1px dashed', borderRadius: 'sm', borderColor: 'neutral.500' }}>
              {uploadFile ? (
                <Box>
                  <Typography>{uploadFile.name}</Typography>
                  <Typography level="body-sm">{formatFileSize(uploadFile.size)}</Typography>
                  <Button 
                    size="sm" 
                    variant="soft" 
                    color="danger" 
                    sx={{ mt: 1 }}
                    onClick={() => setUploadFile(null)}
                  >
                    Ta bort
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Typography sx={{ mb: 1 }}>Dra och släpp en PDF-fil här</Typography>
                  <Button
                    component="label"
                    startDecorator={<UploadIcon />}
                  >
                    Välj fil
                    <input
                      type="file"
                      accept="application/pdf"
                      hidden
                      onChange={handleFileChange}
                    />
                  </Button>
                </Box>
              )}
            </Box>

            <Input 
              placeholder="Titel"
              value={uploadData.title}
              onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
              required
            />

            <Textarea
              placeholder="Beskrivning (valfri)"
              value={uploadData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setUploadData({ ...uploadData, description: e.target.value })}
              minRows={3}
            />

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
              <Button
                variant="plain"
                color="neutral"
                onClick={() => setUploadOpen(false)}
              >
                Avbryt
              </Button>
              <Button
                startDecorator={<UploadIcon />}
                loading={uploading}
                disabled={!uploadFile || !uploadData.title || uploading}
                onClick={handleUpload}
              >
                Ladda upp
              </Button>
            </Box>
          </Box>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default PDFList;