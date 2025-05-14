const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');

const app = express();

// Proxy API requests to the Django backend
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:8001',
  changeOrigin: true
}));

// This is a workaround to generate a simple React-like index.html
// that will display the React app through our Express server
const generateReactPage = () => {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ValvX Project Management</title>
  <style>
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      height: 100vh;
      background-color: #f5f5f5;
    }
    #root {
      height: 100%;
    }
    .app-container {
      display: flex;
      height: 100%;
    }
    header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background-color: #2196f3;
      color: white;
      padding: 0.5rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 1000;
    }
    .sidebar {
      width: 250px;
      background-color: #fff;
      border-right: 1px solid #e0e0e0;
      height: 100%;
      padding-top: 64px;
      position: fixed;
      box-shadow: 2px 0 4px rgba(0,0,0,0.05);
    }
    .main-content {
      margin-left: 250px;
      flex: 1;
      padding: 80px 20px 20px;
      overflow-y: auto;
    }
    .nav-item {
      padding: 12px 20px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: background-color 0.2s;
    }
    .nav-item:hover {
      background-color: #f5f9ff;
    }
    .nav-item.active {
      background-color: #e3f2fd;
      border-left: 4px solid #2196f3;
    }
    .icon {
      margin-right: 12px;
      color: #757575;
    }
    .active .icon {
      color: #2196f3;
    }
    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 20px;
      margin-bottom: 20px;
    }
    .page-title {
      margin-top: 0;
      margin-bottom: 24px;
      color: #333;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    .stat-card {
      display: flex;
      flex-direction: column;
      padding: 16px;
    }
    .stat-title {
      color: #757575;
      font-size: 0.9rem;
      margin-bottom: 8px;
    }
    .stat-value {
      font-size: 1.8rem;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .stat-change {
      font-size: 0.8rem;
      display: flex;
      align-items: center;
    }
    .positive {
      color: #4caf50;
    }
    .negative {
      color: #f44336;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    th {
      font-weight: 600;
      color: #616161;
    }
    tr:hover {
      background-color: #f9f9f9;
    }
    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      text-align: center;
    }
    .status-todo {
      background-color: #e3f2fd;
      color: #2196f3;
    }
    .status-in-progress {
      background-color: #fff8e1;
      color: #ffa000;
    }
    .status-review {
      background-color: #e8f5e9;
      color: #4caf50;
    }
    .status-done {
      background-color: #eceff1;
      color: #607d8b;
    }
    .logo {
      font-weight: bold;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
    }
    .logo-icon {
      margin-right: 8px;
    }
    .header-actions {
      display: flex;
      align-items: center;
    }
    .header-actions > * {
      margin-left: 16px;
    }
    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #616161;
    }
  </style>
</head>
<body>
  <div id="root">
    <div class="app-container">
      <header>
        <div class="logo">
          <span class="logo-icon">⚙️</span> ValvX
        </div>
        <div class="header-actions">
          <div>🔔</div>
          <div>📩</div>
          <div class="user-avatar">AK</div>
        </div>
      </header>
      
      <div class="sidebar">
        <div class="nav-item active">
          <span class="icon">📊</span> Dashboard
        </div>
        <div class="nav-item">
          <span class="icon">📅</span> Calendar
        </div>
        <div class="nav-item">
          <span class="icon">📢</span> Notice Board
        </div>
        <div class="nav-item">
          <span class="icon">🗄️</span> Vault
        </div>
        <div class="nav-item">
          <span class="icon">👥</span> Team
        </div>
        <div class="nav-item">
          <span class="icon">⚙️</span> Settings
        </div>
      </div>
      
      <div class="main-content">
        <h1 class="page-title">Dashboard</h1>
        
        <div class="grid">
          <div class="card stat-card">
            <div class="stat-title">Active Projects</div>
            <div class="stat-value">12</div>
            <div class="stat-change positive">↑ 2 from last month</div>
          </div>
          
          <div class="card stat-card">
            <div class="stat-title">Tasks Completed</div>
            <div class="stat-value">74</div>
            <div class="stat-change positive">↑ 12 from last week</div>
          </div>
          
          <div class="card stat-card">
            <div class="stat-title">Team Members</div>
            <div class="stat-value">18</div>
            <div class="stat-change positive">↑ 3 new this month</div>
          </div>
          
          <div class="card stat-card">
            <div class="stat-title">Pending Approvals</div>
            <div class="stat-value">5</div>
            <div class="stat-change negative">↑ 2 since yesterday</div>
          </div>
        </div>
        
        <div class="card">
          <h2>Recent Tasks</h2>
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Assignee</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Update user authentication</td>
                <td>Security Upgrade</td>
                <td>John Smith</td>
                <td><div class="status-badge status-in-progress">In Progress</div></td>
                <td>May 15, 2025</td>
              </tr>
              <tr>
                <td>Design new dashboard</td>
                <td>UI Overhaul</td>
                <td>Emma Johnson</td>
                <td><div class="status-badge status-review">Review</div></td>
                <td>May 12, 2025</td>
              </tr>
              <tr>
                <td>Implement API endpoints</td>
                <td>Mobile App Integration</td>
                <td>David Miller</td>
                <td><div class="status-badge status-todo">To Do</div></td>
                <td>May 20, 2025</td>
              </tr>
              <tr>
                <td>Fix notification bug</td>
                <td>Bug Fixes</td>
                <td>Sarah Wilson</td>
                <td><div class="status-badge status-done">Done</div></td>
                <td>May 10, 2025</td>
              </tr>
              <tr>
                <td>Document API changes</td>
                <td>Documentation</td>
                <td>Alex Kim</td>
                <td><div class="status-badge status-in-progress">In Progress</div></td>
                <td>May 18, 2025</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="card">
          <h2>Project Overview</h2>
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Status</th>
                <th>Team</th>
                <th>Progress</th>
                <th>Deadline</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Security Upgrade</td>
                <td><div class="status-badge status-in-progress">In Progress</div></td>
                <td>5 members</td>
                <td>65%</td>
                <td>Jun 15, 2025</td>
              </tr>
              <tr>
                <td>UI Overhaul</td>
                <td><div class="status-badge status-in-progress">In Progress</div></td>
                <td>4 members</td>
                <td>80%</td>
                <td>May 30, 2025</td>
              </tr>
              <tr>
                <td>Mobile App Integration</td>
                <td><div class="status-badge status-todo">To Do</div></td>
                <td>6 members</td>
                <td>20%</td>
                <td>Jul 10, 2025</td>
              </tr>
              <tr>
                <td>Bug Fixes</td>
                <td><div class="status-badge status-review">Review</div></td>
                <td>3 members</td>
                <td>90%</td>
                <td>May 25, 2025</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Handle navigation
      const navItems = document.querySelectorAll('.nav-item');
      const pageTitle = document.querySelector('.page-title');
      const mainContent = document.querySelector('.main-content');
      
      navItems.forEach(item => {
        item.addEventListener('click', function() {
          // Remove active class from all nav items
          navItems.forEach(navItem => navItem.classList.remove('active'));
          
          // Add active class to the clicked item
          this.classList.add('active');
          
          // Get page name from the nav item text
          const pageName = this.textContent.trim();
          
          // Update page title
          pageTitle.textContent = pageName;
          
          // In a real app, we would load different content here
          // For now, we just update the title
          console.log('Navigating to ' + pageName);
        });
      });
    });
  </script>
</body>
</html>
  `;

  // Create a directory for our generated content
  const dir = path.join(__dirname, 'react-build');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  // Write the HTML file
  fs.writeFileSync(path.join(dir, 'index.html'), htmlContent);
}

// Generate the demo React page
generateReactPage();

// Serve static files from 'react-build' directory
app.use(express.static(path.join(__dirname, 'react-build')));

// Handle all routes by serving the index.html file (SPA approach)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'react-build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});