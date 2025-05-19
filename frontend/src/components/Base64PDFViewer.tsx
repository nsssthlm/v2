import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/joy';
import { FullscreenOutlined, Refresh } from '@mui/icons-material';
import axios from 'axios';

interface Base64PDFViewerProps {
  pdfUrl: string;
  fileName?: string;
  onClose?: () => void;
}

/**
 * PDF-visare som använder Base64-kodad data för att visa PDF-filer direkt i webbläsaren
 * Detta är en mer robust lösning för miljöer där iframe/object/embed kan ha problem
 */
const Base64PDFViewer: React.FC<Base64PDFViewerProps> = ({
  pdfUrl,
  fileName = 'Document',
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  
  // Extrahera filnamnet från URL:en om det behövs
  const extractedFileName = pdfUrl.split('/').pop() || fileName;
  
  // Hämta PDF-filen som Base64
  useEffect(() => {
    const fetchBase64PDF = async () => {
      try {
        setLoading(true);
        
        // Använd base64-API:et istället för direktåtkomst
        if (extractedFileName.endsWith('.pdf')) {
          const base64Url = `/api/pdf-base64/${extractedFileName}`;
          
          const response = await axios.get(base64Url);
          if (response.data && response.data.base64_data) {
            setBase64Data(response.data.base64_data);
            setError(null);
          } else {
            setError('Kunde inte hämta PDF-data från servern.');
          }
        } else {
          setError('Filen är inte en giltig PDF.');
        }
      } catch (err) {
        console.error('Error fetching PDF as base64:', err);
        setError('Ett fel uppstod vid hämtning av PDF-filen.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBase64PDF();
  }, [extractedFileName, pdfUrl]);
  
  // Ladda om PDF-filen
  const reloadPdf = () => {
    setLoading(true);
    setError(null);
    setBase64Data(null);
    
    // Utlöser useEffect för att hämta PDF:en igen
  };
  
  // Öppna i ny flik (använder direkta PDF URL)
  const openInNewTab = () => {
    const directPdfUrl = `/api/pdf-direct/${extractedFileName}`;
    window.open(directPdfUrl, '_blank');
  };
  
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
          
          <Button 
            onClick={reloadPdf} 
            variant="outlined"
            size="sm"
            startDecorator={<Refresh fontSize="small" />}
          >
            Ladda om
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

      {/* PDF Viewer Area */}
      <Box sx={{ 
        flex: 1, 
        position: 'relative',
        overflow: 'auto',
        bgcolor: 'grey.100'
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
            <Button 
              onClick={openInNewTab}
              variant="solid"
              color="primary"
              startDecorator={<FullscreenOutlined />}
            >
              Öppna i ny flik
            </Button>
          </Box>
        )}
        
        {/* Visa PDF med Base64 data i en iframe */}
        {base64Data && !loading && !error && (
          <iframe
            src={base64Data}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title={fileName}
          />
        )}
      </Box>
    </Box>
  );
};

export default Base64PDFViewer;