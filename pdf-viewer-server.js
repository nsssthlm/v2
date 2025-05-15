const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'pdf-viewer-session-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 } // 1 hour
}));

// Serve static files
app.use(express.static(__dirname));

// Intern temporär databas för användare när backenden inte är tillgänglig
const users = [
  { id: 1, username: 'projectleader@example.com', password: '123456', name: 'Project Leader' }
];

// In-memory PDF storage
const pdfFiles = [
  { 
    id: 'pdf_1747231245129',
    filename: 'Namnlös PDF',
    description: 'Automatiskt sparad PDF',
    versionNumber: 1,
    uploadedBy: 'Du',
    uploaded: '14 maj 2025 16:00',
    fileUrl: '/uploads/test.pdf'
  },
  { 
    id: 'pdf_1747231513094',
    filename: 'AAAAExempel på ritningar',
    description: '--',
    versionNumber: 1,
    uploadedBy: 'Du',
    uploaded: '14 maj 2025 17:21',
    fileUrl: '/uploads/test.pdf'
  },
  { 
    id: 'pdf_1747232594208',
    filename: 'BEAM Guidelines 2.0 (1)',
    description: '--',
    versionNumber: 1,
    uploadedBy: 'Du',
    uploaded: '14 maj 2025 17:20',
    fileUrl: '/uploads/test.pdf'
  }
];

// Basic authentication middleware
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    // Lagra användarinformation i session
    req.session.user = { id: user.id, username: user.username, name: user.name };
    res.status(200).json({ success: true, user: { username: user.username, name: user.name } });
  } else {
    res.status(401).json({ success: false, message: 'Ogiltiga inloggningsuppgifter' });
  }
});

// Get current user
app.get('/api/user', (req, res) => {
  if (req.session.user) {
    res.status(200).json({ username: req.session.user.username, name: req.session.user.name });
  } else {
    res.status(401).json({ message: 'Inte inloggad' });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.status(200).json({ success: true });
});

// PDF List endpoint
app.get('/api/pdf/list', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Inte inloggad' });
  }
  
  res.status(200).json(pdfFiles);
});

// För att testa och se om proxyn fungerar - vi skickar fortfarande vissa anrop till backend
app.use('/api/backend', createProxyMiddleware({
  target: 'http://0.0.0.0:8001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/backend': '/api', 
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