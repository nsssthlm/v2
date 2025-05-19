import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';
import { FullscreenOutlined, Refresh } from '@mui/icons-material';

interface ObjectPDFViewerProps {
  pdfUrl: string;
  fileName?: string;
  onClose?: () => void;
}

/**
 * PDF viewer that uses HTML object tag for consistent rendering
 * This provides better compatibility with most browsers
 */
const ObjectPDFViewer: React.FC<ObjectPDFViewerProps> = ({
  pdfUrl,
  fileName = 'Document',
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [objectKey, setObjectKey] = useState(Date.now()); // Used to force refresh

  // Function to handle when PDF loads
  const handleLoad = () => {
    setLoading(false);
  };

  // Function to handle errors
  const handleError = () => {
    setError('PDF kunde inte visas. Vänligen försök öppna den i ny flik.');
    setLoading(false);
  };

  // Function to reload the PDF
  const reloadPdf = () => {
    setLoading(true);
    setError(null);
    setObjectKey(Date.now()); // This forces the object to reload
  };

  // Open in new tab function
  const openInNewTab = () => {
    window.open(pdfUrl, '_blank');
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
        {loading && (
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 1
          }}>
            <CircularProgress />
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
        
        <object 
          key={objectKey}
          data={pdfUrl} 
          type="application/pdf" 
          width="100%" 
          height="100%"
          style={{ 
            zIndex: 0,
            display: loading ? 'none' : 'block' 
          }}
          onLoad={handleLoad}
          onError={handleError}
        >
          <p>Din webbläsare stödjer inte inbäddade PDF-filer.</p>
          <p>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              Klicka här för att öppna PDF-filen i en ny flik.
            </a>
          </p>
        </object>
        
        {/* Embedded iframe fallback if object tag fails to load */}
        {error && (
          <iframe
            src={pdfUrl}
            width="100%"
            height="100%"
            style={{ 
              border: 'none',
              zIndex: 0
            }}
            title={fileName}
            onLoad={() => setError(null)}
          />
        )}
      </Box>
    </Box>
  );
};

export default ObjectPDFViewer;