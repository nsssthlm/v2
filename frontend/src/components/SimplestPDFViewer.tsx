import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress, Modal, Sheet } from '@mui/joy';
import { Close as CloseIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';

interface SimplestPDFViewerProps {
  pdfUrl: string;
  fileName?: string;
  onClose?: () => void;
}

/**
 * Ultra simple PDF viewer that focuses on reliability over features
 * It provides two main ways to view the PDF:
 * 1. "Open in New Tab" button - opens the direct URL
 * 2. Google Docs viewer as a fallback option
 */
const SimplestPDFViewer: React.FC<SimplestPDFViewerProps> = ({
  pdfUrl,
  fileName = 'Document',
  onClose
}) => {
  const [viewingMethod, setViewingMethod] = useState<'none' | 'direct' | 'google'>('none');
  
  // Open in a new window directly
  const openDirectly = () => {
    window.open(pdfUrl, '_blank');
  };
  
  // Open using Google Docs viewer
  const openInGoogleViewer = () => {
    const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
    setViewingMethod('google');
    return googleDocsUrl;
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
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography level="title-lg" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {fileName}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            startDecorator={<OpenInNewIcon />}
            onClick={openDirectly}
            variant="outlined"
            size="sm"
            color="primary"
          >
            Öppna i ny flik
          </Button>
          {onClose && (
            <Button 
              startDecorator={<CloseIcon />}
              onClick={onClose} 
              variant="plain"
              size="sm"
            >
              Stäng
            </Button>
          )}
        </Box>
      </Box>

      {/* Content area */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 3,
        gap: 2
      }}>
        <Typography level="body-lg" textAlign="center">
          PDF-visning kan inte bäddas in direkt i applikationen.
        </Typography>
        
        <Typography level="body-sm" textAlign="center" color="neutral">
          Använd en av följande metoder för att visa dokumentet:
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2,
          width: '100%',
          maxWidth: '400px'
        }}>
          <Button 
            variant="solid"
            color="primary"
            size="lg"
            onClick={openDirectly}
            startDecorator={<OpenInNewIcon />}
          >
            Öppna PDF direkt
          </Button>
          
          <Button 
            variant="outlined"
            size="lg"
            onClick={() => setViewingMethod('google')}
          >
            Visa med Google Docs
          </Button>
        </Box>
      </Box>
      
      {/* Google Docs Viewer Modal */}
      <Modal 
        open={viewingMethod === 'google'} 
        onClose={() => setViewingMethod('none')}
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <Sheet sx={{ 
          width: '90vw', 
          height: '90vh', 
          borderRadius: 'md',
          overflow: 'hidden',
          boxShadow: 'lg'
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography level="title-lg">{fileName}</Typography>
            <Button 
              startDecorator={<CloseIcon />}
              onClick={() => setViewingMethod('none')} 
              variant="plain"
              size="sm"
            >
              Stäng
            </Button>
          </Box>
          <Box sx={{ height: 'calc(100% - 60px)' }}>
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title={`Google Docs viewer: ${fileName}`}
            />
          </Box>
        </Sheet>
      </Modal>
    </Box>
  );
};

export default SimplestPDFViewer;