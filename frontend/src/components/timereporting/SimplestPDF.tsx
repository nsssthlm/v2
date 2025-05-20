import React from 'react';
import { Box, Link, Typography, Button, Stack } from '@mui/joy';
import { OpenInNew, Download, PictureAsPdf } from '@mui/icons-material';

interface SimplestPDFProps {
  pdfUrl: string;
  filename: string;
}

/**
 * En extremt enkel, minimal PDF-visare som fungerar i alla webbläsare
 * oavsett säkerhetsinställningar.
 */
const SimplestPDF: React.FC<SimplestPDFProps> = ({ pdfUrl, filename }) => {
  // Funktion för att ladda ner PDF
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Funktion för att öppna i ny flik
  const handleOpenInNewTab = () => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 3
      }}>
        {/* Länkar och knappar för att visa PDF-filen */}
        <Box sx={{ 
          width: '100%', 
          height: '70%', 
          mb: 3, 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          border: '1px solid #eee',
          borderRadius: '4px',
          p: 4,
          backgroundColor: '#f8f8f8'
        }}>
          <Typography level="h4" sx={{ mb: 2 }}>
            {filename}
          </Typography>
          
          <PictureAsPdf 
            sx={{ 
              width: '100px', 
              height: '100px', 
              mb: 3,
              opacity: 0.7,
              color: 'primary.main'
            }}
          />
          
          <Typography level="body-md" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
            PDF-visning i dialogrutan blockeras av webbläsarens säkerhetsinställningar.
            <br />
            Använd knapparna nedan för att visa dokumentet.
          </Typography>
        </Box>
        
        {/* Alternativa åtgärder */}
        <Typography level="body-sm" sx={{ mb: 2, color: 'neutral.500' }}>
          Om PDF-filen inte visas korrekt ovan, använd knapparna nedan:
        </Typography>
        
        <Stack direction="row" spacing={2}>
          <Button 
            variant="solid" 
            color="primary"
            startDecorator={<OpenInNew />}
            onClick={handleOpenInNewTab}
          >
            Öppna i ny flik
          </Button>
          
          <Button 
            variant="outlined" 
            color="neutral"
            startDecorator={<Download />}
            onClick={handleDownload}
          >
            Ladda ner
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default SimplestPDF;