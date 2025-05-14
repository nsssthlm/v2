const express = require('express');
const path = require('path');

const app = express();
const port = 5000;

// Serve static files
app.use(express.static(__dirname));

// Route for the PDF viewer
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pdf-viewer-modal.html'));
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`PDF Viewer server running at http://0.0.0.0:${port}`);
});