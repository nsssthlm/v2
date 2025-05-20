import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Box, Typography, CircularProgress, Button, Stack } from '@mui/joy';
import { 
  KeyboardArrowLeft, 
  KeyboardArrowRight, 
  ZoomIn, 
  ZoomOut, 
  OpenInNew, 
  Download 
} from '@mui/icons-material';

// Konfigurera worker för react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// Importera CSS för annoteringar och text
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

interface ReactPDFViewerImprovedProps {
  pdfUrl: string;
  filename: string;
  onDownload: () => void;
  onOpenInNewTab: () => void;
}

const ReactPDFViewerImproved: React.FC<ReactPDFViewerImprovedProps> = ({
  pdfUrl,
  filename,
  onDownload,
  onOpenInNewTab
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Funktion som körs när PDF-dokumentet har laddats korrekt
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
  };

  // Funktion som körs om PDF-dokumentet inte kunde laddas
  const onDocumentLoadError = (error: Error) => {
    console.error('Fel vid laddning av PDF:', error);
    setError(true);
    setLoading(false);
  };

  // Funktioner för att navigera mellan sidor
  const goToPreviousPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages || 1));
  };

  // Funktioner för att zooma in och ut
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  return (
    <Box 
      sx={{ 
        height: '100%', 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column',
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

      {error ? (
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
          {/* PDF-visning */}
          <Box 
            sx={{ 
              flexGrow: 1, 
              overflow: 'auto', 
              display: 'flex',
              justifyContent: 'center',
              p: 2,
              bgcolor: 'background.level1'
            }}
          >
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<CircularProgress />}
              options={{
                cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/',
                cMapPacked: true
              }}
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                width={600}
                loading={
                  <Box sx={{ p: 5, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress size="sm" />
                  </Box>
                }
              />
            </Document>
          </Box>
          
          {/* Kontrollpanel */}
          <Box 
            sx={{ 
              p: 2, 
              borderTop: '1px solid', 
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              bgcolor: 'background.surface',
              flexWrap: { xs: 'wrap', sm: 'nowrap' }
            }}
          >
            {/* Sidnavigering */}
            <Stack 
              direction="row" 
              spacing={1}
              sx={{ 
                width: { xs: '100%', sm: 'auto' }, 
                mb: { xs: 1, sm: 0 },
                justifyContent: { xs: 'center', sm: 'flex-start' }
              }}
            >
              <Button
                variant="outlined"
                color="neutral"
                size="sm"
                startDecorator={<KeyboardArrowLeft />}
                onClick={goToPreviousPage}
                disabled={pageNumber <= 1}
              >
                Föregående
              </Button>
              <Typography 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  px: 2 
                }}
              >
                Sida {pageNumber} av {numPages || '?'}
              </Typography>
              <Button
                variant="outlined"
                color="neutral"
                size="sm"
                endDecorator={<KeyboardArrowRight />}
                onClick={goToNextPage}
                disabled={pageNumber >= (numPages || 1)}
              >
                Nästa
              </Button>
            </Stack>
            
            {/* Zoom och verktyg */}
            <Stack 
              direction="row" 
              spacing={1}
              sx={{ 
                width: { xs: '100%', sm: 'auto' },
                justifyContent: { xs: 'center', sm: 'flex-end' }
              }}
            >
              <Button
                variant="outlined"
                color="neutral"
                size="sm"
                startDecorator={<ZoomOut />}
                onClick={zoomOut}
              >
                Zooma ut
              </Button>
              <Button
                variant="outlined"
                color="neutral"
                size="sm"
                startDecorator={<ZoomIn />}
                onClick={zoomIn}
              >
                Zooma in
              </Button>
              <Button
                variant="outlined"
                color="neutral"
                size="sm"
                startDecorator={<Download />}
                onClick={onDownload}
              >
                Ladda ner
              </Button>
              <Button
                variant="outlined"
                color="neutral"
                size="sm"
                startDecorator={<OpenInNew />}
                onClick={onOpenInNewTab}
              >
                Ny flik
              </Button>
            </Stack>
          </Box>
        </>
      )}
    </Box>
  );
};

export default ReactPDFViewerImproved;