import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';
import { FullscreenOutlined, Refresh } from '@mui/icons-material';
import { Document, Page, pdfjs } from 'react-pdf';

// Konfigurera PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface StraightPDFViewerProps {
  pdfUrl: string;
  fileName?: string;
  onClose?: () => void;
}

/**
 * Förbättrad PDF-visare som visar PDF:er direkt i webbläsaren
 */
const StraightPDFViewer: React.FC<StraightPDFViewerProps> = ({
  pdfUrl,
  fileName = 'Document',
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  
  // Extrahera filnamnet från URL:en om det behövs
  const extractedFileName = pdfUrl.split('/').pop() || fileName;
  
  // Hitta datum i URL:en om det finns
  const dateMatch = pdfUrl.match(/(\d{4})\/(\d{2})\/(\d{2})/);
  
  // Skapa en direkt media URL baserad på originallänken
  const mediaUrl = dateMatch 
    ? `/media/project_files/${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}/${extractedFileName}`
    : `/media/${extractedFileName}`;
  
  console.log("Försöker visa PDF från:", mediaUrl);
  
  // Hämta PDF-filen direkt när komponenten laddas
  useEffect(() => {
    const fetchPdf = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Testa olika URL:er i följande ordning
        const urlsToTry = [
          mediaUrl,
          pdfUrl,
          // Lägg till fler fallback-URL:er vid behov
        ];
        
        let fetchedPdf = null;
        
        for (const url of urlsToTry) {
          try {
            console.log(`Försöker hämta PDF från: ${url}`);
            const response = await fetch(url);
            
            if (response.ok) {
              // Om vi får en OK-respons, skapa en blob och avsluta slingan
              const blob = await response.blob();
              if (blob.type === 'application/pdf' || blob.type === '') {
                fetchedPdf = blob;
                console.log(`Lyckades hämta PDF från: ${url}`);
                break;
              } else {
                console.warn(`Fel innehållstyp: ${blob.type} från ${url}`);
              }
            } else {
              console.warn(`Kunde inte hämta PDF från ${url}: ${response.status} ${response.statusText}`);
            }
          } catch (err) {
            console.error(`Fel vid hämtning från ${url}:`, err);
          }
        }
        
        if (fetchedPdf) {
          setPdfBlob(fetchedPdf);
          setLoading(false);
        } else {
          throw new Error('Kunde inte hämta PDF-filen från någon av de försökta URL:erna');
        }
      } catch (err) {
        console.error('Fel vid hämtning av PDF:', err);
        setError('Kunde inte ladda PDF-dokumentet. Vänligen försök senare.');
        setLoading(false);
      }
    };
    
    fetchPdf();
  }, [pdfUrl, mediaUrl]);
  
  // Funktion för att hantera när PDF-dokumentet har laddats
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };
  
  // Gå till föregående sida
  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };
  
  // Gå till nästa sida
  const goToNextPage = () => {
    if (numPages !== null) {
      setPageNumber(prev => Math.min(prev + 1, numPages));
    }
  };
  
  // Öppna i ny flik med original URL
  const openInNewTab = () => {
    // Använd original URL för ny flik
    window.open(pdfUrl, '_blank');
  };
  
  // Öppna med media URL i ny flik
  const openMediaUrlInNewTab = () => {
    window.open(mediaUrl, '_blank');
  };
  
  // Skapa en blob URL om vi har en PDF blob
  const blobUrl = pdfBlob ? URL.createObjectURL(pdfBlob) : null;
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      width: '100%', 
      bgcolor: 'background.paper',
      borderRadius: 'sm',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 1,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography level="title-md" sx={{ 
          flexGrow: 1, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {fileName}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            onClick={openInNewTab} 
            variant="outlined"
            size="sm"
            startDecorator={<FullscreenOutlined fontSize="small" />}
          >
            Öppna i ny flik
          </Button>
          
          {onClose && (
            <Button 
              onClick={onClose} 
              variant="plain"
              size="sm"
            >
              Stäng
            </Button>
          )}
        </Box>
      </Box>

      {/* PDF Controls */}
      {blobUrl && numPages && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          p: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          gap: 2
        }}>
          <Button 
            onClick={goToPrevPage} 
            disabled={pageNumber <= 1}
            size="sm"
            variant="outlined"
          >
            ← Föregående
          </Button>
          
          <Typography level="body-md">
            Sida {pageNumber} av {numPages}
          </Typography>
          
          <Button 
            onClick={goToNextPage} 
            disabled={pageNumber >= (numPages || 1)}
            size="sm"
            variant="outlined"
          >
            Nästa →
          </Button>
        </Box>
      )}

      {/* PDF Viewer Area */}
      <Box sx={{ 
        flex: 1, 
        position: 'relative',
        overflow: 'auto',
        bgcolor: 'grey.100',
        display: 'flex',
        justifyContent: 'center'
      }}>
        {/* Visa laddningsindikator */}
        {loading && (
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <CircularProgress />
            <Typography level="body-sm">Laddar PDF...</Typography>
          </Box>
        )}
        
        {/* Visa felmeddelande om laddningen misslyckades */}
        {error && (
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            p: 3,
            gap: 2
          }}>
            <Typography level="title-lg" color="danger">
              Kunde inte ladda PDF
            </Typography>
            <Typography level="body-md" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography level="body-md">
                Testa att öppna direkt i en ny flik:
              </Typography>
              <Button 
                onClick={openInNewTab}
                variant="solid"
                color="primary"
              >
                Öppna i ny flik
              </Button>
            </Box>
          </Box>
        )}
        
        {/* PDF Viewer using react-pdf */}
        {blobUrl && (
          <Box sx={{ p: 2 }}>
            <Document
              file={blobUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(err) => {
                console.error('Fel vid laddning av PDF:', err);
                setError('Kunde inte ladda PDF-dokumentet.');
                setLoading(false);
              }}
              loading={
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress />
                </Box>
              }
            >
              <Page 
                pageNumber={pageNumber} 
                renderTextLayer={false}
                renderAnnotationLayer={false}
                width={Math.min(window.innerWidth * 0.8, 800)}
              />
            </Document>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default StraightPDFViewer;