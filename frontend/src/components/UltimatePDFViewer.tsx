import React, { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/joy';
import { Document, Page, pdfjs } from 'react-pdf';

// Konfigurera pdfjs worker
const pdfWorkerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

interface UltimatePDFViewerProps {
  pdfUrl: string;
  onLoad?: () => void;
  onError?: (error: any) => void;
  projectId?: number | null;
  versionId?: number;
  annotationId?: number;
}

/**
 * UltimatePDFViewer - En extremt pålitlig PDF-visningskomponent
 * som kombinerar flera renderingsmetoder för att garantera att PDFer
 * visas korrekt i alla miljöer.
 * 
 * Denna komponent:
 * 1. Försöker först med react-pdf
 * 2. Har fallback för att visa PDFer med iframe
 * 3. Stöder automatisk URL-konvertering
 * 4. Hanterar olika felfall elegant
 */
const UltimatePDFViewer = ({ 
  pdfUrl, 
  onLoad, 
  onError,
  projectId,
  versionId,
  annotationId
}: UltimatePDFViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Logga info för felsökning
  console.log('PDF Debug:', { 
    pdfUrl,
    projectId,
    loading,
    error,
    useFallback
  });

  useEffect(() => {
    setLoading(true);
    setError(null);
    setUseFallback(false);
    setPageNumber(1);
  }, [pdfUrl]);

  // Huvudfunktion för att hantera lyckad laddning av PDF
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    if (onLoad) onLoad();
  };

  // Hantera fel vid laddning av PDF
  const handleLoadError = (err: any) => {
    console.error('PDF laddningsfel:', err);
    
    // Prova fallback-metoden om react-pdf misslyckas
    if (!useFallback) {
      console.log('Byter till fallback PDF-rendering');
      setUseFallback(true);
      return;
    }
    
    // Om även fallback-metoden misslyckades
    setError('Kunde inte ladda PDF-dokumentet. Kontrollera att URL:en är korrekt.');
    setLoading(false);
    if (onError) onError(err);
  };

  // Hantera framgångsrik laddning av fallback iframe
  const handleIframeLoad = () => {
    setLoading(false);
    if (onLoad) onLoad();
  };

  // Navigeringsfunktioner för sidor
  const goToPreviousPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const goToNextPage = () => {
    if (numPages && pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  // Zoom-funktioner
  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 3));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  };

  // Visa passande felmeddelande om något går fel
  if (error) {
    return (
      <Box sx={{ 
        p: 4, 
        textAlign: 'center',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Typography level="h5" color="danger" sx={{ mb: 2 }}>
          Det uppstod ett fel
        </Typography>
        <Typography sx={{ mb: 3 }}>
          {error}
        </Typography>
        <Typography level="body-sm" sx={{ mb: 2 }}>
          PDF URL: {pdfUrl}
        </Typography>
        <Button 
          onClick={() => window.location.reload()}
          variant="solid"
          color="primary"
        >
          Försök igen
        </Button>
      </Box>
    );
  }

  // Visa PDF med react-pdf om vi inte använder fallback
  if (!useFallback) {
    return (
      <Box 
        ref={containerRef}
        sx={{ 
          height: '100%', 
          overflow: 'auto',
          position: 'relative',
          backgroundColor: '#f5f5f5'
        }}
      >
        {/* react-pdf renderer */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          minHeight: '100%',
          pt: 2, pb: 2
        }}>
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={handleLoadError}
            loading={
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                height: '50vh',
                flexDirection: 'column'
              }}>
                <CircularProgress size="lg" />
                <Typography level="body-md" sx={{ mt: 2 }}>
                  Laddar PDF...
                </Typography>
              </Box>
            }
          >
            {numPages && (
              <Page 
                pageNumber={pageNumber} 
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            )}
          </Document>
        </Box>

        {/* Kontroller för navigering och zoom */}
        {!loading && numPages && (
          <Box sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0,
            p: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            zIndex: 10
          }}>
            <Button 
              onClick={goToPreviousPage} 
              disabled={pageNumber <= 1}
              variant="outlined"
              size="sm"
            >
              Föregående
            </Button>
            
            <Typography level="body-md">
              Sida {pageNumber} av {numPages}
            </Typography>
            
            <Button 
              onClick={goToNextPage} 
              disabled={!numPages || pageNumber >= numPages}
              variant="outlined"
              size="sm"
            >
              Nästa
            </Button>

            <Box sx={{ mx: 2, borderLeft: '1px solid', borderColor: 'divider', height: '24px' }} />
            
            <Button 
              onClick={zoomOut} 
              variant="outlined"
              size="sm"
            >
              -
            </Button>
            
            <Typography level="body-sm" sx={{ minWidth: '60px', textAlign: 'center' }}>
              {Math.round(scale * 100)}%
            </Typography>
            
            <Button 
              onClick={zoomIn} 
              variant="outlined"
              size="sm"
            >
              +
            </Button>

            <Box sx={{ mx: 2, borderLeft: '1px solid', borderColor: 'divider', height: '24px' }} />
            
            <Button 
              onClick={() => setUseFallback(true)} 
              variant="outlined"
              size="sm"
              color="neutral"
            >
              Alternativ visning
            </Button>
          </Box>
        )}
      </Box>
    );
  }

  // Fallback-metod: Visa PDF med iframe
  return (
    <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
      {loading && (
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          zIndex: 5
        }}>
          <CircularProgress size="lg" />
        </Box>
      )}
      
      <iframe
        ref={iframeRef}
        src={pdfUrl}
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        title="PDF Dokument"
        onLoad={handleIframeLoad}
        onError={() => {
          setError('Kunde inte visa PDF-dokumentet i inbäddad visare.');
          if (onError) onError(new Error('Iframe loading failed'));
        }}
      />
      
      {/* Fallback kontroller - enkel knapp för att gå tillbaka till react-pdf */}
      <Box sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        p: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10
      }}>
        <Button 
          onClick={() => setUseFallback(false)} 
          variant="outlined"
          size="sm"
          color="neutral"
        >
          Standardvisning
        </Button>
      </Box>
    </Box>
  );
};

export default UltimatePDFViewer;