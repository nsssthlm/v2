import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Table, 
  Sheet,
  IconButton,
  Input,
  Divider
} from '@mui/joy';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import { API_BASE_URL } from '../../config';
import UploadDialog from '../../components/UploadDialog';
import PDFDialog from '../../components/PDFDialog';

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
    id?: string;
  }[];
}

interface FileRowProps {
  name: string;
  version: string;
  description: string;
  uploadedAt: string;
  uploadedBy: string;
  folder: string;
  status?: string;
  id: string;
  fileUrl: string;
  onDelete?: (id: string) => void;
  onPdfClick: (url: string, name: string) => void;
}

const FileRow = ({ name, version, description, uploadedAt, uploadedBy, folder, status, id, fileUrl, onDelete, onPdfClick }: FileRowProps) => {
  return (
    <tr>
      <td style={{ padding: '12px 8px' }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            cursor: 'pointer',
            '&:hover': {
              color: 'primary.main'
            }
          }}
          onClick={() => onPdfClick(fileUrl, name)}
        >
          <Box component="span" sx={{ color: 'primary.500' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
            </svg>
          </Box>
          {name}
        </Box>
      </td>
      <td style={{ padding: '12px 8px' }}>{version}</td>
      <td style={{ padding: '12px 8px' }}>{description}</td>
      <td style={{ padding: '12px 8px' }}>{uploadedAt}</td>
      <td style={{ padding: '12px 8px' }}>{uploadedBy}</td>
      <td style={{ padding: '12px 8px' }}>{folder}</td>
      <td style={{ padding: '12px 8px' }}>{status || '-'}</td>
      <td style={{ padding: '12px 8px' }}>
        {id}
      </td>
      <td style={{ padding: '12px 8px' }}>
        <IconButton 
          size="sm" 
          variant="plain" 
          color="danger"
          onClick={(e) => {
            e.stopPropagation();
            onDelete && onDelete(id);
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </td>
    </tr>
  );
};

const FolderPageNew = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [folderData, setFolderData] = useState<FolderData | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  // PDF Dialog state
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<{ url: string; name: string } | null>(null);

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

  const handleDeleteFile = (fileId: string) => {
    // Här skulle vi anropa ett API för att radera filen
    console.log("Radera fil:", fileId);
    // Efter radering skulle vi uppdatera listan
    // fetchFolderData();
  };
  
  // Hantera klick på PDF-filer
  const handlePdfClick = (fileUrl: string, fileName: string) => {
    console.log("Öppnar PDF:", fileUrl, fileName);
    setSelectedPdf({ url: fileUrl, name: fileName });
    setPdfDialogOpen(true);
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
      <Box p={3}>
        <Typography color="danger" level="body-lg">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!folderData) {
    return (
      <Box p={3}>
        <Typography level="body-lg">
          Ingen information hittades för den här mappen.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Sheet
        variant="outlined"
        sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none',
          borderRadius: 0
        }}
      >
        <Typography level="h3">{folderData.name}</Typography>
        <Box>
          <Typography level="body-sm">Project Leader</Typography>
          <Button 
            size="sm" 
            variant="outlined" 
            color="neutral"
            sx={{ ml: 1 }}
          >
            Logga ut
          </Button>
        </Box>
      </Sheet>

      {/* Toolbar */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2,
          bgcolor: '#f5f5f5'
        }}
      >
        <Input
          size="sm"
          placeholder="Sök efter filer..."
          startDecorator={<SearchIcon />}
          sx={{ width: 300 }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="sm"
            variant="soft"
            color="primary"
            startDecorator={<AddIcon />}
            onClick={() => setUploadDialogOpen(true)}
          >
            Ladda upp
          </Button>
          <Button 
            size="sm"
            variant="soft"
            color="danger"
            startDecorator={<FolderIcon />}
          >
            Ta bort mapp
          </Button>
        </Box>
      </Box>

      {/* Files Table */}
      <Box sx={{ p: 0 }}>
        <Table sx={{ '& th': { fontWeight: 'bold', py: 1.5 } }}>
          <thead>
            <tr>
              <th>NAMN</th>
              <th>VERSION</th>
              <th>BESKRIVNING</th>
              <th>UPPLADDAD</th>
              <th>UPPLADDAD AV</th>
              <th>MAPP</th>
              <th>STATUS</th>
              <th>ID</th>
              <th>ÅTGÄRDER</th>
            </tr>
          </thead>
          <tbody>
            {folderData.files.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '20px' }}>
                  <Typography level="body-sm" sx={{ fontStyle: 'italic' }}>
                    Inga dokument finns i denna mapp.
                  </Typography>
                </td>
              </tr>
            ) : (
              folderData.files.map((file, index) => (
                <FileRow
                  key={`${file.name}-${index}`}
                  name={file.name}
                  version="1"
                  description="Ingen beskrivning"
                  uploadedAt={new Date(file.uploaded_at).toLocaleDateString()}
                  uploadedBy="user@example.com"
                  folder={folderData.name}
                  id={file.id || `pdf_${index}`}
                  fileUrl={file.file}
                  onDelete={handleDeleteFile}
                  onPdfClick={handlePdfClick}
                />
              ))
            )}
          </tbody>
        </Table>
      </Box>
      
      {/* Upload Dialog */}
      <UploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        folderSlug={slug}
        onSuccess={handleUploadSuccess}
      />
      
      {/* PDF Viewer Dialog */}
      {selectedPdf && (
        <PDFDialog
          open={pdfDialogOpen}
          onClose={() => setPdfDialogOpen(false)}
          pdfUrl={selectedPdf.url}
          filename={selectedPdf.name}
        />
      )}
    </Box>
  );
};

export default FolderPageNew;