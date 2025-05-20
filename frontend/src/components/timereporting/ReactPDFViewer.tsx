import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Box, Typography, CircularProgress, Button, Stack } from '@mui/joy';
import { KeyboardArrowLeft, KeyboardArrowRight, ZoomIn, ZoomOut, OpenInNew, Download } from '@mui/icons-material';

// Konfigurera worker för react-pdf (lokal lösning som fungerar utan beroende av externa tjänster)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

interface ReactPDFViewerProps {
  pdfUrl: string;
  filename?: string;
}

const ReactPDFViewer: React.FC<ReactPDFViewerProps> = ({ pdfUrl, filename = 'dokument.pdf' }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError(true);
    setLoading(false);
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return newPageNumber > 0 && newPageNumber <= (numPages || 1) ? newPageNumber : prevPageNumber;
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box 
      sx={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: 'background.level1'
      }}
    >
      {loading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            width: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.8)'
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {error ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            p: 3
          }}
        >
          <Typography level="h3" sx={{ mb: 2 }}>
            Kunde inte visa PDF-filen
          </Typography>
          <Typography sx={{ mb: 3, textAlign: 'center' }}>
            Det gick inte att ladda PDF-filen. Prova att öppna den i en ny flik.
          </Typography>
          <Button
            variant="solid"
            color="primary"
            startDecorator={<OpenInNew />}
            onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
          >
            Öppna i ny flik
          </Button>
        </Box>
      ) : (
        <>
          <Box 
            sx={{ 
              flexGrow: 1, 
              overflow: 'auto', 
              display: 'flex', 
              justifyContent: 'center',
              p: 2
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
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.surface'
            }}
          >
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color="neutral"
                disabled={pageNumber <= 1}
                onClick={previousPage}
                startDecorator={<KeyboardArrowLeft />}
              >
                Föregående
              </Button>
              <Button
                variant="outlined"
                color="neutral"
                disabled={pageNumber >= (numPages || 1)}
                onClick={nextPage}
                endDecorator={<KeyboardArrowRight />}
              >
                Nästa
              </Button>
            </Stack>

            <Typography>
              Sida {pageNumber} av {numPages || '?'}
            </Typography>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color="neutral"
                onClick={zoomOut}
                startDecorator={<ZoomOut />}
              >
                Zooma ut
              </Button>
              <Button
                variant="outlined"
                color="neutral"
                onClick={zoomIn}
                startDecorator={<ZoomIn />}
              >
                Zooma in
              </Button>
              <Button
                variant="solid"
                color="primary"
                onClick={() => window.open(pdfUrl, '_blank')}
                startDecorator={<OpenInNew />}
              >
                Öppna
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleDownload}
                startDecorator={<Download />}
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

export default ReactPDFViewer;