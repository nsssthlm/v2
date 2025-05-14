const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = 5000;

// Serve static files
app.use(express.static(__dirname));

// Setup proxy for API requests to backend Django server
app.use('/api', createProxyMiddleware({
  target: 'http://0.0.0.0:8001',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api', // No need to rewrite the path
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({
      error: 'Proxy error',
      message: 'Could not connect to backend server'
    });
  }
}));

// Route for the basic PDF viewer - redirects to dialog page
app.get('/', (req, res) => {
    res.redirect('/dialog');
});

// Route for the enhanced PDF dialog viewer
app.get('/dialog', (req, res) => {
    res.sendFile(path.join(__dirname, 'pdf-dialog-viewer.html'));
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`PDF Viewer server running at http://0.0.0.0:${port}`);
    console.log(`Enhanced PDF Dialog Viewer: http://0.0.0.0:${port}/dialog`);
});