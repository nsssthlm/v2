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

// Serve React Vite app if we have a build folder
const frontendBuildPath = path.join(__dirname, 'frontend', 'dist');
try {
  if (require('fs').existsSync(frontendBuildPath)) {
    app.use(express.static(frontendBuildPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    });
  }
} catch (err) {
  console.log('Frontend build not found, serving simple placeholder instead');
}

// Simple placeholder if no build is available
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ValvX Project</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: #f5f5f5;
          color: #333;
        }
        .container {
          text-align: center;
          padding: 2rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          max-width: 600px;
        }
        h1 {
          color: #2e7d32;
          margin-bottom: 1rem;
        }
        p {
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }
        .status {
          display: flex;
          justify-content: space-between;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #eee;
        }
        .status-item {
          text-align: center;
          flex: 1;
        }
        .status-dot {
          height: 10px;
          width: 10px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 5px;
        }
        .status-green {
          background-color: #4caf50;
        }
        .status-red {
          background-color: #f44336;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>ValvX Project Platform</h1>
        <p>
          Welcome to the ValvX Project Management Platform. This application provides a comprehensive
          set of tools for managing projects, tasks, and team collaboration.
        </p>
        <p>
          The backend API is up and running on port 8001. You can access the API documentation
          at <a href="/api/docs/" target="_blank">/api/docs/</a> when available.
        </p>
        
        <div class="status">
          <div class="status-item">
            <div><span class="status-dot status-green"></span> Backend API</div>
            <small>Running on port 8001</small>
          </div>
          <div class="status-item">
            <div><span class="status-dot status-red"></span> Frontend</div>
            <small>Build in progress</small>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});