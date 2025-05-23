// Konfiguration som används i både utveckling och produktion

// Funktion för att avgöra om vi kör i deployad miljö
export const isProduction = (): boolean => {
  const hostname = window.location.hostname;
  return !hostname.includes('replit.dev') && hostname.includes('.replit.app');
};

// Base API URL - använder alltid relativ URL för att fungera med Vite proxy och i produktionsmiljö
export const API_BASE_URL = '/api';

// API URL för direkt anslutning - anpassas utifrån miljö
export const DIRECT_API_URL = '/api';

// Förenklad konfiguration utan autentisering
export const getAuthHeader = () => {
  // Inga headers för autentisering
  return { };
};

// Standard headers för API-anrop
export const getStandardHeaders = () => {
  return {
    'Content-Type': 'application/json',
    ...getAuthHeader()
  };
};

// Andra konfigurationsvariabler kan läggas till här