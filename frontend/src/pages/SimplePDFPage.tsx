import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, Container, CircularProgress } from '@mui/joy';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist';
import axios from 'axios';

// Konfigurera PDF.js worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

const SimplePDFPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; name: string; url: string }[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState<string>('');
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.5);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ladda tidigare uppladdade filer vid sidladdning
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get('/api/files/web/test111-62/data/');
        if (response.data && response.data.files) {
          setUploadedFiles(
            response.data.files.map((file: any) => ({
              id: file.id || `file_${Math.random().toString(36).substr(2, 9)}`,
              name: file.name,
              url: file.file
            }))
          );
        }
      } catch (error) {
        console.error('Kunde inte hämta filer:', error);
      }
    };
    
    fetchFiles();
  }, []);

  // Hantera filval
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Kontrollera att det är en PDF
      if (file.type !== 'application/pdf') {
        setUploadError('Endast PDF-filer kan väljas');
        return;
      }
      
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  // Hantera uppladdning
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Ingen fil vald');
      return;
    }
    
    setUploading(true);
    setUploadError(null);
    
    try {
      // Skapa formdata för uppladdning
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', selectedFile.name);
      formData.append('folder', 'test111-62');  // En test-mapp som finns i systemet
      
      // Ladda upp filen
      const response = await axios.post('/api/files/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Lägg till den nya filen i listan
      if (response.data && response.data.id) {
        const newFile = {
          id: response.data.id,
          name: response.data.name || selectedFile.name,
          url: response.data.file || `/api/files/get-file-content/${response.data.id}/`
        };
        
        setUploadedFiles(prevFiles => [...prevFiles, newFile]);
        
        // Återställ filval
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Fel vid uppladdning:', error);
      setUploadError('Kunde inte ladda upp filen. Försök igen.');
    } finally {
      setUploading(false);
    }
  };

  // Hantera klick på PDF i listan
  const handlePdfClick = (url: string, title: string) => {
    setPdfUrl(`/api/pdf/${url.split('/').pop()?.replace('.pdf', '')}/content/`);
    setPdfTitle(title);
    setLoading(true);
    
    // Återställ PDF-visaren
    setCurrentPage(1);
    setNumPages(0);
    setPdfDocument(null);
  };

  // Ladda PDF när pdfUrl ändras
  useEffect(() => {
    if (!pdfUrl) return;
    
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Laddar PDF från:', pdfUrl);
        
        // Lägg till token om tillgänglig
        const options: any = {
          url: pdfUrl,
          withCredentials: true,
        };
        
        const token = localStorage.getItem('jwt_token');
        if (token) {
          options.httpHeaders = {
            'Authorization': `Bearer ${token}`
          };
        }
        
        // Ladda PDF-dokument
        const loadingTask = pdfjsLib.getDocument(options);
        const pdf = await loadingTask.promise;
        
        setPdfDocument(pdf);
        setNumPages(pdf.numPages);
        setCurrentPage(1);
        setLoading(false);
      } catch (e) {
        console.error('Fel vid laddning av PDF:', e);
        setError(`Kunde inte ladda PDF: ${(e as Error).message}`);
        setLoading(false);
      }
    };
    
    loadPdf();
    
    return () => {
      // Städa upp vid avmonterad komponent
      if (pdfDocument) {
        pdfDocument.destroy().catch(console.error);
      }
    };
  }, [pdfUrl]);

  // Rendering av aktuell sida
  useEffect(() => {
    if (!pdfDocument || !canvasRef.current) return;
    
    const renderPage = async () => {
      try {
        const page = await pdfDocument.getPage(currentPage);
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const viewport = page.getViewport({ scale });
        const context = canvas.getContext('2d');
        if (!context) return;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context,
          viewport
        }).promise;
      } catch (e) {
        console.error('Fel vid rendering av PDF-sida:', e);
        setError('Kunde inte visa PDF-sidan.');
      }
    };
    
    renderPage();
  }, [pdfDocument, currentPage, scale]);

  // Navigeringskontroller
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.6));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography level="h1" sx={{ mb: 4 }}>Enkel PDF-visare</Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography level="h4" sx={{ mb: 2 }}>Tillgängliga PDF-filer</Typography>
        
        {uploadedFiles.length === 0 ? (
          <Typography>Inga PDF-filer hittades.</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {uploadedFiles.map((file) => (
              <Box
                key={file.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'neutral.outlinedBorder',
                  borderRadius: 'sm',
                  p: 2,
                  width: 200,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'neutral.softBg'
                  }
                }}
                onClick={() => handlePdfClick(file.url, file.name)}
              >
                <Box
                  sx={{
                    bgcolor: 'danger.softBg',
                    color: 'danger.solidBg',
                    width: '100%',
                    height: 100,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: 1
                  }}
                >
                  PDF
                </Box>
                <Typography level="body-sm">{file.name}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
      
      {/* PDF-visare */}
      {pdfUrl && (
        <Box sx={{ mt: 4 }}>
          <Typography level="h4" sx={{ mb: 2 }}>{pdfTitle}</Typography>
          
          {/* Kontrollpanel */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={goToPreviousPage}
                disabled={currentPage <= 1 || loading}
              >
                Föregående
              </Button>
              <Button
                variant="outlined"
                onClick={goToNextPage}
                disabled={currentPage >= numPages || loading}
              >
                Nästa
              </Button>
            </Box>
            
            <Typography sx={{ alignSelf: 'center' }}>
              Sida {currentPage} av {numPages}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={zoomOut}
                disabled={loading}
              >
                Zooma ut
              </Button>
              <Button
                variant="outlined"
                onClick={zoomIn}
                disabled={loading}
              >
                Zooma in
              </Button>
            </Box>
          </Box>
          
          {/* PDF-visningsområde */}
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'neutral.outlinedBorder',
              borderRadius: 'sm',
              p: 2,
              height: 700,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              bgcolor: 'background.level1',
              overflow: 'auto'
            }}
          >
            {loading && (
              <CircularProgress
                size="lg"
                sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
              />
            )}
            
            {error && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography color="danger" mb={2}>{error}</Typography>
                <Button
                  color="primary"
                  onClick={() => window.location.reload()}
                >
                  Försök igen
                </Button>
              </Box>
            )}
            
            <canvas
              ref={canvasRef}
              style={{
                display: loading || error ? 'none' : 'block',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
              }}
            />
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default SimplePDFPage;