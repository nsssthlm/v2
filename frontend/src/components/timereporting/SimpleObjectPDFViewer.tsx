import React from 'react';
import { Box, Typography, Button, Stack, CircularProgress } from '@mui/joy';
import { OpenInNew, Download } from '@mui/icons-material';

interface SimpleObjectPDFViewerProps {
  pdfUrl: string;
  filename: string;
  onDownload: () => void;
  onOpenInNewTab: () => void;
}

/**
 * En mycket enkel PDF-visare som använder den mest grundläggande HTML-object taggen
 * för att visa PDF-filer direkt i dialogrutan.
 */
const SimpleObjectPDFViewer: React.FC<SimpleObjectPDFViewerProps> = ({
  pdfUrl,
  filename,
  onDownload,
  onOpenInNewTab
}) => {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Sätt en timer för att dölja laddningsindikatorn efter en viss tid
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        width: '100%',
        position: 'relative'
      }}
    >
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
            zIndex: 10
          }}
        >
          <CircularProgress />
        </Box>
      )}

      <Box 
        sx={{ 
          flexGrow: 1, 
          p: 0, 
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <object
          data={pdfUrl}
          type="application/pdf"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        >
          <Box 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center',
              p: 4,
              textAlign: 'center'
            }}
          >
            <Typography level="h3" sx={{ mb: 2 }}>
              Din webbläsare kan inte visa PDF direkt
            </Typography>
            <Typography sx={{ mb: 4 }}>
              PDF-filen "{filename}" kunde inte visas direkt i visaren. 
              Du kan öppna den i en ny flik eller ladda ner den istället.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="solid"
                color="primary"
                size="lg"
                startDecorator={<OpenInNew />}
                onClick={onOpenInNewTab}
              >
                Öppna i ny flik
              </Button>
              <Button
                variant="outlined"
                color="neutral"
                size="lg"
                startDecorator={<Download />}
                onClick={onDownload}
              >
                Ladda ner
              </Button>
            </Stack>
          </Box>
        </object>
      </Box>

      <Box 
        sx={{ 
          p: 2, 
          borderTop: '1px solid', 
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Stack direction="row" spacing={2}>
          <Button
            variant="solid"
            color="primary"
            startDecorator={<OpenInNew />}
            onClick={onOpenInNewTab}
          >
            Öppna i ny flik
          </Button>
          <Button
            variant="outlined"
            color="neutral"
            startDecorator={<Download />}
            onClick={onDownload}
          >
            Ladda ner
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default SimpleObjectPDFViewer;