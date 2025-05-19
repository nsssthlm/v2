import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';
import { ZoomIn, ZoomOut, NavigateBefore, NavigateNext, FullscreenOutlined } from '@mui/icons-material';
import axios from 'axios';

interface BasicPDFViewerProps {
  pdfUrl: string;
  fileName?: string;
  onClose?: () => void;
}

/**
 * A simpler PDF viewer that doesn't use PDF.js but still provides PDF viewing functionality
 * by fetching the PDF directly as a blob and using an object tag for display
 */
const BasicPDFViewer: React.FC<BasicPDFViewerProps> = ({
  pdfUrl,
  fileName = 'Document',
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [scale, setScale] = useState(100);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch the PDF directly to avoid CORS issues
  useEffect(() => {
    const fetchPdf = async () => {
      try {
        console.log('Fetching PDF from URL:', pdfUrl);
        const response = await axios.get(pdfUrl, { 
          responseType: 'blob',
          // Include credentials for cross-origin requests
          withCredentials: true
        });
        
        // Convert blob to data URL for embedding
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfDataUrl(url);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching PDF:', err);
        setError(err instanceof Error ? err : new Error('Failed to load PDF'));
        setLoading(false);
      }
    };

    fetchPdf();

    // Clean up URL object on unmount
    return () => {
      if (pdfDataUrl) {
        URL.revokeObjectURL(pdfDataUrl);
      }
    };
  }, [pdfUrl]);

  // Zoom functions
  const zoomIn = () => setScale(prev => Math.min(prev + 10, 200));
  const zoomOut = () => setScale(prev => Math.max(prev - 10, 50));

  // Page navigation functions (simplified without actual page detection)
  const goToPrevPage = () => setCurrentPage(p => Math.max(p - 1, 1));
  const goToNextPage = () => setCurrentPage(p => p + 1);

  // Open in new tab function
  const openInNewTab = () => {
    if (pdfDataUrl) {
      window.open(pdfDataUrl, '_blank');
    } else {
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      width: '100%', 
      bgcolor: 'background.paper',
      borderRadius: 'md',
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

      {/* Controls */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 1,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button 
            onClick={goToPrevPage} 
            variant="outlined"
            size="sm"
            disabled={currentPage <= 1}
          >
            <NavigateBefore fontSize="small" />
          </Button>
          
          <Typography level="body-sm" sx={{ minWidth: '70px', textAlign: 'center' }}>
            Sida {currentPage}
          </Typography>
          
          <Button 
            onClick={goToNextPage} 
            variant="outlined"
            size="sm"
          >
            <NavigateNext fontSize="small" />
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button 
            onClick={zoomOut} 
            variant="plain"
            size="sm"
            disabled={scale <= 50}
          >
            <ZoomOut fontSize="small" />
          </Button>
          
          <Typography level="body-sm" sx={{ minWidth: '50px', textAlign: 'center' }}>
            {scale}%
          </Typography>
          
          <Button 
            onClick={zoomIn} 
            variant="plain"
            size="sm"
            disabled={scale >= 200}
          >
            <ZoomIn fontSize="small" />
          </Button>
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
            transform: 'translate(-50%, -50%)'
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
              {error.message || 'Det gick inte att visa dokumentet direkt i applikationen.'}
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
        
        {pdfDataUrl && !error && (
          <Box sx={{ 
            height: '100%', 
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start'
          }}>
            <object
              data={pdfDataUrl}
              type="application/pdf"
              style={{ 
                width: `${scale}%`, 
                height: `${scale}%`,
                transformOrigin: 'top center' 
              }}
            >
              <Box sx={{ 
                p: 3, 
                textAlign: 'center',
                bgcolor: 'background.paper'
              }}>
                <Typography level="body-lg">
                  Din webbläsare stödjer inte inbäddade PDF-filer.
                </Typography>
                <Button 
                  onClick={openInNewTab}
                  variant="solid"
                  color="primary"
                  sx={{ mt: 2 }}
                  startDecorator={<FullscreenOutlined />}
                >
                  Öppna i ny flik
                </Button>
              </Box>
            </object>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default BasicPDFViewer;