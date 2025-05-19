import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Initialize PDF.js worker with local worker (don't use CDN which can be blocked)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

interface SimplePDFViewerProps {
  pdfUrl: string;
  fileName?: string;
  projectId?: string | number | null;
  onClose?: () => void;
}

export const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ 
  pdfUrl, 
  fileName = 'Document', 
  projectId = null, 
  onClose 
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Log the PDF URL for debugging
    console.log('Attempting to load PDF from URL:', pdfUrl);
    setLoading(true);
    setError(null);
  }, [pdfUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setLoading(false);
    setError(`Failed to load PDF. Error: ${error.message}`);
  };

  const zoomIn = () => setScale(prevScale => Math.min(3.0, prevScale + 0.2));
  const zoomOut = () => setScale(prevScale => Math.max(0.5, prevScale - 0.2));
  const nextPage = () => setPageNumber(prevPage => Math.min(numPages || 1, prevPage + 1));
  const prevPage = () => setPageNumber(prevPage => Math.max(1, prevPage - 1));

  return (
    <div className="pdf-viewer-container" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="pdf-viewer-header" style={{ padding: '10px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between' }}>
        <div className="pdf-info">
          <h3 style={{ margin: 0 }}>{fileName}</h3>
          <span>
            Page {pageNumber} of {numPages || '?'}
          </span>
        </div>
        <div className="pdf-controls">
          <button onClick={prevPage} disabled={pageNumber <= 1}>Previous</button>
          <button onClick={nextPage} disabled={!numPages || pageNumber >= numPages}>Next</button>
          <button onClick={zoomOut}>Zoom Out</button>
          <button onClick={zoomIn}>Zoom In</button>
          {onClose && <button onClick={onClose}>Close</button>}
        </div>
      </div>

      <div className="pdf-content" style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
        {loading && <div className="loading">Loading PDF...</div>}
        {error && (
          <div className="error-container" style={{ padding: '20px', color: 'red' }}>
            <h4>Error Loading PDF</h4>
            <p>{error}</p>
            <p>URL attempted: {pdfUrl}</p>
          </div>
        )}
        
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<div>Loading document...</div>}
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale}
            renderAnnotationLayer={true}
            renderTextLayer={true}
          />
        </Document>
      </div>
    </div>
  );
};

export default SimplePDFViewer;