import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';
import { FullscreenOutlined, Refresh, PictureAsPdf } from '@mui/icons-material';

interface DirectPDFViewerProps {
  pdfUrl: string;
  fileName?: string;
  onClose?: () => void;
}

/**
 * Direkt PDF-visare som använder en kombination av iframe och objekttaggar
 * med flera fallback-alternativ för maximal kompatibilitet
 */
const DirectPDFViewer: React.FC<DirectPDFViewerProps> = ({
  pdfUrl,
  fileName = 'Document',
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState<number>(Date.now());
  const [viewMode, setViewMode] = useState<'object' | 'iframe' | 'embed'>('object');
  
  // Extrahera filnamnet från URL:en om det finns
  const extractedFileName = pdfUrl.split('/').pop() || fileName;
  
  // Skapa direkt URL för PDF-fil baserat på filnamn
  const directPdfUrl = `/api/pdf-direct/${extractedFileName}`;
  
  // Används för att forcera omrendering
  const refreshViewer = () => {
    setLoading(true);
    setError(null);
    setKey(Date.now());
  };
  
  // Växla mellan olika visningslägen om ett misslyckas
  const toggleViewMode = () => {
    if (viewMode === 'object') {
      setViewMode('iframe');
    } else if (viewMode === 'iframe') {
      setViewMode('embed');
    } else {
      setViewMode('object');
    }
    refreshViewer();
  };
  
  // Öppna i ny flik
  const openInNewTab = () => {
    window.open(directPdfUrl, '_blank');
  };
  
  // Hantera laddningsfel
  const handleError = () => {
    setError(`PDF-filen kunde inte visas i ${viewMode}-läge.`);
    setLoading(false);
  };
  
  // När PDF:en har laddats
  const handleLoad = () => {
    setLoading(false);
    setError(null);
  };
  
  // Rendera PDF-visaren baserat på valt läge
  const renderPdfViewer = () => {
    switch (viewMode) {
      case 'object':
        return (
          <object
            key={key}
            data={directPdfUrl}
            type="application/pdf"
            width="100%"
            height="100%"
            style={{ display: loading ? 'none' : 'block' }}
            onLoad={handleLoad}
            onError={handleError}
          >
            <p>Din webbläsare stödjer inte inbäddade PDF-filer.</p>
            <Button onClick={toggleViewMode} variant="soft" color="primary">
              Prova annat visningsläge
            </Button>
          </object>
        );
        
      case 'iframe':
        return (
          <iframe
            key={key}
            src={directPdfUrl}
            width="100%"
            height="100%"
            style={{ border: 'none', display: loading ? 'none' : 'block' }}
            title={fileName}
            onLoad={handleLoad}
            onError={handleError}
          />
        );
        
      case 'embed':
        return (
          <embed
            key={key}
            src={directPdfUrl}
            type="application/pdf"
            width="100%"
            height="100%"
            style={{ display: loading ? 'none' : 'block' }}
          />
        );
        
      default:
        return null;
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
            startDecorator={<PictureAsPdf fontSize="small" />}
          >
            Byt visningsläge
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
            onClick={refreshViewer} 
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
        {loading && (
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <CircularProgress />
            <Typography level="body-sm">Laddar PDF...</Typography>
          </Box>
        )}
        
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
        
        {renderPdfViewer()}
      </Box>
    </Box>
  );
};

export default DirectPDFViewer;