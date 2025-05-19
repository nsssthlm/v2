// Base API URL - använder alltid relativ URL för att fungera med Vite proxy och i produktionsmiljö
export const API_BASE_URL = '/api';

// API URL för direkt anslutning (används för debugging)
// Denna fungerar för alla miljöer: localhost, replit preview och deployed app
export const DIRECT_API_URL = window.location.origin + '/api';

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