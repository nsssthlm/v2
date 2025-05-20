import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, CircularProgress, Button, Stack } from '@mui/joy';
import { OpenInNew, Download } from '@mui/icons-material';

// Importera typer och funktioner direkt utan typdeklarationsfil
const PDFObject = require('pdfobject');

interface DirectPDFViewerProps {
  pdfUrl: string;
  filename: string;
  onDownload: () => void;
  onOpenInNewTab: () => void;
}

const DirectPDFViewer: React.FC<DirectPDFViewerProps> = ({
  pdfUrl,
  filename,
  onDownload,
  onOpenInNewTab
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    try {
      // Använd PDFObject för att visa PDF
      const success = PDFObject.embed(pdfUrl, containerRef.current, {
        id: "pdf-viewer",
        height: "100%",
        pdfOpenParams: {
          navpanes: 1,
          toolbar: 1,
          statusbar: 0,
          view: "FitV"
        }
      });

      const timer = setTimeout(() => {
        setLoading(false);
        if (!success) {
          setPdfError(true);
          console.log('PDFObject rapporterade misslyckande');
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Fel vid laddning av PDF:', error);
      setLoading(false);
      setPdfError(true);
    }
  }, [pdfUrl]);

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

      {pdfError ? (
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
      ) : (
        <>
          {/* PDF-container */}
          <Box 
            ref={containerRef} 
            sx={{ 
              flexGrow: 1, 
              width: '100%', 
              bgcolor: 'background.level1',
              '.pdfobject-container': { height: '100%' },
              '.pdfobject': { height: '100%', border: 'none' }
            }}
          />
          
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
        </>
      )}
    </Box>
  );
};

export default DirectPDFViewer;