import React, { useState, useEffect } from 'react';
import { Box, Link, Typography, Button, Stack, CircularProgress } from '@mui/joy';
import { OpenInNew, Download, PictureAsPdf, Visibility } from '@mui/icons-material';

interface SimplestPDFProps {
  pdfUrl: string;
  filename: string;
}

/**
 * En PDF-visare som använder Blob URL för att undvika säkerhetsblockeringar
 * samt visar en fallback om visningen ändå misslyckas.
 */
const SimplestPDF: React.FC<SimplestPDFProps> = ({ pdfUrl, filename }) => {
  const [loading, setLoading] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [showPdf, setShowPdf] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  
  // Funktion för att ladda ner PDF
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Funktion för att öppna i ny flik
  const handleOpenInNewTab = () => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };
  
  // Funktion för att konvertera PDF-länken till en blob URL
  const loadPdfAsBlob = async () => {
    if (blobUrl) return; // Undvik att ladda om om vi redan har en blob
    
    setLoading(true);
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
      setShowPdf(true);
      setShowFallback(false);
    } catch (error) {
      console.error('Kunde inte ladda PDF som blob:', error);
      setShowFallback(true);
    } finally {
      setLoading(false);
    }
  };
  
  // Visa PDF direkt via blob
  const handleShowPdf = () => {
    loadPdfAsBlob();
  };
  
  // Rensa blob URL när komponenten avmonteras
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 3
      }}>
        {/* PDF-visning med object tag och blob URL */}
        {showPdf && blobUrl ? (
          <Box sx={{ width: '100%', height: '80%', mb: 3, border: '1px solid #eee' }}>
            <object
              data={blobUrl}
              type="application/pdf"
              width="100%"
              height="100%"
              style={{ display: 'block', backgroundColor: '#f8f8f8' }}
            >
              <p>Din webbläsare stödjer inte inline PDF-visning.</p>
            </object>
          </Box>
        ) : (
          // Fallback-visning med PDF-ikon och knappar
          <Box sx={{ 
            width: '100%', 
            height: '70%', 
            mb: 3, 
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            border: '1px solid #eee',
            borderRadius: '4px',
            p: 4,
            backgroundColor: '#f8f8f8'
          }}>
            <Typography level="h4" sx={{ mb: 2 }}>
              {filename}
            </Typography>
            
            {loading ? (
              <CircularProgress size="lg" sx={{ mb: 3 }} />
            ) : (
              <PictureAsPdf 
                sx={{ 
                  width: '100px', 
                  height: '100px', 
                  mb: 3,
                  opacity: 0.7,
                  color: 'primary.main'
                }}
              />
            )}
            
            <Typography level="body-md" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
              {showFallback 
                ? "PDF-visning kunde inte laddas. Vänligen använd knapparna nedan istället."
                : "Klicka på knappen nedan för att visa PDF-dokumentet."}
            </Typography>
            
            {/* Visa PDF-knapp (bara om vi inte redan försökt och misslyckats) */}
            {!showFallback && !showPdf && (
              <Button
                variant="solid"
                color="primary"
                size="lg"
                startDecorator={<Visibility />}
                onClick={handleShowPdf}
                disabled={loading}
                sx={{ mb: 2 }}
              >
                {loading ? "Laddar..." : "Visa PDF"}
              </Button>
            )}
          </Box>
        )}
        
        {/* Alltid visa dessa alternativa åtgärder */}
        <Stack direction="row" spacing={2}>
          <Button 
            variant="solid" 
            color="primary"
            startDecorator={<OpenInNew />}
            onClick={handleOpenInNewTab}
          >
            Öppna i ny flik
          </Button>
          
          <Button 
            variant="outlined" 
            color="neutral"
            startDecorator={<Download />}
            onClick={handleDownload}
          >
            Ladda ner
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default SimplestPDF;