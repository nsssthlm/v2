import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Stack, CircularProgress } from '@mui/joy';
import { OpenInNew, Download, PictureAsPdf, Visibility } from '@mui/icons-material';
import { Document, Page, pdfjs } from 'react-pdf';

// Konfigurera pdfjs med en CDN-baserad worker
// Detta är nödvändigt för att PDF.js ska fungera korrekt
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
console.log(`PDF.js worker konfigurerad med version ${pdfjs.version} från unpkg CDN`);

// Importera stilar för PDF-visning
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

interface BlobPDFViewerProps {
  pdfUrl: string;
  filename: string;
  isDialogMode?: boolean;
}

/**
 * En PDF-visare som använder Blob URL och react-pdf (baserad på pdf.js)
 * för att visa PDF-filer direkt i webbläsaren utan säkerhetsbegränsningar.
 */
const BlobPDFViewer: React.FC<BlobPDFViewerProps> = ({ 
  pdfUrl, 
  filename,
  isDialogMode = true
}) => {
  const [loading, setLoading] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [showPdf, setShowPdf] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  
  // Funktion för att ladda ner PDF
  const handleDownload = () => {
    const linkUrl = blobUrl || pdfUrl;
    const link = document.createElement('a');
    link.href = linkUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Funktion för att öppna i ny flik
  const handleOpenInNewTab = () => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };
  
  // Funktion för att konvertera PDF-länken till en blob URL
  const loadPdfAsBlob = async () => {
    if (blobUrl) return; // Undvik att ladda om om vi redan har en blob
    
    setLoading(true);
    try {
      // Hämta PDF-innehållet från URL:en
      const response = await fetch(pdfUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Sätt blob URL som källa för PDF:en
      setBlobUrl(url);
      setShowPdf(true);
      setShowFallback(false);
    } catch (error) {
      console.error('Kunde inte ladda PDF som blob:', error);
      setShowFallback(true);
      
      // Försök med cache-busting för att undvika cache-problem
      const cacheBustUrl = `${pdfUrl}?nocache=${Date.now()}`;
      window.open(cacheBustUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setLoading(false);
    }
  };
  
  // Hantera när PDF:en har laddats
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };
  
  // Hantera fel vid laddning av PDF
  const onDocumentLoadError = (error: any) => {
    console.error('Fel vid laddning av PDF:', error);
    setShowFallback(true);
  };
  
  // Funktioner för att navigera mellan sidor
  const prevPage = () => {
    setPageNumber(page => (page > 1 ? page - 1 : page));
  };
  
  const nextPage = () => {
    setPageNumber(page => (page < (numPages || 1) ? page + 1 : page));
  };
  
  // Zoom-funktioner
  const zoomIn = () => {
    setScale(s => Math.min(s + 0.1, 2.0));
  };
  
  const zoomOut = () => {
    setScale(s => Math.max(s - 0.1, 0.5));
  };
  
  // Visa PDF direkt via blob
  const handleShowPdf = () => {
    loadPdfAsBlob();
  };
  
  // Ladda automatiskt PDF:en om vi inte är i dialogläge
  useEffect(() => {
    if (!isDialogMode) {
      loadPdfAsBlob();
    }
  }, [isDialogMode]);
  
  // Rensa blob URL när komponenten avmonteras
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

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
        {/* PDF-visning med react-pdf */}
        {showPdf && (blobUrl || pdfUrl) ? (
          <Box sx={{ 
            width: '100%', 
            height: '85%', 
            mb: 2, 
            overflow: 'auto',
            border: '1px solid #eee',
            borderRadius: '4px',
            position: 'relative',
            bgcolor: '#f8f8f8'
          }}>
            {/* Visa PDF med react-pdf, som använder Canvas-rendering */}
            <Document
              file={blobUrl || pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    height: '100%' 
                  }}
                >
                  <CircularProgress />
                </Box>
              }
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>
            
            {/* Navigeringsreglage */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              mt: 2,
              gap: 2
            }}>
              <Button 
                variant="outlined" 
                size="sm" 
                onClick={prevPage} 
                disabled={pageNumber <= 1}
              >
                Föregående
              </Button>
              
              <Typography>
                Sida {pageNumber} av {numPages || '?'}
              </Typography>
              
              <Button
                variant="outlined"
                size="sm"
                onClick={nextPage}
                disabled={numPages === null || pageNumber >= numPages}
              >
                Nästa
              </Button>
              
              <Button
                variant="outlined"
                size="sm"
                onClick={zoomOut}
              >
                -
              </Button>
              
              <Typography>
                {Math.round(scale * 100)}%
              </Typography>
              
              <Button
                variant="outlined"
                size="sm"
                onClick={zoomIn}
              >
                +
              </Button>
            </Box>
          </Box>
        ) : (
          // Fallback-visning med PDF-ikon och knappar
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
            
            {loading ? (
              <CircularProgress size="lg" sx={{ mb: 3 }} />
            ) : (
              <PictureAsPdf 
                sx={{ 
                  width: '100px', 
                  height: '100px', 
                  mb: 3,
                  opacity: 0.7,
                  color: 'primary.main'
                }}
              />
            )}
            
            <Typography level="body-md" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
              {showFallback 
                ? "PDF-visning kunde inte laddas. Vänligen använd knapparna nedan istället."
                : "Klicka på knappen nedan för att visa PDF-dokumentet."}
            </Typography>
            
            {/* Visa PDF-knapp (bara om vi inte redan försökt och misslyckats) */}
            {!showFallback && !showPdf && (
              <Button
                variant="solid"
                color="primary"
                size="lg"
                startDecorator={<Visibility />}
                onClick={handleShowPdf}
                disabled={loading}
                sx={{ mb: 2 }}
              >
                {loading ? "Laddar..." : "Visa PDF"}
              </Button>
            )}
          </Box>
        )}
        
        {/* Alltid visa dessa alternativa åtgärder */}
        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined" 
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

export default BlobPDFViewer;