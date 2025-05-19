import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';
import { FullscreenOutlined, Refresh } from '@mui/icons-material';

interface StraightPDFViewerProps {
  pdfUrl: string;
  fileName?: string;
  onClose?: () => void;
}

/**
 * En extremt förenklad PDF-visare som följer Django:s standardmönster för att servera filer
 */
const StraightPDFViewer: React.FC<StraightPDFViewerProps> = ({
  pdfUrl,
  fileName = 'Document',
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Extrahera filnamnet från URL:en om det behövs
  const extractedFileName = pdfUrl.split('/').pop() || fileName;
  
  // Hitta datum i URL:en om det finns
  const dateMatch = pdfUrl.match(/(\d{4})\/(\d{2})\/(\d{2})/);
  
  // Skapa en direkt media URL baserad på originallänken
  const mediaUrl = dateMatch 
    ? `/media/project_files/${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}/${extractedFileName}`
    : `/media/${extractedFileName}`;
  
  console.log("Försöker visa PDF från:", mediaUrl);
  
  // Hantera laddningshändelser
  const handleLoad = () => {
    setLoading(false);
  };
  
  const handleError = () => {
    setError('PDF-filen kunde inte visas. Försök öppna den i ny flik.');
    setLoading(false);
  };
  
  // Öppna i ny flik med original URL
  const openInNewTab = () => {
    // Använd original URL för ny flik
    window.open(pdfUrl, '_blank');
  };
  
  // Öppna med media URL i ny flik
  const openMediaUrlInNewTab = () => {
    window.open(mediaUrl, '_blank');
  };
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      width: '100%', 
      bgcolor: 'background.paper',
      borderRadius: 'sm',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 1,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography level="title-md" sx={{ 
          flexGrow: 1, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {fileName}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            onClick={openInNewTab} 
            variant="outlined"
            size="sm"
            startDecorator={<FullscreenOutlined fontSize="small" />}
          >
            Öppna API URL
          </Button>
          
          <Button 
            onClick={openMediaUrlInNewTab} 
            variant="outlined"
            size="sm"
            startDecorator={<FullscreenOutlined fontSize="small" />}
          >
            Öppna Media URL
          </Button>
          
          {onClose && (
            <Button 
              onClick={onClose} 
              variant="plain"
              size="sm"
            >
              Stäng
            </Button>
          )}
        </Box>
      </Box>

      {/* PDF Viewer Area */}
      <Box sx={{ 
        flex: 1, 
        position: 'relative',
        overflow: 'auto',
        bgcolor: 'grey.100'
      }}>
        {/* Visa laddningsindikator */}
        {loading && (
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <CircularProgress />
            <Typography level="body-sm">Laddar PDF...</Typography>
          </Box>
        )}
        
        {/* Visa felmeddelande om laddningen misslyckades */}
        {error && (
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography level="body-md">
                Testa direktlänkarna nedan:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  onClick={openInNewTab}
                  variant="solid"
                  color="primary"
                >
                  API URL
                </Button>
                <Button 
                  onClick={openMediaUrlInNewTab}
                  variant="solid"
                  color="primary"
                >
                  Media URL
                </Button>
              </Box>
            </Box>
          </Box>
        )}
        
        {/* PDF Viewer */}
        <object
          data={mediaUrl}
          type="application/pdf"
          width="100%"
          height="100%"
          style={{ 
            border: 'none',
            display: loading ? 'none' : (error ? 'none' : 'block')
          }}
          onLoad={handleLoad}
          onError={handleError}
        >
          <p>Din webbläsare kan inte visa PDF-filer. <Button onClick={openMediaUrlInNewTab}>Ladda ned PDF</Button></p>
        </object>
      </Box>
    </Box>
  );
};

export default StraightPDFViewer;