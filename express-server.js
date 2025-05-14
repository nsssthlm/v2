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
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
          color: #333;
          display: flex;
          height: 100vh;
        }
        .sidebar {
          width: 250px;
          background-color: #1a237e; /* Indigo 900 */
          color: white;
          height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 1rem 0;
          position: fixed;
          left: 0;
          top: 0;
          box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
        }
        .main-content {
          margin-left: 250px;
          padding: 2rem;
          width: calc(100% - 250px);
          min-height: 100vh;
        }
        .sidebar-header {
          padding: 0 1.5rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 1.5rem;
        }
        .sidebar-header h2 {
          color: #fff;
          font-size: 1.5rem;
          font-weight: 600;
          display: flex;
          align-items: center;
        }
        .sidebar-header h2 .logo-icon {
          margin-right: 10px;
          font-size: 1.8rem;
        }
        .nav-item {
          padding: 0.8rem 1.5rem;
          display: flex;
          align-items: center;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .nav-item:hover, .nav-item.active {
          background-color: rgba(255, 255, 255, 0.1);
          color: white;
        }
        .nav-item .icon {
          margin-right: 10px;
          font-size: 1.2rem;
          width: 24px;
          text-align: center;
        }
        .sidebar-footer {
          margin-top: auto;
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
        }
        .container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          margin-bottom: 2rem;
        }
        h1 {
          color: #1a237e;
          margin-bottom: 1rem;
          font-size: 2rem;
        }
        h3 {
          color: #1a237e;
          margin: 1.5rem 0 1rem;
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
        .status-yellow {
          background-color: #ff9800;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1.5rem;
        }
        .stat-card {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 1.5rem;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .stat-card h4 {
          color: #555;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }
        .stat-card .value {
          font-size: 2rem;
          font-weight: bold;
          color: #1a237e;
        }
      </style>
    </head>
    <body>
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2><span class="logo-icon">⚡</span> ValvX</h2>
        </div>
        
        <a href="#" class="nav-item active">
          <span class="icon">📊</span>
          <span>Dashboard</span>
        </a>
        <a href="#" class="nav-item">
          <span class="icon">📅</span>
          <span>Calendar</span>
        </a>
        <a href="#" class="nav-item">
          <span class="icon">📌</span>
          <span>Noticeboard</span>
        </a>
        <a href="#" class="nav-item">
          <span class="icon">📁</span>
          <span>Vault</span>
        </a>
        <a href="#" class="nav-item">
          <span class="icon">👥</span>
          <span>Team</span>
        </a>
        <a href="#" class="nav-item">
          <span class="icon">⚙️</span>
          <span>Settings</span>
        </a>
        
        <div class="sidebar-footer">
          &copy; 2025 ValvX Platform
        </div>
      </aside>
      
      <!-- Main Content -->
      <main class="main-content">
        <div class="container">
          <h1>Dashboard</h1>
          <p>
            Welcome to the ValvX Project Management Platform. This application provides a comprehensive
            set of tools for managing projects, tasks, and team collaboration.
          </p>
          
          <div class="stats-grid">
            <div class="stat-card">
              <h4>Active Projects</h4>
              <div class="value">12</div>
            </div>
            <div class="stat-card">
              <h4>Open Tasks</h4>
              <div class="value">48</div>
            </div>
            <div class="stat-card">
              <h4>Team Members</h4>
              <div class="value">32</div>
            </div>
            <div class="stat-card">
              <h4>Upcoming Deadlines</h4>
              <div class="value">7</div>
            </div>
          </div>
        </div>
        
        <div class="container">
          <h3>System Status</h3>
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
              <div><span class="status-dot status-yellow"></span> Frontend</div>
              <small>Temporary version active</small>
            </div>
          </div>
        </div>
      </main>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});