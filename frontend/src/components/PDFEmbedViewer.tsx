import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';
import { FullscreenOutlined, Refresh } from '@mui/icons-material';

interface PDFEmbedViewerProps {
  pdfUrl: string;
  fileName?: string;
  onClose?: () => void;
}

/**
 * En enkel PDF-visare som använder embed-taggen för maximal kompatibilitet
 * Fungerar också med iframe som fallback
 */
const PDFEmbedViewer: React.FC<PDFEmbedViewerProps> = ({
  pdfUrl,
  fileName = 'Document',
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'embed' | 'iframe'>('embed');
  
  // För att tvinga omrendering
  const [key, setKey] = useState(Date.now());
  
  // Extrahera filnamnet från URL:en om det behövs
  const extractedFileName = pdfUrl.split('/').pop() || fileName;
  
  // Skapa en direktåtkomst-URL för PDF-filen om den inte redan är det
  let finalUrl = pdfUrl;
  if (extractedFileName.endsWith('.pdf')) {
    // Använd direkt API-åtkomst som alltid
    finalUrl = `/api/pdf-direct/${extractedFileName}`;
  }
  
  // Ladda om visaren
  const reloadPdf = () => {
    setLoading(true);
    setError(null);
    setKey(Date.now());
  };
  
  // Byt visningsläge
  const toggleViewMode = () => {
    setViewMode(viewMode === 'embed' ? 'iframe' : 'embed');
    reloadPdf();
  };
  
  // Öppna i ny flik
  const openInNewTab = () => {
    window.open(finalUrl, '_blank');
  };
  
  // Hantera laddningshändelser
  const handleLoad = () => {
    setLoading(false);
  };
  
  const handleError = () => {
    setError(`PDF kunde inte visas i ${viewMode}-läge.`);
    setLoading(false);
  };
  
  // Rendera PDF-visaren baserat på valt läge
  const renderPDFViewer = () => {
    if (viewMode === 'embed') {
      return (
        <embed
          key={key}
          src={finalUrl}
          type="application/pdf"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
      );
    } else {
      return (
        <iframe
          key={key}
          src={finalUrl}
          width="100%"
          height="100%"
          style={{ 
            border: 'none',
            display: loading ? 'none' : 'block'
          }}
          onLoad={handleLoad}
          onError={handleError}
        />
      );
    }
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
            onClick={toggleViewMode} 
            variant="outlined"
            size="sm"
          >
            {viewMode === 'embed' ? 'Visa i iframe' : 'Visa i embed'}
          </Button>
          
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
        {/* Visa laddningsindikatorn */}
        {loading && viewMode === 'iframe' && (
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
                onClick={toggleViewMode}
                variant="solid"
                color="primary"
              >
                Prova annat visningsläge
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
        
        {/* PDF-visare */}
        {renderPDFViewer()}
      </Box>
    </Box>
  );
};

export default PDFEmbedViewer;