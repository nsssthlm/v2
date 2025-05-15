import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/joy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Konfigurera PDF.js worker URL
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface ReactPDFViewerProps {
  pdfUrl: string;
  title?: string;
}

export default function ReactPDFViewer({ pdfUrl, title }: ReactPDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullUrl, setFullUrl] = useState<string>('');
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  // Konstruera full URL och hämta data
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    if (!pdfUrl) {
      setError('Ingen PDF-URL tillhandahållen');
      setLoading(false);
      return;
    }
    
    try {
      // Hantera URL-format
      let apiUrl = pdfUrl;
      const baseApiUrl = '/api/';
      
      // Kontrollera och formatera URL:en korrekt
      if (apiUrl.startsWith('/api/')) {
        // URL:en har redan /api/ prefix - använd den direkt
        console.log('URL already starts with /api/, using as is:', apiUrl);
      } else if (apiUrl.startsWith('workspace/')) {
        // Om URL:en börjar med workspace/ (utan slash), lägg till /api/ prefix
        apiUrl = baseApiUrl + apiUrl;
        console.log('Added /api/ prefix. New URL:', apiUrl);
      } else if (apiUrl.startsWith('/workspace/')) {
        // Om URL:en börjar med /workspace/, ta bort / och lägg till /api/
        apiUrl = baseApiUrl + apiUrl.substring(1);
        console.log('Fixed URL format with /api/ prefix. New URL:', apiUrl);
      }
      
      // Lägg till auth token till URL
      const token = localStorage.getItem('access_token');
      if (token) {
        // Om URL redan har parametrar, använd &, annars använd ?
        const separator = apiUrl.includes('?') ? '&' : '?';
        apiUrl = `${apiUrl}${separator}token=${token}`;
      }
      
      // Lägg till no-cache parameter för att förhindra caching
      apiUrl = `${apiUrl}&nocache=${new Date().getTime()}`;
      
      // Logga slutlig URL (men dölj token i loggen)
      console.log('Final PDF URL (auth token hidden):', apiUrl.split('token=')[0] + 'token=HIDDEN');
      
      // Sätt URL
      setFullUrl(apiUrl);
      
      // Hämta PDF som blob för att använda med react-pdf
      fetch(apiUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.blob();
        })
        .then(blob => {
          setPdfBlob(blob);
          setLoading(false);
        })
        .catch(err => {
          console.error('Kunde inte hämta PDF:', err);
          setError(`Kunde inte ladda PDF: ${err.message}`);
          setLoading(false);
        });
    } catch (err) {
      console.error('Fel vid förberedelse av PDF-URL:', err);
      setError('Kunde inte förbereda PDF-URL.');
      setLoading(false);
    }
  }, [pdfUrl]);

  // Event handlers
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const openInNewTab = () => {
    window.open(fullUrl, '_blank');
  };

  const downloadPDF = () => {
    const a = document.createElement('a');
    a.href = fullUrl;
    a.setAttribute('download', title || 'document.pdf');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const changePage = (offset: number) => {
    if (numPages) {
      let newPage = pageNumber + offset;
      if (newPage > 0 && newPage <= numPages) {
        setPageNumber(newPage);
      }
    }
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress size="lg" />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography color="danger" level="body-lg" mb={2}>
            {error}
          </Typography>
          <Button 
            onClick={openInNewTab}
            variant="outlined"
            color="primary"
            size="lg"
            startDecorator={<OpenInNewIcon />}
          >
            Försök öppna PDF i nytt fönster
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 1, 
            borderBottom: '1px solid', 
            borderColor: 'divider'
          }}>
            <Box>
              <Button 
                size="sm" 
                variant="plain" 
                color="neutral" 
                onClick={previousPage} 
                disabled={pageNumber <= 1}
              >
                Föregående
              </Button>
              <Typography component="span" mx={1}>
                Sida {pageNumber} av {numPages || '--'}
              </Typography>
              <Button 
                size="sm" 
                variant="plain" 
                color="neutral" 
                onClick={nextPage} 
                disabled={pageNumber >= (numPages || 0)}
              >
                Nästa
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="sm"
                variant="plain"
                color="neutral"
                startDecorator={<OpenInNewIcon />}
                onClick={openInNewTab}
              >
                Öppna i nytt fönster
              </Button>
              <Button
                size="sm"
                variant="plain"
                color="neutral"
                startDecorator={<FileDownloadIcon />}
                onClick={downloadPDF}
              >
                Ladda ner
              </Button>
            </Box>
          </Box>
          
          <Box sx={{ 
            flexGrow: 1, 
            overflow: 'auto', 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'flex-start',
            p: 2,
            bgcolor: 'background.level1'
          }}>
            {pdfBlob && (
              <Document
                file={pdfBlob}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(error) => setError(`Kunde inte ladda dokumentet: ${error.message}`)}
                loading={<CircularProgress />}
                error={<Typography color="danger">Kunde inte visa PDF</Typography>}
              >
                <Page 
                  pageNumber={pageNumber} 
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  scale={1.3}
                  loading={<CircularProgress />}
                />
              </Document>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}