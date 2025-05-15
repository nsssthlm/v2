const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Proxy API requests to the Django backend
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:8001',
  changeOrigin: true,
  pathRewrite: { '^/api': '/api' }
}));

// Create routes for our demo
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'demo-frontend', 'dashboard.html'));
});

app.get('/calendar', (req, res) => {
  res.sendFile(path.join(__dirname, 'demo-frontend', 'calendar.html'));
});

app.get('/notice-board', (req, res) => {
  res.sendFile(path.join(__dirname, 'demo-frontend', 'notice-board.html'));
});

app.get('/vault', (req, res) => {
  res.sendFile(path.join(__dirname, 'demo-frontend', 'vault.html'));
});

// Serve static files
app.use(express.static(path.join(__dirname, 'demo-frontend')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});