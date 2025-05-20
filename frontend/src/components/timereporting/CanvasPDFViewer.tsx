import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Stack, CircularProgress } from '@mui/joy';
import { PictureAsPdf, OpenInNew, Download, ZoomIn, ZoomOut } from '@mui/icons-material';
import { Document, Page, pdfjs } from 'react-pdf';
// Konfigurera worker för PDF.js
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Konfigurera PDF.js worker URL
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface CanvasPDFViewerProps {
  pdfUrl: string;
  filename: string;
  fileId?: string;
  isLocal?: boolean;
}

/**
 * En Canvas-baserad PDF-visare som använder react-pdf för att rendera PDF-filer
 * utan att förlita sig på inbyggda webbläsar-kontroller (undviker CORS-problem).
 */
const CanvasPDFViewer: React.FC<CanvasPDFViewerProps> = ({
  pdfUrl,
  filename,
  fileId,
  isLocal = false
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [scale, setScale] = useState(1.0);
  const [proxyUrl, setProxyUrl] = useState<string | null>(null);

  // Skapa proxy-URL för server-filer för att lösa CORS-problem
  useEffect(() => {
    if (!isLocal && fileId) {
      // Användning av vår nya backend-proxy för att servera PDF-filer med korrekta headers
      const proxyEndpoint = `/api/files/pdf-proxy/${fileId}/`;
      console.log('Använder proxy-URL för PDF:', proxyEndpoint);
      setProxyUrl(proxyEndpoint);
    } else {
      // Använd original URL för lokala filer (blob URLs från uppladdningar)
      setProxyUrl(null);
    }
  }, [fileId, isLocal, pdfUrl]);

  // Slutgiltiga URL att använda (proxy eller original)
  const effectiveUrl = proxyUrl || pdfUrl;

  // Hantera när dokumentet laddats
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setLoadError(false);
    console.log(`PDF laddad framgångsrikt: ${filename}, antal sidor: ${numPages}`);
  };

  // Hantera fel vid laddning av dokumentet
  const onDocumentLoadError = (error: Error) => {
    console.error('Fel vid laddning av PDF:', error);
    setIsLoading(false);
    setLoadError(true);
  };

  // Navigera mellan sidor
  const goToPrevPage = () => {
    setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages || 1));
  };

  // Zooma in och ut
  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.6));
  };

  // Ladda ner PDF
  const handleDownload = () => {
    if (isLocal) {
      // För lokala blob URLs, använd standard nedladdningslogik
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // För server-filer, använd ett direkt API-anrop med Content-Disposition: attachment
      window.location.href = effectiveUrl;
    }
  };

  // Öppna PDF i nytt fönster
  const handleOpenInNewTab = () => {
    window.open(effectiveUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* PDF-visningens huvuddel */}
      <Box sx={{ 
        flexGrow: 1, 
        position: 'relative', 
        overflow: 'auto',
        bgcolor: 'background.level1'
      }}>
        {/* Laddningsindikator */}
        {isLoading && (
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
              bgcolor: 'rgba(255,255,255,0.8)',
              zIndex: 10
            }}
          >
            <CircularProgress size="lg" />
          </Box>
        )}
        
        {/* Felmeddelande vid laddningsfel */}
        {loadError && (
          <Box 
            sx={{ 
              height: '100%',
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 4,
              textAlign: 'center'
            }}
          >
            <PictureAsPdf 
              sx={{ fontSize: 80, color: 'primary.main', opacity: 0.7, mb: 3 }}
            />
            
            <Typography level="h4" sx={{ mb: 2 }}>
              {filename}
            </Typography>
            
            <Typography sx={{ mb: 4, color: 'text.secondary' }}>
              PDF-filen kunde inte visas på grund av ett problem med filen eller webbläsarens inställningar.
              <br />
              Använd knapparna nedan för att visa dokumentet på ett annat sätt.
            </Typography>
            
            <Stack direction="row" spacing={2}>
              <Button 
                variant="solid" 
                color="primary"
                size="lg"
                startDecorator={<OpenInNew />}
                onClick={handleOpenInNewTab}
              >
                Öppna i ny flik
              </Button>
              
              <Button 
                variant="outlined" 
                color="neutral"
                size="lg"
                startDecorator={<Download />}
                onClick={handleDownload}
              >
                Ladda ner
              </Button>
            </Stack>
          </Box>
        )}
        
        {/* PDF-rendering med react-pdf */}
        {!loadError && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            p: 2,
            minHeight: '100%'
          }}>
            <Document
              file={effectiveUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<CircularProgress size="lg" />}
              noData={<Typography>Ingen PDF-data tillgänglig</Typography>}
              error={<Typography color="danger">Det gick inte att ladda PDF-filen</Typography>}
              options={{
                cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
                cMapPacked: true,
                withCredentials: true,
              }}
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                canvasBackground="#f0f0f0"
              />
            </Document>
          </Box>
        )}
      </Box>
      
      {/* Kontrollpanel för navigering och nedladdning */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderTop: '1px solid', 
          borderColor: 'divider',
          bgcolor: 'background.surface'
        }}
      >
        {/* Sidnavigering */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="outlined"
            color="neutral"
            disabled={pageNumber <= 1 || !numPages}
            onClick={goToPrevPage}
          >
            Föregående
          </Button>
          
          <Typography>
            {numPages ? `Sida ${pageNumber} av ${numPages}` : 'Laddar...'}
          </Typography>
          
          <Button
            variant="outlined"
            color="neutral"
            disabled={!numPages || pageNumber >= (numPages || 1)}
            onClick={goToNextPage}
          >
            Nästa
          </Button>
        </Stack>
        
        {/* Zoom och externa länkar */}
        <Stack direction="row" spacing={1}>
          <Button
            variant="plain"
            color="neutral"
            onClick={zoomOut}
            startDecorator={<ZoomOut />}
          >
            Zooma ut
          </Button>
          
          <Button
            variant="plain"
            color="neutral"
            onClick={zoomIn}
            startDecorator={<ZoomIn />}
          >
            Zooma in
          </Button>
          
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

export default CanvasPDFViewer;