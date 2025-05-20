const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy för API-anrop, använd samma URL som i vite.config.ts
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8001',
      changeOrigin: true,
    })
  );
  
  // Specifik proxy för PDF-filer för att lösa Mixed Content problem
  app.use(
    '/pdf-proxy',
    createProxyMiddleware({
      target: 'http://localhost:8001',
      changeOrigin: true,
      pathRewrite: {
        '^/pdf-proxy': '', // Ta bort /pdf-proxy prefix från URL
      },
    })
  );
};