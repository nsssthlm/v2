import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/joy';

interface IFramePDFViewerProps {
  pdfUrl: string;
  fileName?: string;
  projectId?: string | number | null;
  onClose?: () => void;
}

/**
 * A simple PDF viewer that uses an iframe to display PDFs
 * This is more reliable than PDF.js in certain environments
 */
const IFramePDFViewer: React.FC<IFramePDFViewerProps> = ({
  pdfUrl,
  fileName = 'Document',
  projectId = null,
  onClose
}) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    // Log for debugging
    console.log('IFrame PDF Viewer - Loading PDF from URL:', pdfUrl);
  }, [pdfUrl]);

  const handleIframeLoad = () => {
    setLoading(false);
    // Check if the iframe loaded successfully
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        // If we can access contentWindow, it loaded successfully
        setError(null);
      }
    } catch (err) {
      console.error('Error checking iframe content:', err);
    }
  };

  const handleIframeError = () => {
    setLoading(false);
    setError('Failed to load PDF. The file may not exist or you may not have permission to view it.');
  };

  // Prepare URL with authentication token
  const token = localStorage.getItem('access_token');
  const finalUrl = pdfUrl.includes('?') 
    ? `${pdfUrl}&token=${token}` 
    : `${pdfUrl}?token=${token}`;
    
  // Create an object URL for direct file access
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);
  
  // Fetch the PDF file and create an object URL for direct access
  React.useEffect(() => {
    const fetchPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch the PDF file with authentication
        const response = await fetch(finalUrl, {
          headers: {
            'Accept': 'application/pdf',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to load PDF: ${response.status} ${response.statusText}`);
        }
        
        // Get the PDF as a blob
        const pdfBlob = await response.blob();
        
        // Create an object URL from the blob
        const url = URL.createObjectURL(pdfBlob);
        setObjectUrl(url);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching PDF:', err);
        setError(err instanceof Error ? err.message : 'Failed to load PDF');
        setLoading(false);
      }
    };
    
    fetchPdf();
    
    // Clean up the object URL when the component unmounts
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [pdfUrl, token, finalUrl]);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      width: '100%' 
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: 2,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography level="h4">{fileName}</Typography>
        {onClose && (
          <button onClick={onClose}>Close</button>
        )}
      </Box>
      
      <Box sx={{ 
        flex: 1, 
        position: 'relative',
        overflow: 'hidden'
      }}>
        {loading && (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2
          }}>
            <CircularProgress />
          </Box>
        )}
        
        {error ? (
          <Box sx={{ 
            p: 3, 
            textAlign: 'center',
            color: 'danger.500'
          }}>
            <Typography level="h4">Error Loading PDF</Typography>
            <Typography>{error}</Typography>
            <Box sx={{ mt: 2 }}>
              <Typography level="body-sm">
                You can try opening the PDF directly:
                <a 
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginLeft: 5, color: 'blue', textDecoration: 'underline' }}
                >
                  Open {fileName} in new tab
                </a>
              </Typography>
            </Box>
          </Box>
        ) : objectUrl ? (
          <iframe
            ref={iframeRef}
            src={objectUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={fileName}
          />
        ) : null}
      </Box>
    </Box>
  );
};

export default IFramePDFViewer;