const express = require('express');
const path = require('path');

const app = express();

// Serve the static files from the Vite dev server
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Proxy API requests to backend
app.use('/api', (req, res) => {
  res.redirect(`http://localhost:8001${req.path}`);
});

// Start React app in Vite dev mode using child process
const { spawn } = require('child_process');
const vite = spawn('cd frontend && npm run dev', { shell: true });

vite.stdout.on('data', (data) => {
  console.log(`Vite output: ${data}`);
});

vite.stderr.on('data', (data) => {
  console.error(`Vite error: ${data}`);
});

// Serve React app in iframe to avoid CORS issues
app.get('/', (req, res) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ValvX Project Management</title>
      <style>
        body, html {
          margin: 0;
          padding: 0;
          height: 100%;
          overflow: hidden;
        }
        iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
      </style>
    </head>
    <body>
      <iframe src="http://localhost:5000" allowfullscreen></iframe>
    </body>
    </html>
  `;
  res.send(htmlContent);
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});