import React from 'react';
import { Box, Button, Stack } from '@mui/joy';
import { OpenInNew, Download } from '@mui/icons-material';

interface BasicPDFObjectProps {
  pdfUrl: string;
  onDownload: () => void;
  onOpenInNewTab: () => void;
}

/**
 * En mycket enkel PDF-visare som använder bara object-taggen
 */
const BasicPDFObject: React.FC<BasicPDFObjectProps> = ({
  pdfUrl,
  onDownload,
  onOpenInNewTab
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* PDF-visningsområde */}
      <Box sx={{ flexGrow: 1 }}>
        <object
          data={pdfUrl}
          type="application/pdf"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
      </Box>

      {/* Knappar längst ner */}
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

export default BasicPDFObject;