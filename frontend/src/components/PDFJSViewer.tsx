import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress } from '@mui/joy';
import * as pdfjsLib from 'pdfjs-dist';

// Konfigurera arbetaren för PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFJSViewerProps {
  pdfUrl: string;
  filename?: string;
  onError?: (message: string) => void;
}

const PDFJSViewer: React.FC<PDFJSViewerProps> = ({ pdfUrl, filename = 'dokument' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPDF = async () => {
      if (!pdfUrl) {
        setError('Ingen PDF-URL tillhandahållen');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Skapa en konsekvent URL för API:t baserat på backend-strukturen
        let finalUrl = pdfUrl;

        // Hantera backend-URL:er för Replit-miljön
        if (pdfUrl.includes('0.0.0.0:8001')) {
          // Använd PDF-media-endpointen som vi vet fungerar
          if (pdfUrl.includes('project_files/')) {
            // Extrahera sökvägen från URL
            const pathPattern = /project_files\/(.*?\.pdf)/;
            const pathMatch = pdfUrl.match(pathPattern);

            if (pathMatch && pathMatch[1]) {
              // Använd pdf-media-endpointen som är konfigurerad i backend
              finalUrl = `${window.location.protocol}//${window.location.host}/proxy/3000/api/files/pdf-media/${pathMatch[1]}`;
              console.log("Använder PDF-media API:", finalUrl);
            }
          } else {
            // Generisk proxy för övriga URL:er
            finalUrl = pdfUrl.replace(
              'http://0.0.0.0:8001', 
              `${window.location.protocol}//${window.location.host}/proxy/3000`
            );
          }
        }

        // Lägg till en parameter för att undvika cachning
        finalUrl = `${finalUrl}${finalUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
        console.log('Laddar PDF från:', finalUrl);

        // Använd fetch för mer kontroll över begäran
        const response = await fetch(finalUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/pdf',
          },
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`Servern svarade med ${response.status} (${response.statusText})`);
        }

        // Kontrollera content-type om den finns
        const contentType = response.headers.get('content-type');
        if (contentType && !contentType.includes('application/pdf')) {
          console.warn('Servern returnerade oväntad Content-Type:', contentType);
        }

        // Läs in PDF-datan som en arraybuffer
        const pdfData = await response.arrayBuffer();

        // Ladda PDF med PDF.js
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        const page = await pdf.getPage(1);

        // Anpassa skalan baserat på containerns bredd
        if (canvasRef.current && containerRef.current) {
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');

          if (!context) {
            throw new Error('Kunde inte skapa canvas-kontext');
          }

          const containerWidth = containerRef.current.clientWidth;
          const viewport = page.getViewport({ scale: 1.0 });
          const scale = Math.min(containerWidth / viewport.width, 1.5); // Begränsa maximal förstoring
          const scaledViewport = page.getViewport({ scale });

          canvas.height = scaledViewport.height;
          canvas.width = scaledViewport.width;

          await page.render({
            canvasContext: context,
            viewport: scaledViewport
          }).promise;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('PDF-fel:', error);
        setError(error instanceof Error ? error.message : 'Ett fel uppstod vid laddning av PDF');
        setIsLoading(false);
      }
    };

    loadPDF();
  }, [pdfUrl]);

  return (
    <Box 
      ref={containerRef}
      sx={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
        backgroundColor: '#f5f5f5',
        borderRadius: 'md'
      }}
    >
      {isLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
          <CircularProgress size="lg" />
          <Typography level="body-sm" sx={{ mt: 2 }}>
            Laddar {filename}...
          </Typography>
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', p: 3 }}>
          <Typography level="h3" color="danger" sx={{ mb: 2 }}>
            Kunde inte visa PDF
          </Typography>
          <Typography level="body-md">
            {error}
          </Typography>
          <Box 
            component="a"
            href={pdfUrl}
            target="_blank"
            sx={{
              display: 'inline-block',
              mt: 2,
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
        <canvas ref={canvasRef} style={{ maxWidth: '100%', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }} />
      )}
    </Box>
  );
};

export default PDFJSViewer;