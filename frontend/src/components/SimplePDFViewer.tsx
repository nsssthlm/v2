import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, CircularProgress, IconButton } from '@mui/joy';
import { Document, Page, pdfjs } from 'react-pdf';

// Konfigurera PDF.js worker för att kunna läsa PDF-filer
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface SimplePDFViewerProps {
  pdfUrl: string;
  filename: string;
  width?: string | number;
  height?: string | number;
}

/**
 * En förbättrad PDF-visare som använder PDF.js för att visa PDF-filer direkt i appen
 * med zoom, bläddring och andra funktioner
 */
const SimplePDFViewer = ({ 
  pdfUrl, 
  filename, 
  width = '100%', 
  height = '100%' 
}: SimplePDFViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [scale, setScale] = useState(1.0);
  const [showDebug, setShowDebug] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Hantera när ett PDF-dokument laddas framgångsrikt
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setLoadFailed(false);
  };

  // Hantera när ett PDF-dokument inte kan laddas
  const onDocumentLoadError = (error: Error) => {
    console.error('Kunde inte ladda PDF:', error);
    setLoading(false);
    setLoadFailed(true);
  };

  // Byt till föregående sida
  const previousPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  // Byt till nästa sida
  const nextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages || 1));
  };

  // Zooma in
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  // Zooma ut
  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  // Återställ zoomnivån till 100%
  const resetZoom = () => {
    setScale(1.0);
  };

  return (
    <Box
      sx={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#ffffff'
      }}
    >
      {/* "Nuvarande version" badge */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 10,
          bgcolor: '#6366f1',
          color: 'white',
          fontSize: '0.75rem',
          py: 0.5,
          px: 1.5,
          borderRadius: 'md',
          fontWeight: 'bold'
        }}
      >
        Nuvarande version
      </Box>

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
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            zIndex: 5
          }}
        >
          <CircularProgress size="lg" sx={{ mb: 2 }} />
          <Typography level="body-sm">Laddar PDF...</Typography>
        </Box>
      )}

      {/* PDF innehåll */}
      <Box 
        ref={containerRef}
        sx={{
          flex: 1, 
          overflow: 'auto',
          position: 'relative'
        }}
      >
        {!loadFailed ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: '100%' }}>
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<CircularProgress />}
              error={
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography level="body-lg">Kunde inte ladda PDF-filen</Typography>
                </Box>
              }
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={<CircularProgress />}
              />
            </Document>
          </Box>
        ) : (
          <Box 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%'
            }}
          >
            <Typography level="title-lg" sx={{ mb: 2 }}>
              {filename}
            </Typography>
            
            <Typography level="body-md" sx={{ mb: 4 }}>
              Kunde inte ladda PDF-filen direkt. Prova att öppna den i ett nytt fönster.
            </Typography>
            
            <Button
              component="a"
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="solid"
              color="primary"
              size="lg"
              sx={{ mb: 2 }}
            >
              Öppna PDF i nytt fönster
            </Button>
          </Box>
        )}
      </Box>

      {/* Kontrollpanel */}
      {!loadFailed && numPages && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
            gap: 2
          }}
        >
          <Button 
            variant="outlined" 
            color="neutral" 
            disabled={pageNumber <= 1} 
            onClick={previousPage}
          >
            Föregående
          </Button>

          <Typography level="body-sm" sx={{ minWidth: 80, textAlign: 'center' }}>
            Sida {pageNumber} av {numPages}
          </Typography>

          <Button 
            variant="outlined" 
            color="neutral" 
            disabled={pageNumber >= numPages} 
            onClick={nextPage}
          >
            Nästa
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <Button 
              variant="plain" 
              color="neutral" 
              onClick={zoomOut}
            >
              -
            </Button>

            <Button 
              variant="plain" 
              color="neutral" 
              onClick={resetZoom}
            >
              {Math.round(scale * 100)}%
            </Button>

            <Button 
              variant="plain" 
              color="neutral" 
              onClick={zoomIn}
            >
              +
            </Button>
          </Box>
        </Box>
      )}

      {/* Debug-knapp i hörnet */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          zIndex: 10
        }}
      >
        <Button 
          variant="plain" 
          color="neutral" 
          size="sm"
          onClick={() => setShowDebug(prev => !prev)}
        >
          {showDebug ? 'Dölj info' : 'Visa debug info'}
        </Button>
      </Box>
      
      {/* Debug information */}
      {showDebug && (
        <Box 
          sx={{ 
            position: 'absolute',
            bottom: 40,
            right: 8,
            width: 300,
            p: 2, 
            bgcolor: '#f5f5f5', 
            borderRadius: 'md', 
            maxWidth: '100%', 
            overflow: 'hidden',
            zIndex: 10,
            boxShadow: 'sm'
          }}
        >
          <Typography level="body-sm" sx={{ fontWeight: 'bold', mb: 1 }}>
            Debug information:
          </Typography>
          <Typography level="body-xs" sx={{ wordBreak: 'break-all', mb: 1 }}>
            PDF URL: {pdfUrl}
          </Typography>
          <Typography level="body-xs" sx={{ mb: 1 }}>
            Sidor: {numPages || 'Okänt'}
          </Typography>
          <Typography level="body-xs" sx={{ mb: 1 }}>
            Scale: {scale}
          </Typography>
          <Typography level="body-xs" sx={{ mb: 1 }}>
            Origin: {window.location.origin}
          </Typography>
        </Box>
      )}

      {/* Grön vertikal linje till vänster */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: '8px',
          backgroundColor: '#4caf50'
        }}
      />
    </Box>
  );
};

export default SimplePDFViewer;