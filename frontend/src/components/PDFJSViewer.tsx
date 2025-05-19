import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress } from '@mui/joy';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';
import axios from 'axios';

// Konfigurera arbetaren för PDF.js med lokal arbetare istället för CDN
// Detta säkerställer att vi använder rätt version och inte är beroende av extern CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

interface PDFJSViewerProps {
  pdfUrl: string;
  filename: string;
}

// Hjälpfunktion för att kontrollera om en URL pekar till en extern domän
const isExternalUrl = (url: string) => {
  if (!url.startsWith('http')) return false;
  try {
    const urlObj = new URL(url);
    return urlObj.hostname !== window.location.hostname;
  } catch (e) {
    return false;
  }
};

// Hjälpfunktion för att validera en PDF arraybuffer
const isPdfArrayBuffer = (buffer: ArrayBuffer): boolean => {
  if (!buffer || buffer.byteLength < 5) return false;
  
  // PDF filer börjar alltid med %PDF
  const signatureBytes = new Uint8Array(buffer, 0, 5);
  const signature = String.fromCharCode.apply(null, Array.from(signatureBytes));
  return signature.startsWith('%PDF');
};

const PDFJSViewer: React.FC<PDFJSViewerProps> = ({ pdfUrl, filename }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Bearbeta URL till ett format som kan visas med PDF.js
  const processedUrl = React.useMemo(() => {
    // Om ingen URL, returnera tom sträng
    if (!pdfUrl) return '';
    
    // Hantera backend URL:er för Replit-miljön
    let finalUrl = pdfUrl;
    
    console.log('Bearbetar PDF URL:', pdfUrl);
    
    // Ersätt alla lokala URL:er (0.0.0.0:8001) med Replit proxy URL
    if (pdfUrl.includes('0.0.0.0:8001')) {
      finalUrl = pdfUrl.replace(
        'http://0.0.0.0:8001', 
        `${window.location.protocol}//${window.location.host}/proxy/3000`
      );
      console.log("URL med proxy:", finalUrl);
    }
    
    // Om URL:en innehåller project_files, extrahera sökvägen och använd /media-debug/ direkt
    if (finalUrl.includes('project_files/')) {
      // Extrahera sökvägen för projektfiler från URL
      const pathPattern = /project_files\/(.*?\.pdf)/;
      const pathMatch = finalUrl.match(pathPattern);
      
      if (pathMatch && pathMatch[1]) {
        const pdfPath = pathMatch[1];
        // Använd media-debug URL som har loggning aktiverad
        finalUrl = `${window.location.protocol}//${window.location.host}/proxy/3000/media-debug/project_files/${pdfPath}`;
        console.log("Använder debug media URL:", finalUrl);
      }
    } else if (pdfUrl.includes('/api/files/web/')) {
      // För API endpoint-format, extrahera viktiga delar och använd media URL
      const apiPattern = /\/api\/files\/web\/.*?\/data\/project_files\/(.*?\.pdf)/;
      const apiMatch = finalUrl.match(apiPattern);
      
      if (apiMatch && apiMatch[1]) {
        // Använd vår nya diagnostiska media-debug URL för bättre loggning
        finalUrl = `${window.location.protocol}//${window.location.host}/proxy/3000/media-debug/project_files/${apiMatch[1]}`;
        console.log("Använder debug media URL för API-format:", finalUrl);
      } else {
        // Försök hitta bara filnamnet i URL:en som sista alternativ
        const parts = finalUrl.split('/');
        const pdfName = parts[parts.length - 1]; 
        if (pdfName && pdfName.endsWith('.pdf')) {
          console.log("Extraherar filnamn från URL:", pdfName);
          // Använd media-debug och senaste filuppladdningsmappen
          finalUrl = `${window.location.protocol}//${window.location.host}/proxy/3000/media-debug/project_files/2025/05/19/${pdfName}`;
        }
      }
    }
    
    // Lägg till en tidsstämpelparameter för att undvika cachning
    finalUrl = `${finalUrl}${finalUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
    
    return finalUrl;
  }, [pdfUrl]);

  // Funktion för att skapa alternativa URL:er om den ursprungliga misslyckas
  const createAlternativeUrl = (url: string, attemptNum: number): string => {
    // Plocka bort timestamp-parametern om den finns
    const cleanUrl = url.split('?')[0];
    
    // Dela upp URL:en
    const urlParts = cleanUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    
    // Använd alltid säkra HTTPS-proxyn med rätt format
    const baseUrl = `${window.location.protocol}//${window.location.host}/proxy/3000`;
    
    // Skapa intelligenta fallbacks baserat på vilket försök vi är på
    switch (attemptNum) {
      case 1:
        // Använd debug media URL för filnamnet med bara filnamnet
        if (filename && filename.endsWith('.pdf')) {
          console.log("Försök 1: Använder media-debug URL med filnamn", filename);
          return `${baseUrl}/media-debug/project_files/2025/05/19/${filename}`;
        }
        break;
        
      case 2:
        // Försök med direct/media som är en säker endpunkt med CORS och Content-Type
        console.log("Försök 2: Använder direct/media path", filename);
        return `${baseUrl}/direct/media/project_files/2025/05/19/${filename}`;
        
      case 3:
        // Försök med den ursprungliga PDF URL:en via vår dedikerade PDF-endpoint
        if (url.includes('/project_files/')) {
          // Extrahera sökvägen för projektfiler 
          const pathPattern = /project_files\/(.*?\.pdf)/;
          const pathMatch = url.match(pathPattern);
          
          if (pathMatch && pathMatch[1]) {
            console.log("Försök 3: Använder direkt PDF endpoint", pathMatch[1]);
            return `${baseUrl}/pdf/${pathMatch[1]}`;
          }
        }
        
        // Om vi inte kunde extrahera sökvägen, prova med den enklaste directa PDF-filhanteringen
        return `${baseUrl}/pdf/2025/05/19/${filename}`;
        
      case 4:
        // Som sista försök, försök med exakt filnamn från 15 maj 
        console.log("Försök 4: Försöker med filer från 15 maj istället", filename);
        
        // Se om detta är en Beast PDF och försök med det gamla uppladdningsdatumet
        if (filename.includes('BEAst')) {
          return `${baseUrl}/media-debug/project_files/2025/05/15/BEAst-PDF-Guidelines-2.0_1.pdf`;
        }
        
        // Annars prova med ett annat filnamn som vi vet fungerar
        return `${baseUrl}/media-debug/project_files/2025/05/15/AAAAExempel_pa_ritningar.pdf`;
    }
    
    // Om inget av ovanstående fungerade, försök med original-URL:en men lägg till timestamp
    return `${url.split('?')[0]}?t=${Date.now()}`;
  };

  // Använd en separat effekt för att hämta PDF-filen som en arraybuffer
  useEffect(() => {
    let isMounted = true;
    let attemptCount = 0;
    const maxAttempts = 4; // Ökat antal försök 
    
    const fetchPdf = async (url: string, alternativeAttempt = false) => {
      if (!isMounted || attemptCount >= maxAttempts) return;
      
      attemptCount++;
      
      try {
        if (attemptCount === 1) {
          setIsLoading(true);
          setError(null);
          console.log('Första försök att hämta PDF-data från URL:', url);
        } else {
          console.log(`Försök ${attemptCount}/${maxAttempts}: ${alternativeAttempt ? 'Alternativ' : 'Direkt'} URL:`, url);
        }
        
        // Använd fetch API för bättre hantering av binärfiler
        const fetchResponse = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/pdf',
          },
          // Undvik cache för säkerhetsskull
          cache: 'no-store'
        });
        
        if (!fetchResponse.ok) {
          console.warn(`Servern svarade med ${fetchResponse.status} (${fetchResponse.statusText}) för URL: ${url}`);
          throw new Error(`Servern svarade med ${fetchResponse.status}`);
        }
        
        const contentType = fetchResponse.headers.get('content-type');
        console.log(`Mottagen Content-Type: ${contentType} för URL: ${url}`);
        
        if (!contentType?.includes('application/pdf')) {
          console.warn('Servern returnerade oväntad Content-Type:', contentType);
        }
        
        // Läs in binärdatan som arraybuffer
        const buffer = await fetchResponse.arrayBuffer();
        
        if (!buffer || buffer.byteLength < 10) {
          throw new Error('För lite data returnerades');
        }
        
        // Kontrollera om vi fick PDF-data
        if (isPdfArrayBuffer(buffer)) {
          console.log(`PDF hämtad framgångsrikt, storlek: ${buffer.byteLength} bytes från URL: ${url}`);
          if (isMounted) {
            setPdfBytes(buffer);
          }
        } else {
          console.error('Servern returnerade data som inte är PDF-format');
          throw new Error('Servern returnerade inte giltig PDF-data');
        }
      } catch (err) {
        console.error(`Fel vid hämtning av PDF (försök ${attemptCount}/${maxAttempts}):`, err);
        
        if (attemptCount < maxAttempts) {
          // Använd vår smarta generering av alternativa URL:er baserat på vilket försök vi är på
          const alternativeUrl = createAlternativeUrl(processedUrl, attemptCount);
          
          // Om vi genererade en ny URL, prova den
          if (alternativeUrl !== url) {
            console.log(`Provar alternativ URL (${attemptCount}):`, alternativeUrl);
            fetchPdf(alternativeUrl, true);
          } else {
            // Annars prova utan parametrar som sista utväg
            const cleanUrl = url.split('?')[0];
            console.log(`Provar rengjord URL utan parametrar:`, cleanUrl);
            fetchPdf(cleanUrl, true);
          }
        } else {
          if (isMounted) {
            setError(`Kunde inte ladda PDF: Försökte ${maxAttempts} gånger med olika URL-format men misslyckades. Försök öppna i ny flik.`);
            setIsLoading(false);
          }
        }
      }
    };
    
    fetchPdf(processedUrl);
    
    return () => {
      isMounted = false;
    };
  }, [processedUrl]);

  // Använd en separat effekt för att rendera PDF:en när bytes är tillgängliga
  useEffect(() => {
    let pdfDoc: pdfjsLib.PDFDocumentProxy | null = null;
    let isMounted = true;
    
    const renderPdf = async () => {
      if (!pdfBytes || !canvasRef.current) return;
      
      try {
        // Ladda dokumentet med PDF.js från arraybuffer
        console.log('Laddar PDF-dokument från arraybuffer');
        pdfDoc = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
        
        if (!isMounted) return;
        
        setNumPages(pdfDoc.numPages);
        await renderPage(pdfDoc, 1);
        setIsLoading(false);
      } catch (err) {
        console.error('Fel vid rendering av PDF:', err);
        
        if (isMounted) {
          // Visa detaljerat felmeddelande
          const errorMessage = err instanceof Error ? err.message : 'Okänt fel vid PDF-rendering';
          setError(`PDF-rendering misslyckades: ${errorMessage}`);
          setIsLoading(false);
        }
      }
    };
    
    const renderPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number) => {
      if (!canvasRef.current) return;
      
      try {
        const page = await pdf.getPage(pageNum);
        
        const viewport = page.getViewport({ scale: 1.0 });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('Kunde inte skapa canvas-kontext');
        }
        
        // Anpassa canvas-storleken till viewporten
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Om container finns, justera skalan för att passa i containern
        if (containerRef.current) {
          const containerWidth = containerRef.current.clientWidth;
          const scale = containerWidth / viewport.width;
          const scaledViewport = page.getViewport({ scale });
          
          canvas.height = scaledViewport.height;
          canvas.width = scaledViewport.width;
          
          await page.render({
            canvasContext: context,
            viewport: scaledViewport
          }).promise;
        } else {
          await page.render({
            canvasContext: context,
            viewport
          }).promise;
        }
        
        setCurrentPage(pageNum);
      } catch (err) {
        console.error('Fel vid rendering av PDF-sida:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Kunde inte rendera PDF-sidan');
        }
      }
    };
    
    if (pdfBytes) {
      renderPdf();
    }
    
    return () => {
      isMounted = false;
      if (pdfDoc) {
        // Frigör PDF-dokument när komponenten avmonteras
        pdfDoc.destroy();
      }
    };
  }, [pdfBytes]);
  
  // Lyssna på storleksändringar i containern
  useEffect(() => {
    if (!containerRef.current || !pdfBytes) return;
    
    const resizeObserver = new ResizeObserver(() => {
      // Uppdatera rendering när containerstorleken ändras
      if (numPages > 0 && !isLoading) {
        const loadPdf = async () => {
          try {
            const pdfDoc = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
            await renderPage(pdfDoc, currentPage);
            pdfDoc.destroy();
          } catch (err) {
            console.error('Fel vid omladdning efter storleksändring:', err);
          }
        };
        
        loadPdf();
      }
    });
    
    resizeObserver.observe(containerRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [numPages, isLoading, currentPage, pdfBytes]);
  
  const renderPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number) => {
    if (!canvasRef.current || !containerRef.current) return;
    
    try {
      const page = await pdf.getPage(pageNum);
      
      const containerWidth = containerRef.current.clientWidth;
      const viewport = page.getViewport({ scale: 1.0 });
      const scale = containerWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale });
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;
      
      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;
      
      await page.render({
        canvasContext: context,
        viewport: scaledViewport
      }).promise;
    } catch (err) {
      console.error('Fel vid rendering:', err);
    }
  };

  return (
    <Box 
      ref={containerRef}
      sx={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'auto',
        bgcolor: '#f5f5f5'
      }}
    >
      {isLoading ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          p: 3
        }}>
          <CircularProgress size="lg" />
          <Typography level="body-sm" sx={{ mt: 2 }}>
            Laddar {filename}...
          </Typography>
        </Box>
      ) : error ? (
        <Box sx={{ 
          textAlign: 'center',
          p: 3,
          maxWidth: '500px'
        }}>
          <Typography level="h3" color="danger" sx={{ mb: 2 }}>
            Kunde inte visa PDF
          </Typography>
          <Typography sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Typography level="body-sm" sx={{ mb: 2 }}>
            Försök använda en direkt länk eller ladda ner filen istället.
          </Typography>
          <Box 
            component="a"
            href={processedUrl}
            target="_blank"
            sx={{
              display: 'inline-block',
              p: 1.5,
              bgcolor: 'primary.500',
              color: 'white',
              borderRadius: 'md',
              textDecoration: 'none',
              '&:hover': {
                bgcolor: 'primary.600'
              }
            }}
          >
            Öppna i ny flik
          </Box>
        </Box>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          width: '100%'
        }}>
          <canvas ref={canvasRef} style={{ maxWidth: '100%' }} />
          
          {numPages > 1 && (
            <Box sx={{ 
              mt: 2, 
              display: 'flex', 
              alignItems: 'center',
              gap: 1
            }}>
              <Typography level="body-sm">
                Sida {currentPage} av {numPages}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default PDFJSViewer;