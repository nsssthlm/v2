import { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Sheet, CircularProgress, Tabs, Tab, TabList } from '@mui/joy';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface SimplePDFViewerProps {
  initialUrl?: string;
  filename?: string;
  onClose?: () => void;
}

export default function SimplePDFViewer({ initialUrl, filename, onClose }: SimplePDFViewerProps) {
  const [activeTab, setActiveTab] = useState<string>('details');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulera laddningstid
    if (initialUrl) {
      const timer = setTimeout(() => setIsLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [initialUrl]);

  const handleDownload = () => {
    if (initialUrl) {
      const link = document.createElement('a');
      link.href = initialUrl;
      link.download = filename || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        width: '100%',
        bgcolor: '#f9fafb',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '8px'
      }}
    >
      {/* Övre verktygsfält */}
      <Sheet
        variant="outlined"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {onClose && (
            <IconButton 
              variant="plain" 
              color="neutral" 
              size="sm" 
              onClick={onClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
          <Typography level="title-md" sx={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {filename || "Dokument"}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Sidnavigering */}
          <Button
            size="sm"
            variant="soft"
            color="primary"
            sx={{ 
              borderRadius: '4px 0 0 4px', 
              bgcolor: 'primary.100',
              '&:hover': { bgcolor: 'primary.200' } 
            }}
          >
            Sida 1 av 5
          </Button>
          
          {/* Prev/Next knappar */}
          <IconButton 
            variant="soft"
            color="primary" 
            size="sm"
            sx={{ borderRadius: 0 }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          
          <IconButton 
            variant="soft"
            color="primary" 
            size="sm"
            sx={{ borderRadius: '0 4px 4px 0' }}
          >
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
          
          {/* Funktionsknappar */}
          <Button
            variant="soft"
            color="primary"
            size="sm"
            startDecorator={<DownloadIcon />}
            onClick={handleDownload}
            sx={{ ml: 2 }}
          >
            Ladda ner
          </Button>
        </Box>
      </Sheet>
      
      {/* Huvudinnehåll */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* PDF-visare */}
        <Box 
          sx={{ 
            flex: 1, 
            overflow: 'auto', 
            bgcolor: '#333', // Mörk bakgrund
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: 'white' }}>
              <CircularProgress size="lg" />
              <Typography level="body-lg" sx={{ color: 'white' }}>Laddar dokument...</Typography>
            </Box>
          ) : initialUrl ? (
            <Box sx={{ width: '100%', height: '100%', p: 2 }}>
              <iframe 
                src={initialUrl} 
                width="100%" 
                height="100%" 
                style={{ 
                  border: 'none',
                  backgroundColor: 'white',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                }}
                title={filename || "PDF Dokument"}
              />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white' }}>
              <Typography level="h3">
                Ingen PDF vald eller kunde inte ladda dokumentet
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Högersidebar */}
        <Sheet
          variant="soft"
          sx={{
            width: 320,
            borderLeft: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'white'
          }}
        >
          {/* Flikar */}
          <Tabs 
            value={activeTab}
            onChange={(_, value) => setActiveTab(value as string)}
            sx={{ 
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          >
            <TabList variant="plain" sx={{ width: '100%' }}>
              <Tab value="details" variant={activeTab === 'details' ? 'soft' : 'plain'} sx={{ flex: 1 }}>Detaljer</Tab>
              <Tab value="history" variant={activeTab === 'history' ? 'soft' : 'plain'} sx={{ flex: 1 }}>Historik</Tab>
              <Tab value="comments" variant={activeTab === 'comments' ? 'soft' : 'plain'} sx={{ flex: 1 }}>Kommentar</Tab>
            </TabList>
          </Tabs>
          
          {/* Fliktinnehåll */}
          <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
            {activeTab === 'details' && (
              <>
                <Typography level="h4" sx={{ mb: 2 }}>PDF Anteckning</Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                    Skapad av
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box 
                      sx={{ 
                        width: 24, 
                        height: 24, 
                        bgcolor: 'primary.300', 
                        borderRadius: '50%' 
                      }} 
                    />
                    <Box>
                      <Typography level="body-sm">user@example.com</Typography>
                      <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                        2025-05-16
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                    Deadline
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography level="body-sm">22 maj 2025</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                    Granskningspaket
                  </Typography>
                  <Typography level="body-sm">K - Granskning BH Hus 3-4</Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                    Typ
                  </Typography>
                  <Typography level="body-sm">Gransknings kommentar</Typography>
                </Box>
              </>
            )}
            
            {activeTab === 'comments' && (
              <>
                <Typography level="h4" sx={{ mb: 2 }}>Kommentarer</Typography>
                <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                  Inga kommentarer har lagts till än. Markera ett område i dokumentet för att lägga till en kommentar.
                </Typography>
              </>
            )}
            
            {activeTab === 'history' && (
              <>
                <Typography level="h4" sx={{ mb: 2 }}>Versionshistorik</Typography>
                <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                  Ingen versionshistorik tillgänglig för detta dokument.
                </Typography>
              </>
            )}
          </Box>
        </Sheet>
      </Box>
    </Box>
  );
}