import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Sheet, 
  Tabs,
  TabList,
  Tab,
  Avatar,
  CircularProgress
} from '@mui/joy';

// Import Lucide icons
import { 
  ChevronLeft, 
  ChevronRight,
  ZoomIn, 
  ZoomOut,
  X,
  Upload,
  ExternalLink,
  FileDown,
  RefreshCw
} from "lucide-react";

interface ReliablePDFViewerProps {
  fileId?: string | number;
  initialUrl?: string;
  filename?: string;
  onClose?: () => void;
  projectId?: number | null;
  folderId?: number | null;
}

/**
 * En pålitlig PDF-visningskomponent som prioriterar maximal kompatibilitet
 * genom att använda inbyggda webb-tekniker för visning.
 */
const ReliablePDFViewer = ({
  fileId,
  initialUrl,
  filename = 'PDF Dokument',
  onClose,
  projectId,
  folderId
}: ReliablePDFViewerProps) => {
  const [activeTab, setActiveTab] = useState<string>('detaljer');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [finalUrl, setFinalUrl] = useState<string>('');
  const [key, setKey] = useState(Date.now()); // För att tvinga omrendering

  // Bearbeta URL:en för att maximera chansen att visa PDF:en korrekt
  useEffect(() => {
    const processUrl = () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Försöker visa PDF från ursprunglig URL:', initialUrl);
        
        // Om vi har en initialUrl, använd den som bas
        if (initialUrl) {
          // Lägg till nocache-parameter för att förhindra caching
          const separator = initialUrl.includes('?') ? '&' : '?';
          const urlWithCache = `${initialUrl}${separator}nocache=${Date.now()}`;
          
          // Om URL:en innehåller 0.0.0.0:8001, ersätt med window.location.origin
          let finalUrl = urlWithCache;
          if (finalUrl.includes('0.0.0.0:8001')) {
            const apiPath = finalUrl.split('0.0.0.0:8001')[1];
            finalUrl = `${window.location.origin}${apiPath}`;
          }
          
          // Om URL:en innehåller media/project_files, optimera den
          if (initialUrl.includes('project_files')) {
            // Extrahera filnamnet från URL:en
            const parts = initialUrl.split('/');
            const filename = parts[parts.length - 1];
            
            // Försök hitta år/månad/dag-delar i URL:en för att skapa media-URL
            const projectFilesIndex = parts.indexOf('project_files');
            if (projectFilesIndex !== -1 && projectFilesIndex + 3 < parts.length) {
              const year = parts[projectFilesIndex + 1];
              const month = parts[projectFilesIndex + 2];
              const day = parts[projectFilesIndex + 3];
              
              // Skapa direkt media-URL
              const mediaUrl = `/media/project_files/${year}/${month}/${day}/${filename}`;
              console.log('Försöker med direkt media-URL:', mediaUrl);
              
              // Spara den originala URL:en som fallback
              setFinalUrl(mediaUrl);
              return;
            }
          }
          
          setFinalUrl(finalUrl);
          return;
        }
        
        // Om vi har ett fileId men ingen URL, använd API:et direkt
        if (fileId) {
          const apiUrl = `/api/files/get-file-content/${fileId}/`;
          console.log('Använder API URL baserat på fileId:', apiUrl);
          setFinalUrl(apiUrl);
          return;
        }
        
        // Om vi inte har någon URL eller fileId, visa ett fel
        throw new Error('Ingen giltlig källa för PDF-fil angiven');
      } catch (err) {
        console.error('Fel vid förberedelse av PDF-URL:', err);
        setError(err instanceof Error ? err.message : 'Kunde inte förbereda PDF-URL.');
      }
    };
    
    processUrl();
  }, [initialUrl, fileId]);
  
  // Hantera när iframe har laddats
  const handleLoad = () => {
    setLoading(false);
    console.log('PDF laddad framgångsrikt från:', finalUrl);
  };
  
  // Hantera laddningsfel
  const handleError = () => {
    console.error('Kunde inte ladda PDF från URL:', finalUrl);
    setError('Kunde inte visa PDF-filen. Försök med att öppna i ny flik eller ladda ner filen.');
    setLoading(false);
  };
  
  // Ladda om PDF-filen
  const reloadPdf = () => {
    setLoading(true);
    setError(null);
    setKey(Date.now()); // Tvingar iframe att ladda om
  };
  
  // Öppna i ny flik
  const openInNewTab = () => {
    if (finalUrl) {
      window.open(finalUrl, '_blank');
    } else if (initialUrl) {
      window.open(initialUrl, '_blank');
    }
  };
  
  // Hantera nedladdning
  const downloadPdf = () => {
    const downloadUrl = finalUrl || initialUrl;
    if (downloadUrl) {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Header */}
      <Sheet 
        variant="outlined"
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 1,
          px: 2,
          borderTopLeftRadius: 'md',
          borderTopRightRadius: 'md',
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            variant="plain" 
            color="neutral" 
            onClick={onClose}
            sx={{ mr: 1 }}
          >
            <X size={18} />
          </IconButton>
          <Typography level="title-lg">{filename}</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Action buttons */}
          <Button
            size="sm"
            variant="plain"
            color="neutral"
            startDecorator={<RefreshCw size={16} />}
            onClick={reloadPdf}
          >
            Ladda om
          </Button>
          
          <Button
            size="sm"
            variant="plain"
            color="primary"
            startDecorator={<ExternalLink size={16} />}
            onClick={openInNewTab}
          >
            Öppna i ny flik
          </Button>
          
          <Button
            size="sm"
            variant="plain"
            color="primary"
            startDecorator={<FileDown size={16} />}
            onClick={downloadPdf}
          >
            Ladda ner
          </Button>
        </Box>
      </Sheet>
      
      {/* Main content */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* PDF Viewer */}
        <Box 
          sx={{ 
            flex: 1, 
            bgcolor: '#f5f5f5',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {loading && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              gap: 2
            }}>
              <CircularProgress size="lg" />
              <Typography level="body-sm">
                Laddar PDF...
              </Typography>
            </Box>
          )}
          
          {error ? (
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              p: 3,
              gap: 2
            }}>
              <Typography level="title-lg" color="danger">
                Kunde inte ladda PDF
              </Typography>
              <Typography level="body-md" sx={{ mb: 2 }}>
                {error}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  onClick={reloadPdf}
                  variant="soft"
                  color="neutral"
                  startDecorator={<RefreshCw size={16} />}
                >
                  Försök igen
                </Button>
                
                <Button 
                  onClick={openInNewTab}
                  variant="solid"
                  color="primary"
                  startDecorator={<ExternalLink size={16} />}
                >
                  Öppna i ny flik
                </Button>
              </Box>
            </Box>
          ) : (
            <iframe
              key={key}
              src={finalUrl}
              width="100%"
              height="100%"
              style={{ 
                border: 'none',
                backgroundColor: '#f5f5f5'
              }}
              title={filename}
              onLoad={handleLoad}
              onError={handleError}
              allowFullScreen
              sandbox="allow-same-origin allow-scripts allow-popups"
            />
          )}
        </Box>
        
        {/* Sidebar */}
        <Sheet 
          variant="outlined"
          sx={{
            width: 320,
            display: 'flex',
            flexDirection: 'column',
            borderTop: 'none',
            borderBottom: 'none',
            borderRight: 'none',
          }}
        >
          {/* Tabs */}
          <Tabs 
            value={activeTab}
            onChange={(_, value) => setActiveTab(value as string)}
          >
            <TabList sx={{ borderRadius: 0 }}>
              <Tab value="detaljer">Detaljer</Tab>
              <Tab value="historik">Historik</Tab>
              <Tab value="kommentar">Kommentar</Tab>
            </TabList>
          </Tabs>
          
          {/* Tab content */}
          <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
            {activeTab === 'detaljer' && (
              <>
                <Typography level="title-md" sx={{ mb: 2 }}>PDF Anteckning</Typography>
                
                <Box sx={{ mb: 4 }}>
                  <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                    Skapad av
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar 
                      size="sm" 
                      sx={{ bgcolor: 'primary.400' }}
                    />
                    <Box>
                      <Typography level="body-sm">user@example.com</Typography>
                      <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                        2025-05-16
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 4 }}>
                  <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                    Deadline
                  </Typography>
                  <Typography level="body-sm">22 maj 2025</Typography>
                </Box>
                
                <Box sx={{ mb: 4 }}>
                  <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                    Granskningspaket
                  </Typography>
                  <Typography level="body-sm">K - Granskning BH Hus 3-4</Typography>
                </Box>
                
                <Box sx={{ mb: 4 }}>
                  <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                    Typ
                  </Typography>
                  <Typography level="body-sm">Gransknings kommentar</Typography>
                </Box>
                
                <Box sx={{ mb: 4 }}>
                  <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                    Aktivitet
                  </Typography>
                  <Button
                    variant="outlined"
                    color="neutral"
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    VERSIONER
                  </Button>
                </Box>
              </>
            )}
            
            {activeTab === 'historik' && (
              <>
                <Typography level="title-md" sx={{ mb: 2 }}>Versionshistorik</Typography>
                <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                  Ingen versionshistorik tillgänglig för detta dokument.
                </Typography>
              </>
            )}
            
            {activeTab === 'kommentar' && (
              <>
                <Typography level="title-md" sx={{ mb: 2 }}>Kommentarer</Typography>
                <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                  Inga kommentarer har lagts till än.
                </Typography>
              </>
            )}
          </Box>
        </Sheet>
      </Box>
    </Box>
  );
};

export default ReliablePDFViewer;