import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, Container, CircularProgress, Card } from '@mui/joy';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist';
import axios from 'axios';

// Konfigurera PDF.js worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

// Komponent för PDF-visning i dialog
const PDFDialog = ({ open, onClose, pdfUrl, title }: { open: boolean; onClose: () => void; pdfUrl: string; title: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.5);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !pdfUrl) return;
    
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
  }, [open, pdfUrl]);

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
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          minWidth: 800,
          maxWidth: '95vw',
          minHeight: 600,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Typography level="h4">{title}</Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
              flexGrow: 1, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              overflow: 'auto',
              bgcolor: 'background.level2',
              borderRadius: 'sm',
              position: 'relative',
              p: 2
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
      </DialogContent>
    </Dialog>
  );
};

// Huvudsidan för PDF-hantering
const PDFViewerPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; name: string; url: string }[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedPdf, setSelectedPdf] = useState<{ url: string; title: string } | null>(null);
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
      
      // Skapa URL för förhandsgranskning
      const fileUrl = URL.createObjectURL(file);
      setPreview(fileUrl);
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
        setPreview(null);
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
    setSelectedPdf({
      url: `/api/pdf/${url.split('/').pop()?.replace('.pdf', '')}/content/`,
      title
    });
    setIsDialogOpen(true);
  };

  // Stäng dialogen
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPdf(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography level="h1" sx={{ mb: 4 }}>PDF-visare</Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography level="h4" sx={{ mb: 2 }}>Ladda upp ny PDF</Typography>
        
        <Box sx={{ mb: 2 }}>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
            id="pdf-file-input"
          />
          <Button 
            component="label" 
            htmlFor="pdf-file-input"
            variant="outlined" 
            sx={{ mr: 2 }}
          >
            Välj PDF-fil
          </Button>
          
          {selectedFile && (
            <Button 
              onClick={handleUpload} 
              loading={uploading}
              disabled={uploading}
              variant="solid"
              color="primary"
            >
              Ladda upp
            </Button>
          )}
        </Box>
        
        {selectedFile && (
          <Typography level="body-md">
            Vald fil: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
          </Typography>
        )}
        
        {uploadError && (
          <Typography color="danger" sx={{ mt: 1 }}>
            {uploadError}
          </Typography>
        )}
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      <Box>
        <Typography level="h4" sx={{ mb: 2 }}>Dina PDF-filer</Typography>
        
        {uploadedFiles.length === 0 ? (
          <Typography>Inga PDF-filer uppladdade ännu.</Typography>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 2 }}>
            {uploadedFiles.map((file) => (
              <Card 
                key={file.id} 
                variant="outlined" 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 'md'
                  }
                }}
                onClick={() => handlePdfClick(file.url, file.name)}
              >
                <Box sx={{ p: 2 }}>
                  <Box 
                    sx={{ 
                      bgcolor: 'background.level1', 
                      height: 140, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mb: 2
                    }}
                  >
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="#e53935">
                      <path d="M8,24L8,24c0-0.6,0.4-1,1-1h6c0.6,0,1,0.4,1,1l0,0H8z"/>
                      <path d="M16,22H8c0,0,0-6.7,0-8s0-2.7,0-4c0-1.3,0.7-2.7,2-2.7c1.3,0,2,0,2,0v-4c0-0.6,0.4-1,1-1h0c0.6,0,1,0.4,1,1v4
                        c0,0,0.7,0,2,0c1.3,0,2,1.3,2,2.7c0,1.3,0,2.7,0,4C18,15.3,18,22,18,22H16z"/>
                    </svg>
                  </Box>
                  <Typography level="title-md" sx={{ mb: 0.5 }}>
                    {file.name}
                  </Typography>
                  <Typography level="body-sm" color="neutral">
                    Klicka för att öppna
                  </Typography>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Box>
      
      {/* PDF-dialog */}
      {selectedPdf && (
        <PDFDialog 
          open={isDialogOpen}
          onClose={handleCloseDialog}
          pdfUrl={selectedPdf.url}
          title={selectedPdf.title}
        />
      )}
    </Container>
  );
};

export default PDFViewerPage;

// Hjälpkomponent för att separera innehåll
const Divider = ({ sx }: { sx?: any }) => (
  <Box 
    sx={{ 
      height: '1px', 
      width: '100%', 
      bgcolor: 'divider',
      ...sx 
    }} 
  />
);