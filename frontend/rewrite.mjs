import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files directly
app.use(express.static(path.join(__dirname, 'dist')));

// Proxy API requests to the backend
app.use(
  '/api',
  createProxyMiddleware({
    target: 'http://localhost:8001',
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying API request to: ${req.url}`);
    }
  })
);

// Handle all routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start proxy server on port 5000
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});