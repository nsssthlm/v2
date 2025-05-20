import React from 'react';
import { Box, Typography, Button } from '@mui/joy';
import { OpenInNew as OpenInNewIcon, Download as DownloadIcon } from '@mui/icons-material';

interface DirectPDFViewProps {
  pdfUrl: string;
  filename: string;
  onDownload: () => void;
  onOpenInNewTab: () => void;
}

/**
 * En extremt enkel PDF-visare som fokuserar på att visa PDF:en direkt
 * med minimal kod och maximal kompatibilitet.
 */
const DirectPDFView: React.FC<DirectPDFViewProps> = ({
  pdfUrl,
  filename,
  onDownload,
  onOpenInNewTab
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* PDF-visningen - använder vanlig iframe direkt mot URL:en */}
      <Box sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
        <iframe 
          src={pdfUrl}
          title={filename}
          style={{ 
            width: '100%', 
            height: '100%', 
            border: 'none',
            backgroundColor: 'white'
          }}
          allow="fullscreen"
        />
      </Box>
      
      {/* Fallback-meddelande om PDF-visningen inte fungerar */}
      <Box 
        sx={{ 
          p: 2, 
          mt: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column'
        }}
      >
        <Typography level="body-sm" sx={{ mb: 2, color: 'text.secondary' }}>
          Om PDF-filen inte visas korrekt, prova dessa alternativ:
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            size="sm"
            variant="soft"
            color="primary"
            startDecorator={<OpenInNewIcon />}
            onClick={onOpenInNewTab}
          >
            Öppna i ny flik
          </Button>
          <Button
            size="sm"
            variant="soft"
            color="neutral"
            startDecorator={<DownloadIcon />}
            onClick={onDownload}
          >
            Ladda ner
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default DirectPDFView;