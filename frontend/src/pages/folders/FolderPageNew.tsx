import { useState, useEffect } from 'react';
import PDFDialog from '../../components/PDFDialog';
import PDFUploader from '../../components/PDFUploader';
import { Box, Typography, Button, List, ListItem, ListItemContent } from '@mui/joy';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FolderIcon from '@mui/icons-material/Folder';

const FolderPageNew: React.FC = () => {
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<{ url: string; name: string } | null>(null);
  const [files, setFiles] = useState([
    { id: 1, name: 'BEAst-PDF-Guidelines-2_1r4W7o4.0_1.pdf', url: 'http://0.0.0.0:8001/media/project_files/2025/05/19/BEAst-PDF-Guidelines-2_1r4W7o4.0_1.pdf' },
    { id: 2, name: 'BEAst-PDF-Guidelines-2.0_1.pdf', url: 'http://0.0.0.0:8001/media/project_files/2025/05/19/BEAst-PDF-Guidelines-2.0_1.pdf' },
  ]);

  const handlePdfClick = (file: { name: string; url: string }) => {
    setSelectedPdf({ url: file.url, name: file.name });
    setPdfDialogOpen(true);
  };

  // Funktion som anropas efter lyckad uppladdning
  const handleUploadSuccess = () => {
    // I en riktig implementation skulle vi uppdatera fillistan från servern
    // För nu simulerar vi en ny fil
    const newFile = {
      id: files.length + 1,
      name: `Ny-PDF-${new Date().toISOString().slice(0, 10)}.pdf`,
      url: `http://0.0.0.0:8001/media/project_files/2025/05/19/Ny-PDF-${new Date().toISOString().slice(0, 10)}.pdf`
    };
    setFiles([...files, newFile]);
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Typography level="h2">Dokumenthanterare</Typography>
        <PDFUploader 
          folderId="1" 
          onUploadSuccess={handleUploadSuccess} 
        />
      </Box>

      <Box sx={{ 
        display: 'flex',
        gap: 2,
        mb: 2
      }}>
        <Box 
          sx={{ 
            width: '250px', 
            bgcolor: 'background.surface', 
            borderRadius: 'md',
            p: 2,
            boxShadow: 'sm'
          }}
        >
          <Typography level="title-lg" sx={{ mb: 2 }}>Mappar</Typography>
          <List>
            <ListItem>
              <ListItemContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FolderIcon sx={{ color: 'primary.500' }} />
                  <Typography>Huvudmapp</Typography>
                </Box>
              </ListItemContent>
            </ListItem>
            <ListItem>
              <ListItemContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FolderIcon sx={{ color: 'primary.500' }} />
                  <Typography>Ritningar</Typography>
                </Box>
              </ListItemContent>
            </ListItem>
            <ListItem>
              <ListItemContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FolderIcon sx={{ color: 'primary.500' }} />
                  <Typography>Kontrakt</Typography>
                </Box>
              </ListItemContent>
            </ListItem>
          </List>
        </Box>

        <Box 
          sx={{ 
            flex: 1, 
            bgcolor: 'background.surface', 
            borderRadius: 'md',
            p: 2,
            boxShadow: 'sm'
          }}
        >
          <Typography level="title-lg" sx={{ mb: 2 }}>Dokument</Typography>
          <List>
            {files.map(file => (
              <ListItem 
                key={file.id} 
                onClick={() => handlePdfClick(file)} 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                  borderRadius: 'sm',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <ListItemContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PictureAsPdfIcon sx={{ color: 'error.600' }} />
                    <Typography>{file.name}</Typography>
                  </Box>
                </ListItemContent>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

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