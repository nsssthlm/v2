import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  IconButton, 
  Button,
  Slider,
  Sheet,
  Stack
} from '@mui/joy';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  DownloadForOffline as DownloadIcon
} from '@mui/icons-material';

interface TimeReportingPDFViewerProps {
  pdfUrl: string;
  filename?: string;
  onClose?: () => void;
}

const TimeReportingPDFViewer: React.FC<TimeReportingPDFViewerProps> = ({ 
  pdfUrl, 
  filename = 'dokument.pdf',
  onClose 
}) => {
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Funktion för att hantera zoom
  const handleZoom = (newScale: number) => {
    setScale(Math.max(0.5, Math.min(2.5, newScale)));
  };

  // Simulera nedladdning av PDF
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Hantera när PDF-dokumentet har laddats
  const handlePDFLoad = () => {
    setLoading(false);
  };

  // Hantera fel vid laddning av PDF
  const handlePDFError = () => {
    setLoading(false);
    setError('Det gick inte att ladda PDF-dokumentet. Försök igen senare.');
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      width: '100%', 
      overflow: 'hidden' 
    }}>
      {/* Rubrikområde */}
      <Sheet
        variant="solid"
        color="neutral"
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography level="title-lg">{filename}</Typography>
        <Stack direction="row" spacing={1}>
          <IconButton 
            variant="soft" 
            color="neutral" 
            aria-label="zoom out" 
            onClick={() => handleZoom(scale - 0.1)}
          >
            <ZoomOutIcon />
          </IconButton>
          <Slider
            aria-label="zoom"
            value={scale}
            min={0.5}
            max={2.5}
            step={0.1}
            onChange={(_, value) => handleZoom(value as number)}
            sx={{ width: '120px', mx: 1 }}
          />
          <IconButton 
            variant="soft" 
            color="neutral" 
            aria-label="zoom in" 
            onClick={() => handleZoom(scale + 0.1)}
          >
            <ZoomInIcon />
          </IconButton>
          <Button 
            size="sm" 
            variant="soft" 
            color="primary" 
            startDecorator={<DownloadIcon />}
            onClick={handleDownload}
          >
            Ladda ner
          </Button>
        </Stack>
      </Sheet>

      {/* PDF-visningsområde */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'flex-start',
        bgcolor: 'background.level1',
        p: 2
      }}>
        {loading && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            width: '100%'
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
            width: '100%',
            p: 4
          }}>
            <Typography level="h4" color="danger" sx={{ mb: 2 }}>
              Fel vid laddning
            </Typography>
            <Typography>
              {error}
            </Typography>
            <Button 
              sx={{ mt: 2 }} 
              variant="solid" 
              onClick={() => window.location.reload()}
            >
              Försök igen
            </Button>
          </Box>
        )}

        {/* PDF-objektet som visar dokumentet */}
        {!error && (
          <Box
            sx={{
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease',
              maxWidth: '100%'
            }}
          >
            <iframe
              src={`${pdfUrl}#toolbar=0`}
              style={{
                width: '100%',
                height: '85vh', 
                border: 'none',
                backgroundColor: 'white',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}
              onLoad={handlePDFLoad}
              onError={handlePDFError}
              title="PDF Viewer"
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TimeReportingPDFViewer;