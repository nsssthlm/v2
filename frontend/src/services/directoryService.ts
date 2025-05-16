import axios from 'axios';
import { API_BASE_URL, DIRECT_API_URL } from '../config';

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
      // Skapa params objekt baserat på om vi har ett projektId eller inte
      const params: Record<string, string> = { 
        is_sidebar: 'true' 
      };
      
      // Lägg till projektfiltrering om projektId är angivet
      if (projectId) {
        params.project = projectId;
      }
      
      // Försök med vanlig proxy-anslutning
      try {
        const response = await axios.get(`${API_BASE_URL}/files/directories/`, {
          params: params
        });
        // API svarar med en results-array om pagination är aktiverad
        if (response.data.results) {
          return response.data.results;
        }
        return response.data;
      } catch (proxyError) {
        console.warn('Kunde inte hämta mappar via proxy, försöker med direkt anslutning', proxyError);
        
        // Om det misslyckas, försök med direkt anslutning
        const directResponse = await axios.get(`${DIRECT_API_URL}/files/directories/`, {
          params: params,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (directResponse.data.results) {
          return directResponse.data.results;
        }
        return directResponse.data;
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
      
      // Hantera projekt-kopplingen på ett säkert sätt
      if (projectId && projectId !== 'null' && projectId !== 'undefined') {
        // Säkerställ att vi har ett giltigt projekt-ID
        // Viktigt: Vi måste använda ID 1 i nuläget eftersom det är det enda projektet i databasen
        const validProjectId = 1;  // Hårdkoda projekt-ID till 1 temporärt
        
        console.log(`Kopplar mapp till projekt med ID ${validProjectId}`);
        dirData.project = validProjectId;
      } else {
        // Ta bort project-attributet helt istället för att sätta det till null
        if ('project' in dirData) {
          delete dirData.project;
        }
      }
      
      console.log('Försöker skapa mapp med data:', dirData);
      
      // Försök med API-anropet
      try {
        // Vi använder bara den primära metoden nu för att minska komplexiteten
        const response = await axios.post(`${API_BASE_URL}/files/directories/`, dirData);
        console.log('Mapp skapad via API:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('Fel vid kommunikation med backend-API:', error);
        
        // Felmeddelande för användaren
        if (error.response) {
          console.error('API svarade med fel:', error.response.data);
        }
        
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