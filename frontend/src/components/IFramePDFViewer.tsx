import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';
import { FullscreenOutlined, Refresh } from '@mui/icons-material';

interface IFramePDFViewerProps {
  pdfUrl: string;
  fileName?: string;
  onClose?: () => void;
}

/**
 * En enkel PDF-visare som använder iframe för bättre kompatibilitet 
 * med Replit-miljön och andra plattformar
 */
const IFramePDFViewer: React.FC<IFramePDFViewerProps> = ({
  pdfUrl,
  fileName = 'Document',
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(Date.now()); // För att forcera omrendering

  // Extrahera filnamnet från URL om det behövs
  const extractedFileName = pdfUrl.split('/').pop() || fileName;
  
  // Skapa en alternativ direkt URL för bättre kompatibilitet
  let directUrl = '';
  if (extractedFileName.endsWith('.pdf')) {
    directUrl = `/api/pdf-direct/${extractedFileName}`;
  }
  
  // Om vi har en alternativ direktvg, använd den, annars används ursprunglig URL
  const finalUrl = directUrl || pdfUrl;

  // Hantera laddning klar-händelse
  const handleLoad = () => {
    setLoading(false);
  };

  // Hantera felaktiga URL:er eller laddningsfel
  const handleError = () => {
    setError('PDF kunde inte visas. Vänligen försök öppna den i ny flik.');
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
    window.open(finalUrl, '_blank');
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
              {error || 'Det gick inte att visa dokumentet direkt i applikationen.'}
            </Typography>
            <Button 
              onClick={openInNewTab}
              variant="solid"
              color="primary"
              startDecorator={<FullscreenOutlined />}
            >
              Öppna i ny flik
            </Button>
          </Box>
        )}
        
        {/* Iframe för att visa PDF-filen */}
        <iframe
          key={key}
          src={finalUrl}
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

export default IFramePDFViewer;