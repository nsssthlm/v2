// Baskonfiguration för frontend
// API_BASE_URL används för att peka på rätt backend

// I produktion kommer URL:en att vara en absolut URL till backend-servern
// I utveckling använder vi en relativ URL eftersom både frontend och backend körs på samma domän
export const API_BASE_URL = '';

// WebsocketURL används för att ansluta till WebSocket-servern
export const WEBSOCKET_URL = window.location.protocol === 'https:' 
  ? `wss://${window.location.host}/ws` 
  : `ws://${window.location.host}/ws`;