// API och konfigurationsvariabler för applikationen

// Basadress för API-anrop - använd relativ URL för att undvika mixed content-problem
export const API_BASE_URL = '';

// Direktlänkar för PDF-visning - använd relativ URL för att fungera både på HTTP och HTTPS
export const DIRECT_API_URL = '';

// Funktion för att hämta CSRF-token från cookies
export const getCsrfToken = () => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; csrftoken=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
};

// Hämta standardheaders för API-anrop
export const getStandardHeaders = () => {
  const csrfToken = getCsrfToken();
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {})
  };
};

// Hämta autentiseringsheaders för säkra API-anrop
export const getAuthHeader = () => {
  // Försök hämta token från localStorage (föredragen för persistens mellan sessioner)
  const token = localStorage.getItem('jwt_token') || 
               localStorage.getItem('auth_token') || 
               localStorage.getItem('token');
  
  const csrfToken = getCsrfToken();
  
  // Spara/synka token till sessionStorage för att förhindra utloggning vid projektbyte
  if (token && !sessionStorage.getItem('current_token')) {
    sessionStorage.setItem('current_token', token);
  }
  
  // Om det finns en token i sessionStorage men inte i localStorage, synka den
  const sessionToken = sessionStorage.getItem('current_token');
  if (sessionToken && !token) {
    localStorage.setItem('jwt_token', sessionToken);
  }
  
  // Returnera headers med autentiseringsinformation
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token || sessionToken ? { 'Authorization': `Bearer ${token || sessionToken}` } : {}),
    ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {})
  };
};

// API-sökvägar
export const API_PATHS = {
  LOGIN: '/api/token/',
  REFRESH_TOKEN: '/api/token/refresh/',
  PROJECTS: '/api/custom/projects/',
  FILES: '/api/files/',
  DIRECTORIES: '/api/files/directories/',
  WEB_FILES: '/api/files/web/'
};

// Maximalt antal objekt per sida för pagination
export const ITEMS_PER_PAGE = 10;

// Standardparametrar för PDF-visning
export const PDF_VIEWER_CONFIG = {
  SCALE: 1.0,
  ROTATION: 0,
  DEFAULT_PAGE: 1
};

// Tillåtna filtyper för uppladdning
export const ALLOWED_FILE_TYPES = {
  DOCUMENTS: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
  IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'],
  AUTOCAD: ['.dwg', '.dxf'],
  BIM: ['.rvt', '.ifc']
};