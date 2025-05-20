import React, { useState } from 'react';
import { Box, Typography, Button, Stack, CircularProgress } from '@mui/joy';
import { OpenInNew, Download } from '@mui/icons-material';

interface BasicPDFViewerProps {
  pdfUrl: string;
  filename: string;
  onDownload: () => void;
  onOpenInNewTab: () => void;
}

/**
 * En enkel PDF-visningskomponent som visar PDF direkt med object-tagg
 */
const BasicPDFViewer: React.FC<BasicPDFViewerProps> = ({
  pdfUrl,
  filename,
  onDownload,
  onOpenInNewTab
}) => {
  const [loading, setLoading] = useState(true);
  
  return (
    <Box sx={{ 
      height: '100%', 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'relative'
    }}>
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
          width: '100%', 
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <object
          data={pdfUrl}
          type="application/pdf"
          width="100%"
          height="100%"
          onLoad={() => setLoading(false)}
          style={{ flexGrow: 1 }}
        >
          <Box 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center',
              p: 4
            }}
          >
            <Typography level="h3" sx={{ mb: 2 }}>
              Det gick inte att visa PDF direkt
            </Typography>
            <Typography sx={{ mb: 4, textAlign: 'center' }}>
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
      
      {/* Knappar längst ner */}
      <Box sx={{ 
        p: 2, 
        borderTop: '1px solid', 
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="neutral"
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

export default BasicPDFViewer;