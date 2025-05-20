import axios from 'axios';

// Function to dynamically determine the API URL based on the current environment
const getApiUrl = () => {
  // In development on localhost
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:8001/api';
  }
  
  // For Replit environment, use the relative API path
  // This is the simplest and most reliable approach in Replit's proxied env
  return '/api';
};

// Get the API_URL using our dynamic function
const API_URL = getApiUrl();

console.log('Using API URL:', API_URL);

// Create an axios instance with defaults
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Enkel konfiguration utan autentisering eller token
api.interceptors.request.use(
  (config) => {
    // Inga headers för autentisering
    return config;
  },
  (error) => Promise.reject(error)
);

// Enkel felhantering utan token-hantering
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API-fel:', error.message);
    return Promise.reject(error);
  }
);

export default api;
