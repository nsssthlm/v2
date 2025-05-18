import React from 'react';
import { 
  Modal, 
  ModalDialog, 
  Typography, 
  IconButton, 
  Box,
  Tab,
  TabList,
  Tabs,
  Sheet
} from '@mui/joy';
import CloseIcon from '@mui/icons-material/Close';
import PDFJSViewer from './PDFJSViewer';

interface PDFJSDialogProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  filename: string;
}

const PDFJSDialog: React.FC<PDFJSDialogProps> = ({ 
  open, 
  onClose, 
  pdfUrl, 
  filename 
}) => {
  const [activeTab, setActiveTab] = React.useState('detaljer');

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        variant="outlined"
        sx={{
          width: '90vw',
          height: '90vh',
          maxWidth: '1400px',
          p: 0,
          overflow: 'hidden',
          borderRadius: 'md',
          boxShadow: 'lg'
        }}
      >
        {/* Layout med header, main content och sidebar */}
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <Sheet 
            sx={{ 
              p: 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: '#f5f5f5'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton 
                onClick={onClose}
                variant="plain"
                color="neutral"
              >
                <CloseIcon />
              </IconButton>
              <Typography level="title-lg">{filename}</Typography>
            </Box>
          </Sheet>

          {/* Main content area */}
          <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
            {/* PDF Viewer */}
            <Box 
              sx={{ 
                flex: 1,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: '8px',
                  bgcolor: '#4caf50',
                  zIndex: 5
                }
              }}
            >
              <PDFJSViewer 
                pdfUrl={pdfUrl} 
                filename={filename}
              />
            </Box>

            {/* Sidebar */}
            <Sheet 
              sx={{ 
                width: 320, 
                display: 'flex', 
                flexDirection: 'column',
                borderLeft: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden'
              }}
            >
              <Tabs
                value={activeTab}
                onChange={(_, value) => setActiveTab(value as string)}
              >
                <TabList>
                  <Tab value="detaljer">Detaljer</Tab>
                  <Tab value="historik">Historik</Tab>
                  <Tab value="kommentarer">Kommentarer</Tab>
                </TabList>
              </Tabs>
              
              <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
                {activeTab === 'detaljer' && (
                  <>
                    <Typography level="title-md" sx={{ mb: 2 }}>Dokumentdetaljer</Typography>
                    <Typography level="body-sm">
                      <strong>Filnamn:</strong> {filename}
                    </Typography>
                    <Typography level="body-sm">
                      <strong>Tillagd:</strong> {new Date().toLocaleDateString()}
                    </Typography>
                    <Typography level="body-sm">
                      <strong>Tillagd av:</strong> Användare
                    </Typography>
                  </>
                )}
                
                {activeTab === 'historik' && (
                  <>
                    <Typography level="title-md" sx={{ mb: 2 }}>Versionshistorik</Typography>
                    <Typography level="body-sm">
                      Det finns inga tidigare versioner av detta dokument.
                    </Typography>
                  </>
                )}
                
                {activeTab === 'kommentarer' && (
                  <>
                    <Typography level="title-md" sx={{ mb: 2 }}>Kommentarer</Typography>
                    <Typography level="body-sm">
                      Inga kommentarer har lagts till för detta dokument.
                    </Typography>
                  </>
                )}
              </Box>
            </Sheet>
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default PDFJSDialog;