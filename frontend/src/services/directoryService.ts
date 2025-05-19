import axios from 'axios';
import { API_BASE_URL, DIRECT_API_URL } from '../config';

// Cache för att spara hämtad data
const directoryCache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_EXPIRY = 5000; // Cache-livslängd i millisekunder (5 sekunder) - kortare cache för att säkerställa aktuell data

// Interface för Directory/Filsystemsobjekt
export interface ApiDirectory {
  id: number;
  name: string;
  slug: string | null;
  parent: number | null;
  project: number | null;
  type: string;
  is_sidebar_item: boolean;
  created_at: string;
  updated_at: string;
}

// Interface för att skapa/uppdatera Directory
export interface DirectoryInput {
  name: string;
  parent?: number | null;
  project?: number | null;
  type?: string;
  is_sidebar_item?: boolean;
}

// Service för att hantera directories (mappar) via API
const directoryService = {
  // Hämta alla directorys för sidebar, filtrerade på projekt
  getSidebarDirectories: async (projectId?: string): Promise<ApiDirectory[]> => {
    try {
      // Validera projekt-ID först - bara numeriska värden fungerar med backend
      let validProjectId = projectId;
      
      // Om det är ett icke-numeriskt ID, konvertera det till ett giltigt ID
      if (projectId && isNaN(parseInt(projectId, 10))) {
        console.warn('Ogiltigt projekt-ID format i getSidebarDirectories:', projectId);
        // Använd fallback till projekt 1 (första projektet) - detta är viktigt för kompatibilitet med backend
        validProjectId = '1';
      }
      
      // Skapa params objekt baserat på om vi har ett projektId eller inte
      const params: Record<string, string> = { 
        is_sidebar: 'true' 
      };
      
      // Lägg till projektfiltrering om projektId är angivet och giltigt
      if (validProjectId) {
        params.project = validProjectId;
      }
      
      // Skapa cache-nyckel baserat på parametrarna
      const cacheKey = `sidebar_directories_${JSON.stringify(params)}`;
      
      // Kontrollera om vi har aktuell data i cachen
      const cachedData = directoryCache[cacheKey];
      const now = Date.now();
      
      if (cachedData && (now - cachedData.timestamp < CACHE_EXPIRY)) {
        console.log('Hämtar mappdata från cache för projekt:', validProjectId);
        return cachedData.data;
      }
      
      // Skapa en tom array istället för dummydata, enligt användarens önskemål ska inga standardmappar visas
      const fallbackData = [];
      
      // Försök med vanlig proxy-anslutning
      try {
        console.log('Hämtar mappdata från API för projekt:', validProjectId);
        
        // Sätta specifika headers för att säkerställa att vi får JSON
        // Korrekt URL-struktur som matchar backend DirectoryViewSet
        // Baserat på faktiska tester är korrekt URL /api/files/directories/
        const response = await axios.get(`${API_BASE_URL}/api/files/directories/`, {
          params: params,
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          // Öka timeout för att ge servern mer tid att svara
          timeout: 5000
        });
        
        // Kontrollera att svaret är JSON genom att kontrollera typen
        if (typeof response.data === 'string') {
          console.warn('API returnerade en sträng istället för JSON, använder fallback-data');
          return fallbackData;
        }
        
        let data;
        // API svarar med en results-array om pagination är aktiverad
        if (response.data && response.data.results && Array.isArray(response.data.results)) {
          data = response.data.results;
        } else if (Array.isArray(response.data)) {
          data = response.data;
        } else {
          console.warn('API returnerade oväntad datastruktur, använder fallback-data');
          return fallbackData;
        }
        
        // Om data är en tom array, använd fallback-data för att visa något i UI
        if (data.length === 0) {
          console.log('API returnerade en tom array, använder fallback-data');
          data = fallbackData;
        }
        
        // Spara i cache
        directoryCache[cacheKey] = {
          data,
          timestamp: now
        };
        
        return data;
      } catch (proxyError) {
        console.warn('Kunde inte hämta mappar via proxy, använder fallback-data', proxyError);
        
        // Returnera fallback-data istället för att försöka med en till anslutning som troligen också misslyckas
        return fallbackData;
      }
    } catch (error) {
      console.error('Error fetching sidebar directories:', error);
      return [];
    }
  },

  // Hämta ett directory med ID
  getDirectory: async (id: number): Promise<ApiDirectory | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/files/directories/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching directory with id ${id}:`, error);
      return null;
    }
  },

  // Skapa ett nytt directory med koppling till aktuellt projekt
  createDirectory: async (directory: DirectoryInput, projectId?: string): Promise<ApiDirectory> => {
    try {
      // Skapa en kopia av directory-objektet för att inte modifiera originalet
      let dirData = { ...directory };
      
      // Hantera projekt-kopplingen dynamiskt baserat på vilket projekt som är aktivt
      if (projectId && projectId !== 'null' && projectId !== 'undefined') {
        try {
          // Konvertera projektet-ID till ett nummer och använd det direkt
          const currentProjectId = parseInt(projectId, 10);
          
          // Validera att vi har ett giltigt projekt-ID som är större än 0
          if (!isNaN(currentProjectId) && currentProjectId > 0) {
            console.log(`Kopplar mapp till aktuellt projekt med ID ${currentProjectId}`);
            dirData.project = currentProjectId;
          } else {
            // Fallback om projekt-ID är ogiltigt
            console.warn('Ogiltigt projekt-ID:', projectId);
            dirData.project = 1; // Använd projekt 1 som fallback
          }
        } catch (error) {
          console.error('Kunde inte tolka projekt-ID:', projectId);
          // Fallback till projekt 1 om vi inte kan tolka ID:et
          dirData.project = 1;
        }
      } else {
        // Ta bort project-attributet helt istället för att sätta det till null
        if ('project' in dirData) {
          delete dirData.project;
        }
      }
      
      console.log('Försöker skapa mapp med data:', dirData);
      
      // Försök med API-anropet
      try {
        // Hämta CSRF-token från cookies
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift();
          return undefined;
        };
        
        const csrfToken = getCookie('csrftoken');
        console.log('CSRF-token för mappskapande:', csrfToken);
        
        // Använd fetch med credentials och CSRF-token för att säkerställa att autentiseringen fungerar
        console.log('Skapar mapp med URL:', `${API_BASE_URL}/api/files/directories/`);
        
        const response = await fetch(`${API_BASE_URL}/api/files/directories/`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {})
          },
          body: JSON.stringify(dirData)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Mappskapande misslyckades med status:', response.status, errorText);
          throw new Error(`Kunde inte skapa mappen: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Mapp skapad via API:', data);
        return data;
      } catch (error: any) {
        console.error('Fel vid kommunikation med backend-API:', error);
        
        // Felmeddelande för användaren
        console.error('API svarade med fel:', error.message || 'Okänt fel');
        
        // Returnera förkastningen för att hantera i UI
        throw error;
      }
    } catch (error: any) {
      console.error('Fel vid skapande av mapp:', error);
      // För att underlätta debugging - visa mer detaljer i konsollen
      if (error.response) {
        console.error('API response data:', error.response.data);
        console.error('API response status:', error.response.status);
      }
      throw error; // Kasta vidare felet så att komponenten kan hantera det
    }
  },

  // Uppdatera ett directory
  updateDirectory: async (id: number, directory: DirectoryInput): Promise<ApiDirectory | null> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/files/directories/${id}/`, directory);
      return response.data;
    } catch (error) {
      console.error(`Error updating directory with id ${id}:`, error);
      return null;
    }
  },

  // Ta bort ett directory
  deleteDirectory: async (id: number): Promise<boolean> => {
    try {
      await axios.delete(`${API_BASE_URL}/files/directories/${id}/`);
      return true;
    } catch (error) {
      console.error(`Error deleting directory with id ${id}:`, error);
      return false;
    }
  }
};

export default directoryService;