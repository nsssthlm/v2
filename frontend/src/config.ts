// Base API URL - använder relativ URL för att fungera med Vite proxy
export const API_BASE_URL = '/api';

// API URL för direkt anslutning (används för debugging)
// Använder både den lokala adressen och Replit URL-format för bättre kompabilitet
export const DIRECT_API_URL = window.location.hostname.includes('replit') 
  ? `https://${window.location.hostname.replace('00-', '')}/api` 
  : 'http://localhost:8000/api';

// Andra konfigurationsvariabler kan läggas till här