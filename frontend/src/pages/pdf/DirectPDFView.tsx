/**
 * DirectPDFView - Fristående PDF-visare
 * 
 * En helt fristående komponent som visar PDF-filer direkt från API genom URL:en
 * Nås via: /view-pdf/:id 
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Sheet, Stack, IconButton } from '@mui/joy';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Initiera PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Stilar för PDF-visaren
const styles = {
  pdfContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    height: '100vh',
    overflow: 'auto',
    backgroundColor: '#f5f5f5',
  },
  controlBar: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    width: '100%',
    padding: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(5px)',
    borderBottom: '1px solid #e0e0e0',
  },
  pageControls: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    justifyContent: 'center',
  },
  document: {
    maxWidth: '100%',
    marginTop: '20px',
  },
  page: {
    maxWidth: '100%',
    marginBottom: '10px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    borderRadius: '4px',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '80vh',
    padding: '20px',
  },
};

interface PDFPageData {
  pageNumber: number;
  width: number;
  height: number;
}

const DirectPDFView = () => {
  // URL-parametrar 
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<Blob | null>(null);
  const [pdfInfo, setPdfInfo] = useState<{ filename: string; description: string } | null>(null);
  const [pageData, setPageData] = useState<PDFPageData[]>([]);
  
  // Hämta PDF-data
  useEffect(() => {
    const fetchPDF = async () => {
      if (!id) {
        setError('Inget PDF-ID angavs i URL:en');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Hämta metadata först
        const metadataResponse = await axios.get(`/api/pdf/${id}/info`);
        const metadata = metadataResponse.data;
        
        if (metadata) {
          setPdfInfo({
            filename: metadata.filename || 'Dokument',
            description: metadata.description || 'Ingen beskrivning tillgänglig'
          });
        }
        
        // Sedan hämta den faktiska PDF-filen
        const response = await axios.get(`/api/pdf/${id}/content`, {
          responseType: 'blob',
          headers: {
            'Accept': 'application/pdf'
          }
        });
        
        setPdfData(response.data);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Fel vid hämtning av PDF:', err);
        
        // Förbättrad felhantering
        if (err.response) {
          if (err.response.status === 404) {
            setError(`PDF-filen med ID ${id} hittades inte.`);
          } else if (err.response.status === 403) {
            setError('Du har inte behörighet att se denna PDF-fil.');
          } else {
            setError(`Serverfel: ${err.response.status} ${err.response.statusText}`);
          }
        } else if (err.request) {
          setError('Ingen respons från servern. Kontrollera din internetanslutning.');
        } else {
          setError(`Ett fel uppstod: ${err.message}`);
        }
        
        setIsLoading(false);
      }
    };
    
    fetchPDF();
  }, [id]);
  
  // Hantera när dokumentet laddats
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    
    // Återställ siddata
    setPageData([]);
  };
  
  // Hantera när en sida laddats
  const onPageLoadSuccess = (page: any) => {
    const { pageNumber, width, height } = page;
    
    // Spara sidinfo
    setPageData(prevData => {
      const exists = prevData.some(p => p.pageNumber === pageNumber);
      if (!exists) {
        return [...prevData, { pageNumber, width, height }];
      }
      return prevData;
    });
  };
  
  // Navigering
  const goToPrevPage = () => {
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
    setScale(prevScale => Math.min(prevScale + 0.2, 3.0));
  };
  
  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  };
  
  const resetZoom = () => {
    setScale(1.0);
  };
  
  // Hanterar fel som uppstår vid dokumentinläsning
  const onDocumentLoadError = (error: Error) => {
    console.error('Fel vid PDF-laddning:', error);
    setError(`Kunde inte ladda PDF-dokumentet: ${error.message}`);
    setIsLoading(false);
  };
  
  // Hantera tillbaka-navigering
  const handleGoBack = () => {
    navigate(-1);
  };
  
  return (
    <Box sx={styles.pdfContainer}>
      {/* Kontrollpanel */}
      <Sheet
        variant="outlined"
        sx={styles.controlBar}
      >
        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
          <Button 
            variant="outlined" 
            color="neutral" 
            onClick={handleGoBack}
          >
            Tillbaka
          </Button>
          
          <Typography level="title-md">
            {pdfInfo?.filename || 'PDF-visare'}
          </Typography>
          
          <Box sx={styles.pageControls}>
            <Button 
              variant="plain" 
              color="neutral" 
              disabled={pageNumber <= 1} 
              onClick={goToPrevPage}
            >
              Föregående
            </Button>
            
            <Typography>
              {pageNumber} / {numPages || '?'}
            </Typography>
            
            <Button 
              variant="plain" 
              color="neutral" 
              disabled={!numPages || pageNumber >= numPages} 
              onClick={goToNextPage}
            >
              Nästa
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button size="sm" onClick={zoomOut} disabled={scale <= 0.5}>-</Button>
            <Typography level="body-sm">{Math.round(scale * 100)}%</Typography>
            <Button size="sm" onClick={zoomIn} disabled={scale >= 3.0}>+</Button>
            <Button size="sm" variant="plain" onClick={resetZoom}>Återställ</Button>
          </Box>
        </Stack>
      </Sheet>
      
      {/* PDF-visare */}
      <Box sx={{ padding: 2, width: '100%', display: 'flex', justifyContent: 'center' }}>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Box sx={{ textAlign: 'center', maxWidth: 500 }}>
            <Typography level="h4" color="danger" gutterBottom>
              Fel vid laddning av PDF
            </Typography>
            <Typography gutterBottom>
              {error}
            </Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={handleGoBack} 
              sx={{ marginTop: 2 }}
            >
              Tillbaka
            </Button>
          </Box>
        )}
        
        {pdfData && !error && (
          <Document
            file={pdfData}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<CircularProgress />}
            options={{
              cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/',
              cMapPacked: true,
            }}
          >
            <Page
              key={`page_${pageNumber}`}
              pageNumber={pageNumber}
              scale={scale}
              onLoadSuccess={onPageLoadSuccess}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              loading={<CircularProgress />}
            />
          </Document>
        )}
      </Box>
    </Box>
  );
};

export default DirectPDFView;