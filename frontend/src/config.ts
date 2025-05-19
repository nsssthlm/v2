// Konfiguration som används i både utveckling och produktion

// Funktion för att avgöra om vi kör i deployad miljö
export const isProduction = (): boolean => {
  const hostname = window.location.hostname;
  return !hostname.includes('replit.dev') && hostname.includes('.replit.app');
};

// Base API URL - använder alltid relativ URL för att fungera med Vite proxy och i produktionsmiljö
export const API_BASE_URL = '/api';

// API URL för direkt anslutning - anpassas utifrån miljö
export const DIRECT_API_URL = (() => {
  if (isProduction()) {
    // I produktion: använd "/api" som har konfigurerats i Replit deployment
    return '/api';
  } else {
    // I utvecklingsmiljö: använd relativ URL som hanteras via Vite proxy
    return '/api';
  }
})();

// JWT token helpers - för att hantera autentisering konsekvent
export const getAuthHeader = () => {
  const token = localStorage.getItem('jwt_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Standard headers för API-anrop
export const getStandardHeaders = () => {
  return {
    'Content-Type': 'application/json',
    ...getAuthHeader()
  };
};

// Andra konfigurationsvariabler kan läggas till här