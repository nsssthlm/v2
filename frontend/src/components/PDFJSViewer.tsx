import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress } from '@mui/joy';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';
import axios from 'axios';
import { useProject } from '../contexts/ProjectContext'; // Import ProjectContext


// Konfigurera arbetaren för PDF.js med lokal arbetare istället för CDN
// Detta säkerställer att vi använder rätt version och inte är beroende av extern CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

interface PDFJSViewerProps {
  pdfUrl: string;
  filename: string;
  projectId?: number | string | null;
  folderId?: number | string | null;
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

const PDFJSViewer: React.FC<PDFJSViewerProps> = ({ pdfUrl, filename, projectId, folderId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [finalUrl, setFinalUrl] = useState<string>('');
  const { currentProject } = useProject(); // Hämta aktuellt projekt från context

  // Använd projektID från props om det finns, annars från context, och säkerställ att det är en sträng
  const activeProjectId = (projectId?.toString() || currentProject?.id?.toString() || null);
  
  console.log('PDF Debug:', {
    providedProjectId: projectId,
    contextProjectId: currentProject?.id,
    activeProjectId: activeProjectId,
    currentProject: currentProject
  });

  // Bearbeta URL till ett format som kan visas med PDF.js
  const processedUrl = React.useMemo(() => {
    if (!pdfUrl) return '';

    // Få basens URL för proxys och direkta anrop
    const baseUrl = `${window.location.protocol}//${window.location.host}/proxy/8001`;
    let finalUrl = pdfUrl;

    // Logga original-URL:en för diagnostik
    console.log('PDF original URL:', pdfUrl);
    
    // Om URL:en redan innehåller vår proxy-bas, använd den direkt
    if (pdfUrl.includes('/proxy/8001')) {
      console.log('Använder redan proxad URL:', pdfUrl);
      return pdfUrl;
    }

    // Ersätt alla lokala URL:er med proxy URL som kan nås från klienten
    if (pdfUrl.includes('0.0.0.0:8001')) {
      finalUrl = pdfUrl.replace('http://0.0.0.0:8001', baseUrl);
      console.log("Proxied URL:", finalUrl);
    }

    // Extrahera filnamnet oavsett URL-format
    const parts = finalUrl.split('/');
    const fileName = parts[parts.length - 1]?.split('?')[0]; // Ta bort eventuella queryparameter

    // Strategi 1: Om URL:en innehåller project_files med datum, använd den direkta PDF-endpointen
    if (finalUrl.includes('project_files/')) {
      const dateAndPathPattern = /project_files\/(\d{4}\/\d{2}\/\d{2}\/[^?&]+\.pdf)/;
      const dateAndPathMatch = finalUrl.match(dateAndPathPattern);

      if (dateAndPathMatch && dateAndPathMatch[1]) {
        // Använd direkta PDF-endpointen
        finalUrl = `${baseUrl}/pdf/${dateAndPathMatch[1]}`;
        console.log("1. Använder direkt PDF-endpoint:", finalUrl);
      }
    } 
    // Strategi 2: Om URL:en kommer från API-endpoint, extrahera sökvägen därifrån
    else if (finalUrl.includes('/api/files/web/')) {
      const apiPattern = /\/api\/files\/web\/.*?\/data\/project_files\/(\d{4}\/\d{2}\/\d{2}\/[^?&]+\.pdf)/;
      const apiMatch = finalUrl.match(apiPattern);

      if (apiMatch && apiMatch[1]) {
        finalUrl = `${baseUrl}/pdf/${apiMatch[1]}`;
        console.log("2. Använder PDF-endpoint från API:", finalUrl);
      } 
      // Om inget matchande mönster men vi har ett filnamn, använd pdf-finder med filnamnet
      else if (fileName && fileName.endsWith('.pdf')) {
        // Först prova direkt med den säkra PDF-findern
        finalUrl = `${baseUrl}/pdf-finder/?filename=${fileName}&stream=true`;
        console.log("3. Använder pdf-finder med filnamn:", finalUrl);
      }
    }
    // Strategi 3: Om URL:en är en direkt länk till en PDF men inte innehåller project_files
    else if (pdfUrl.endsWith('.pdf')) {
      // För att säkerställa korrekt Content-Type, prova PDF-findern först
      finalUrl = `${baseUrl}/pdf-finder/?filename=${fileName}&stream=true`;
      console.log("4. Använder pdf-finder för direkt länk:", finalUrl);
    }

    // Lägg till cachebuster om det inte redan finns stream-parameter
    if (!finalUrl.includes('stream=true')) {
      finalUrl = `${finalUrl}${finalUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
    }

    return finalUrl;
  }, [pdfUrl]);

  // Funktion för att skapa alternativa URL:er om den ursprungliga misslyckas
  const createAlternativeUrl = (url: string, attemptNum: number): string => {
    // Plocka bort timestamp-parametern
    const cleanUrl = url.split('?')[0];

    // Extrahera filnamnet
    const urlParts = cleanUrl.split('/');
    const filename = urlParts[urlParts.length - 1];

    // Bas-URL för alla requests
    const baseUrl = `${window.location.protocol}//${window.location.host}/proxy/3000`;

    // Skapa olika fallback-strategier baserat på vilken försöksordning vi är på
    switch (attemptNum) {
      case 1:
        // Först: Prova direkt med pdf-finder API som hittar filen baserat på namn
        if (filename && filename.endsWith('.pdf')) {
          console.log("Fallback 1: Använder pdf-finder med exact match", filename);
          return `${baseUrl}/pdf-finder/?filename=${filename}&stream=true`;
        }
        break;

      case 2:
        // Sedan: Försök extrahera datum/sökväg från URL:en
        const datePattern = /(\d{4}\/\d{2}\/\d{2}\/[^?/]+\.pdf)/;
        const dateMatch = url.match(datePattern);
        if (dateMatch && dateMatch[1]) {
          console.log("Fallback 2: Använder exakt sökväg med datum", dateMatch[1]);
          return `${baseUrl}/pdf/${dateMatch[1]}`;
        }

        // Om ingen träff, prova vanliga media-URL med dagens datum
        const today = new Date().toISOString().split('T')[0].replace(/-/g, '/');
        return `${baseUrl}/media/project_files/${today}/${filename}`;

      case 3:
        // Tredje alternativ: Prova direct/media som direktserverar filen
        console.log("Fallback 3: Använder direct media API", filename);
        if (url.includes('/project_files/')) {
          // Försök extrahera hela sökvägen efter project_files/
          const projectMatch = url.match(/project_files\/(.+\.pdf)/);
          if (projectMatch && projectMatch[1]) {
            return `${baseUrl}/direct/media/project_files/${projectMatch[1]}`;
          }
        }
        // Om vi inte kan hitta projekt-sökvägen, prova med dagens datum
        const today2 = new Date().toISOString().split('T')[0].replace(/-/g, '/');
        return `${baseUrl}/direct/media/project_files/${today2}/${filename}`;

      case 4:
        // Sista utvägen: Prova att söka efter basnamnet utan eventuella hash-tillägg
        const baseNamePattern = /^([^_]+)/;
        const baseNameMatch = filename.match(baseNamePattern);
        if (baseNameMatch) {
          const baseName = baseNameMatch[1];
          console.log("Fallback 4: Använder basnamn utan suffix", baseName);
          // Testa både med och utan .pdf
          const nameWithExt = baseName.endsWith('.pdf') ? baseName : `${baseName}.pdf`;
          return `${baseUrl}/pdf-finder/?filename=${nameWithExt}&stream=true`;
        }
        break;
    }

    // Om inget fungerade, lägg till timestamp på originalURL
    return `${url.split('?')[0]}?nocache=${Date.now()}`;
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
          if (fetchResponse.status === 404) {
            // För 404, försök med direkt URL om vi använder proxy
            if (url.includes('/proxy/8001')) {
              const directUrl = url.replace('/proxy/8001', '');
              console.log('Provar direkt URL:', directUrl);
              return await fetchPdf(directUrl);
            }
          }
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

  // Använd activeProjectId som redan är deklarerad ovan för URL-er
  console.log('Använder aktivt projektID:', activeProjectId);
  console.log('Current Project:', {
    id: currentProject?.id,
    name: currentProject?.name,
    description: currentProject?.description
  });
  console.log('Aktivt projektId:', projectId);

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