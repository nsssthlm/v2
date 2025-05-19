import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Card } from '@mui/joy';
import axios from 'axios';

// För att ladda PDF direkt i <iframe> eller <object>
const SimpleDirectPDFPage = () => {
  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; name: string; url: string }[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [selectedPdfTitle, setSelectedPdfTitle] = useState<string>('');

  // Ladda PDF-filer från servern
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

  // Hantera klick på PDF-fil
  const handlePdfClick = (url: string, title: string) => {
    // Skapa URL på rätt format för direktrendering
    const directUrl = `/api/pdf/${url.split('/').pop()?.replace('.pdf', '')}/content/`;
    setSelectedPdf(directUrl);
    setSelectedPdfTitle(title);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography level="h1" sx={{ mb: 4 }}>Direkt PDF-visare</Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography level="h4" sx={{ mb: 2 }}>Tillgängliga PDF-filer</Typography>
        
        {uploadedFiles.length === 0 ? (
          <Typography>Inga PDF-filer hittades.</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {uploadedFiles.map((file) => (
              <Card
                key={file.id}
                variant="outlined"
                sx={{
                  width: 200,
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
                      bgcolor: 'danger.softBg',
                      color: 'danger.solidBg',
                      height: 100,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      mb: 1
                    }}
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8,24L8,24c0-0.6,0.4-1,1-1h6c0.6,0,1,0.4,1,1l0,0H8z"/>
                      <path d="M16,22H8c0,0,0-6.7,0-8s0-2.7,0-4c0-1.3,0.7-2.7,2-2.7c1.3,0,2,0,2,0v-4c0-0.6,0.4-1,1-1h0c0.6,0,1,0.4,1,1v4
                        c0,0,0.7,0,2,0c1.3,0,2,1.3,2,2.7c0,1.3,0,2.7,0,4C18,15.3,18,22,18,22H16z"/>
                    </svg>
                  </Box>
                  <Typography level="title-md">{file.name}</Typography>
                  <Typography level="body-sm" color="neutral">
                    Klicka för att öppna
                  </Typography>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Box>
      
      {/* Direkt PDF-visare med object-tagg */}
      {selectedPdf && (
        <Box sx={{ mt: 4 }}>
          <Typography level="h4" sx={{ mb: 2 }}>{selectedPdfTitle}</Typography>
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 'sm',
              height: '700px',
              overflow: 'hidden'
            }}
          >
            <object
              data={selectedPdf}
              type="application/pdf"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
            >
              <Typography sx={{ p: 4, textAlign: 'center' }}>
                Det gick inte att visa PDF:en. <a href={selectedPdf} target="_blank" rel="noreferrer">Öppna i ny flik</a>
              </Typography>
            </object>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default SimpleDirectPDFPage;