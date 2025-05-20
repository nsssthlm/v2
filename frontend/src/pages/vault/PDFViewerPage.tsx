import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * En extremt enkel PDF-visningssida utan säkerhetsfunktioner
 */
const PDFViewerPage: React.FC = () => {
  const { pdfUrl } = useParams<{ pdfUrl: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const decodedUrl = pdfUrl ? decodeURIComponent(pdfUrl) : '';
  
  useEffect(() => {
    // Enkel laddningseffekt
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [pdfUrl]);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  if (!decodedUrl) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography level="h3" sx={{ mb: 2 }}>Ingen PDF-adress angiven</Typography>
        <Button onClick={handleBack}>Tillbaka</Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%', height: '100vh', position: 'relative' }}>
      {loading && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.8)',
            zIndex: 10
          }}
        >
          <CircularProgress />
        </Box>
      )}
      
      <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 100 }}>
        <Button onClick={handleBack} variant="solid" color="primary">
          ← Tillbaka
        </Button>
      </Box>
      
      <iframe 
        src={decodedUrl} 
        width="100%" 
        height="100%" 
        style={{ border: 'none' }}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError('Kunde inte ladda PDF-filen');
        }}
      />
      
      {error && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            p: 4,
            boxShadow: '0 0 20px rgba(0,0,0,0.2)',
            borderRadius: 'sm',
            textAlign: 'center'
          }}
        >
          <Typography level="h3" color="danger" sx={{ mb: 2 }}>{error}</Typography>
          <Button onClick={handleBack}>Tillbaka</Button>
        </Box>
      )}
    </Box>
  );
};

export default PDFViewerPage;