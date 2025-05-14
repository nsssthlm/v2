import axios from 'axios';

// Function to dynamically determine the API URL based on the current environment
const getApiUrl = () => {
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:8001/api';
  }
  
  // For Replit - replace '00-' with '01-' in hostname to target backend
  const hostname = window.location.hostname;
  
  // We're in the Replit web editor preview
  if (hostname.includes('janeway.replit.dev')) {
    const parts = hostname.split('-');
    const replId = parts.slice(0, 3).join('-');
    return `https://${replId.replace('00-', '01-')}.${parts.slice(3).join('-')}/api`;
  }
  
  // We're deployed to replit.app domain
  if (hostname.includes('replit.app')) {
    return `https://${hostname.replace('00-', '01-')}/api`;
  }
  
  // Default fallback for other environments
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

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling common errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (refreshToken) {
          console.log('Attempting to refresh token');
          const response = await axios.post(`${API_URL}/token-refresh/`, {
            refresh: refreshToken,
          });
          
          console.log('Token refreshed successfully');
          // Get new access token
          const { access } = response.data;
          
          // Store the new token
          localStorage.setItem('access_token', access);
          
          // Update the header for the original request
          originalRequest.headers.Authorization = `Bearer ${access}`;
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and force login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        // Redirect to login (handled by components)
        window.dispatchEvent(new Event('auth:logout'));
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
