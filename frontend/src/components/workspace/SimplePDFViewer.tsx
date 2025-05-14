import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/joy';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist';

// Set the worker path to allow PDF.js to function properly
// Set to a fake worker for now since we have issues loading it
pdfjsLib.GlobalWorkerOptions.workerSrc = '';

interface SimplePDFViewerProps {
  url: string;
}

export const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ url }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const loadPDF = async () => {
      try {
        // Load document
        const pdfDocument = await pdfjsLib.getDocument(url).promise;
        setPdfDoc(pdfDocument);
        setTotalPages(pdfDocument.numPages);
        setCurrentPage(1);
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Kunde inte ladda PDF-filen. Försök öppna den i ett nytt fönster istället.');
        setLoading(false);
      }
    };

    loadPDF();

    // Cleanup
    return () => {
      if (pdfDoc) {
        pdfDoc.destroy().catch(err => {
          console.error('Error destroying PDF document:', err);
        });
      }
    };
  }, [url]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        // Get page
        const page = await pdfDoc.getPage(currentPage);
        
        // Get viewport
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const viewport = page.getViewport({ scale: 1.0 });
        
        // Adjust canvas dimensions to match viewport
        const scale = Math.min(
          canvas.parentElement!.clientWidth / viewport.width,
          600 / viewport.height
        );
        
        const scaledViewport = page.getViewport({ scale });
        
        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;
        
        // Render PDF page into canvas context
        const context = canvas.getContext('2d');
        if (!context) return;
        
        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
        };
        
        page.render(renderContext);
      } catch (err) {
        console.error('Error rendering PDF page:', err);
        setError('Kunde inte visa sidan. Försök med en annan sida eller öppna filen i ett nytt fönster.');
      }
    };

    renderPage();
  }, [pdfDoc, currentPage]);

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography color="danger" sx={{ mb: 2 }}>
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
      <Box sx={{ maxWidth: '100%', overflow: 'auto', mb: 2 }}>
        <canvas ref={canvasRef} />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button onClick={goToPrevPage} disabled={currentPage <= 1}>
          Föregående
        </Button>
        <Typography>
          Sida {currentPage} av {totalPages}
        </Typography>
        <Button onClick={goToNextPage} disabled={currentPage >= totalPages}>
          Nästa
        </Button>
      </Box>
    </Box>
  );
};

export default SimplePDFViewer;