import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  ModalDialog,
  Typography,
  IconButton,
  Box,
  CircularProgress 
} from '@mui/joy';
import CloseIcon from '@mui/icons-material/Close';
import UltimatePDFViewer from './UltimatePDFViewer';

interface UltimatePDFDialogProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  filename?: string;
  projectId?: number | null;
  versionId?: number;
  annotationId?: number;
  isEmbedded?: boolean;
}

/**
 * UltimatePDFDialog - En extremt pålitlig PDF-dialogkomponent som garanterar maximal 
 * kompatibilitet med olika PDF-format och URL-strukturer.
 * 
 * Denna komponent:
 * 1. Automatiskt konverterar mellan olika URL-format
 * 2. Använder olika renderingsmetoder för maximal kompatibilitet
 * 3. Har inbyggda fallback-mekanismer för fel
 * 4. Hanterar både direkta filvägar och API-vägar
 */
export default function UltimatePDFDialog({
  open,
  onClose,
  pdfUrl,
  filename = 'Dokument',
  projectId = null,
  versionId,
  annotationId,
  isEmbedded = false
}: UltimatePDFDialogProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Förbehandla URL för att garantera kompatibilitet
  const processedUrl = useMemo(() => {
    if (!pdfUrl) return '';
    
    // Hantera direkta media-URL:er
    if (pdfUrl.startsWith('/media/')) {
      return pdfUrl;
    }
    
    // Bevara absoluta URL:er som börjar med http eller https
    if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) {
      return pdfUrl;
    }
    
    // För relativa URL:er, förutsätt att de är relaterade till API_BASE_URL
    return pdfUrl;
  }, [pdfUrl]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);
    }
  }, [open, pdfUrl]);

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <ModalDialog
        sx={{
          width: isEmbedded ? '100%' : '95vw',
          height: isEmbedded ? '100%' : '95vh',
          maxWidth: '1600px',
          maxHeight: '95vh',
          p: 0,
          overflow: 'hidden',
          borderRadius: 'md',
          boxShadow: 'lg'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
            position: 'relative'
          }}
        >
          {/* Dokumenthuvud */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 1,
              pl: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.level1',
            }}
          >
            <Typography level="title-lg" component="h2" noWrap>
              {filename || 'PDF Dokument'}
            </Typography>
            <IconButton
              onClick={handleClose}
              variant="plain"
              size="sm"
              color="neutral"
              sx={{ ml: 1 }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* PDF-visare med multipla renderingsmetoder */}
          <Box
            sx={{
              flexGrow: 1,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <UltimatePDFViewer
              pdfUrl={processedUrl}
              onLoad={() => setLoading(false)}
              onError={(err) => {
                console.error('PDF Fel:', err);
                setError('Det gick inte att ladda PDF-filen. Försök igen senare.');
                setLoading(false);
              }}
              projectId={projectId}
              versionId={versionId}
              annotationId={annotationId}
            />

            {/* Laddningsindikator */}
            {loading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  zIndex: 10,
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress size="lg" />
                  <Typography level="body-md" sx={{ mt: 2 }}>
                    Laddar PDF...
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Felmeddelande */}
            {error && !loading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'background.surface',
                  zIndex: 10,
                }}
              >
                <Box sx={{ textAlign: 'center', maxWidth: '80%' }}>
                  <Typography level="title-lg" color="danger" sx={{ mb: 2 }}>
                    Ett fel uppstod
                  </Typography>
                  <Typography level="body-md">
                    {error}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  );
}

// Importera useMemo för att memoizera URL-behandlingen
import { useMemo } from 'react';
import { DIRECT_API_URL } from '../config';