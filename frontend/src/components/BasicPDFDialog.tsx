import React from 'react';
import { 
  Modal, 
  ModalDialog, 
  Box, 
  Typography, 
  IconButton, 
  Tab, 
  TabList, 
  Tabs, 
  Sheet 
} from '@mui/joy';
import CloseIcon from '@mui/icons-material/Close';
import BasicPDFViewer from './BasicPDFViewer';

interface BasicPDFDialogProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  filename: string;
}

/**
 * En mycket enkel dialog för att visa PDF-filer med hög kompatibilitet
 */
const BasicPDFDialog: React.FC<BasicPDFDialogProps> = ({ 
  open, 
  onClose, 
  pdfUrl, 
  filename 
}) => {
  const [activeTab, setActiveTab] = React.useState('detaljer');

  return (
    <Modal
      open={open}
      onClose={onClose}
    >
      <ModalDialog
        sx={{
          width: '90vw',
          maxWidth: '1200px',
          height: '90vh',
          maxHeight: '800px',
          p: 0,
          overflow: 'hidden',
          borderRadius: 'md',
          boxShadow: 'lg'
        }}
      >
        {/* Dialog layout */}
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <Sheet
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={onClose} variant="plain">
                <CloseIcon />
              </IconButton>
              <Typography level="title-md">{filename}</Typography>
            </Box>
          </Sheet>

          {/* Content area - split into PDF viewer and sidebar */}
          <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
            {/* PDF viewer area */}
            <Box 
              sx={{ 
                flex: 1, 
                position: 'relative', 
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '4px',
                  bgcolor: '#4caf50',
                  zIndex: 10
                }
              }}
            >
              <BasicPDFViewer pdfUrl={pdfUrl} filename={filename} />
            </Box>

            {/* Sidebar */}
            <Sheet 
              sx={{ 
                width: 300, 
                borderLeft: '1px solid', 
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Tabs */}
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

              {/* Tab content */}
              <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
                {activeTab === 'detaljer' && (
                  <Typography level="body-md">
                    Detta är en PDF-fil som heter: {filename}
                  </Typography>
                )}
                {activeTab === 'historik' && (
                  <Typography level="body-md">
                    Versionshistorik kommer att visas här.
                  </Typography>
                )}
                {activeTab === 'kommentarer' && (
                  <Typography level="body-md">
                    Kommentarer kommer att visas här.
                  </Typography>
                )}
              </Box>
            </Sheet>
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default BasicPDFDialog;