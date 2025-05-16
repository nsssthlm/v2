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
  // Hämta alla directorys för sidebar, filtrerat per projekt
  getSidebarDirectories: async (projectId?: string): Promise<ApiDirectory[]> => {
    try {
      // Skapa params objekt med is_sidebar och eventuellt project
      const params: Record<string, string> = { is_sidebar: 'true' };
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

  // Skapa ett nytt directory, knutet till ett specifikt projekt
  createDirectory: async (directory: DirectoryInput, projectId?: string): Promise<ApiDirectory> => {
    try {
      // Om projektID skickas med, lägg till det i directory-objektet
      const dirWithProject = { 
        ...directory,
        // Konvertera projektId till number eftersom API:et förväntar sig number
        ...(projectId && { project: parseInt(projectId, 10) })
      };
      
      console.log('Skapar mapp med data:', dirWithProject);
      
      // Försök först med vanlig proxy-anslutning
      try {
        const response = await axios.post(`${API_BASE_URL}/files/directories/`, dirWithProject);
        console.log('Mapp skapad via API_BASE_URL:', response.data);
        return response.data;
      } catch (proxyError: any) {
        console.warn('Kunde inte skapa mapp via proxy, försöker med direkt anslutning', proxyError);
        
        // Om det misslyckas, försök med direkt anslutning
        const directResponse = await axios.post(`${DIRECT_API_URL}/files/directories/`, dirWithProject, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        console.log('Mapp skapad via DIRECT_API_URL:', directResponse.data);
        return directResponse.data;
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