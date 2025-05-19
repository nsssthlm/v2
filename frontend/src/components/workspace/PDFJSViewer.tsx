// Placeholder React component with modified baseUrl for PDF viewer.
import React from 'react';

function PDFJSViewer() {
  //const baseUrl = '/proxy/3000'; // Original baseUrl
  const baseUrl = 'http://0.0.0.0:8001/api/files/web'; // Modified baseUrl

  return (
    <div>
      <h1>PDF Viewer Placeholder</h1>
      <p>Base URL: {baseUrl}</p>
      {/* PDF Viewer Component will be implemented here */}
    </div>
  );
}

export default PDFJSViewer;