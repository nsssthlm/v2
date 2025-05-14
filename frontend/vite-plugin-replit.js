// Custom Vite plugin for Replit compatibility
export default function replitCompat() {
  return {
    name: 'vite-plugin-replit-compat',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Allow all hosts for Replit environment
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
        
        // Skip CORS preflight OPTIONS requests
        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          return res.end();
        }
        
        next();
      });
    }
  };
}