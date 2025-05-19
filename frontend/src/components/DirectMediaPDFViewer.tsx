import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';
import { FullscreenOutlined, Refresh } from '@mui/icons-material';

interface DirectMediaPDFViewerProps {
  pdfUrl: string;
  fileName?: string;
  onClose?: () => void;
}

/**
 * En PDF-visare som använder direktlänkar till media-katalogen för att visa PDF-filer
 * Denna komponent följer Django:s fillagringskonvention
 */
const DirectMediaPDFViewer: React.FC<DirectMediaPDFViewerProps> = ({
  pdfUrl,
  fileName = 'Document',
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(Date.now()); // För omrendering
  
  // Extrahera filnamnet från URL:en om det behövs
  const extractedFileName = pdfUrl.split('/').pop() || fileName;
  
  // Originalfilen finns i Django's media-katalog enligt modellen i files/models.py
  // File model, upload_to='project_files/%Y/%m/%d/'
  
  // Extrahera datum från URL:en om möjligt
  const dateParts = pdfUrl.match(/(\d{4})\/(\d{2})\/(\d{2})/);
  let year = '2025';
  let month = '05';
  let day = '19';
  
  if (dateParts && dateParts.length >= 4) {
    [, year, month, day] = dateParts;
  }
  
  // Skapa en direktlänk till media-katalogen
  const mediaUrl = `/media/project_files/${year}/${month}/${day}/${extractedFileName}`;
  
  console.log("PDF URL direkt från media:", mediaUrl);
  
  // Hantera laddning och fel
  const handleLoad = () => {
    setLoading(false);
  };
  
  const handleError = () => {
    setError('Kunde inte visa PDF-filen. Prova att öppna i ny flik eller ladda om.');
    setLoading(false);
  };
  
  // Ladda om PDF-filen
  const reloadPdf = () => {
    setLoading(true);
    setError(null);
    setKey(Date.now());
  };
  
  // Öppna i ny flik
  const openInNewTab = () => {
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
            Öppna i ny flik
          </Button>
          
          <Button 
            onClick={reloadPdf} 
            variant="outlined"
            size="sm"
            startDecorator={<Refresh fontSize="small" />}
          >
            Ladda om
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
        overflow: 'hidden',
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
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                onClick={reloadPdf}
                variant="solid"
                color="primary"
              >
                Försök igen
              </Button>
              
              <Button 
                onClick={openInNewTab}
                variant="outlined"
                color="neutral"
                startDecorator={<FullscreenOutlined />}
              >
                Öppna i ny flik
              </Button>
            </Box>
          </Box>
        )}
        
        {/* Direkt embedded PDF-visare med iframe */}
        <iframe
          key={key}
          src={mediaUrl}
          width="100%"
          height="100%"
          style={{ 
            border: 'none', 
            display: loading ? 'none' : 'block' 
          }}
          title={fileName}
          onLoad={handleLoad}
          onError={handleError}
        />
      </Box>
    </Box>
  );
};

export default DirectMediaPDFViewer;