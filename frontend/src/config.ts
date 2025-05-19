// API och konfigurationsvariabler för applikationen

// Basadress för API-anrop - använd relativ URL för att undvika mixed content-problem
export const API_BASE_URL = '';

// Direktlänkar för PDF-visning - använd relativ URL för att fungera både på HTTP och HTTPS
export const DIRECT_API_URL = '';

// Hämta standardheaders för API-anrop
export const getStandardHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

// Hämta autentiseringsheaders för säkra API-anrop
export const getAuthHeader = () => {
  // Försök hämta token från localStorage
  const token = localStorage.getItem('token');
  
  // Retunera headers med eller utan auth-token
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
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