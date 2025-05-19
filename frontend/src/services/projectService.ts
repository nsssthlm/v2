import axios from 'axios';
import { API_BASE_URL, getStandardHeaders, getAuthHeader } from '../config';
import { Project } from '../contexts/ProjectContext';

// Interface för att skapa ett nytt projekt
export interface ProjectInput {
  name: string;
  description: string;
  start_date: string;
  end_date?: string; // Notera att detta är valfritt, så det kan vara undefined
}

/**
 * Service för att hantera projekt via backend API
 * Alla anrop inkluderar nu JWT-token för autentisering
 */
const projectService = {
  // Hämta alla projekt
  getAllProjects: async (): Promise<Project[]> => {
    try {
      console.log('Försöker hämta projekt från API');
      const headers = getAuthHeader();
      
      // Försöker först med anpassad endpoint
      try {
        const response = await axios.get(`${API_BASE_URL}/custom/projects`, { 
          headers,
          timeout: 5000 // Sätt en timeout på 5 sekunder
        });
        
        if (response.data && Array.isArray(response.data)) {
          console.log('Hittade projekt via API:', response.data);
          
          // Mappa om API-data till frontend-format
          const projects = response.data.map((item: any) => ({
            id: item.id.toString(),
            name: item.name,
            description: item.description || '',
            endDate: item.end_date || item.endDate || ''
          }));
          
          return projects;
        }
      } catch (apiError) {
        console.warn('Kunde inte hämta projekt från primär API-endpoint:', apiError);
      }
      
      // Försök med alternativ endpoint (core/project)
      try {
        const altResponse = await axios.get(`${API_BASE_URL}/core/projects/`, { 
          headers,
          timeout: 5000
        });
        
        if (altResponse.data && (Array.isArray(altResponse.data) || altResponse.data.results)) {
          const projectsData = Array.isArray(altResponse.data) ? altResponse.data : altResponse.data.results;
          console.log('Hittade projekt via alternativ API:', projectsData);
          
          // Mappa om API-data till frontend-format
          const projects = projectsData.map((item: any) => ({
            id: item.id.toString(),
            name: item.name,
            description: item.description || '',
            endDate: item.end_date || item.endDate || ''
          }));
          
          return projects;
        }
      } catch (altError) {
        console.warn('Kunde inte hämta projekt från alternativ API-endpoint:', altError);
      }
      
      // Om inget av ovanstående fungerar, returnera tom array
      console.warn('Inga API-endpoints svarar, returnerar tom array');
      return [];
    } catch (error) {
      console.error('Fel vid hämtning av projekt:', error);
      return [];
    }
  },
  
  // Skapa ett nytt projekt
  createProject: async (projectData: ProjectInput): Promise<Project | null> => {
    try {
      // Hämta CSRF-token från cookies för bättre autentisering
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return undefined;
      };
      
      const csrfToken = getCookie('csrftoken');
      console.log('CSRF-token för projektskapande:', csrfToken);
      
      const headers = {
        ...getStandardHeaders(),
        ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {})
      };
      
      console.log('Skapar projekt med URL:', `${API_BASE_URL}/api/custom/create-project`);
      console.log('Projekdata:', projectData);
      console.log('Headers:', headers);
      
      // Använd fetch istället för axios för att säkerställa att credentials skickas med
      const response = await fetch(`${API_BASE_URL}/api/custom/create-project`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {})
        },
        body: JSON.stringify(projectData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Projektskapande misslyckades med status:', response.status, errorText);
        throw new Error(`Kunde inte skapa projektet: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      
      // Mappa om API-svaret till frontend-format
      const createdProject: Project = {
        id: data.id.toString(),
        name: data.name,
        description: data.description || '',
        endDate: data.end_date || data.endDate || ''
      };
      
      // Skapa en standardmapp för projektet med direkt fetch-anrop
      try {
        // Skapa standardmappen direkt här för att använda samma sessionkontext
        const folderData = {
          name: 'Dokument',
          project: createdProject.id,
          parent: null,
          is_sidebar_item: true 
        };
        
        const folderResponse = await fetch(`${API_BASE_URL}/api/files/directories/`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {})
          },
          body: JSON.stringify(folderData)
        });
        
        if (folderResponse.ok) {
          const folderData = await folderResponse.json();
          console.log('Standardmapp skapad direkt:', folderData);
        } else {
          const folderErrorText = await folderResponse.text();
          console.warn('Kunde inte skapa standardmapp direkt:', folderResponse.status, folderErrorText);
        }
      } catch (folderError) {
        console.warn('Kunde inte skapa standardmapp:', folderError);
      }
      
      return createdProject;
    } catch (error) {
      console.error('Fel vid skapande av projekt:', error);
      return null;
    }
  },
  
  // Skapa en standardmapp för ett projekt
  createDefaultFolder: async (projectId: string): Promise<any> => {
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
      
      // Använd både auth-headers och CSRF-token för säkerställa autentisering
      const headers = {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
        ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {})
      };
      
      // Förbättrad loggning för debugging
      console.log('Skapar standardmapp för projekt:', projectId);
      
      const folderData = {
        name: 'Dokument',
        project: projectId,
        parent: null,
        is_sidebar_item: true, // Använd korrekt fältnamn is_sidebar_item (inte is_sidebar)
      };
      
      // Använd fetch istället för axios för konsekvent hantering av credentials
      const response = await fetch(`${API_BASE_URL}/api/files/directories/`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(folderData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Mappskapande misslyckades med status:', response.status, errorText);
        throw new Error(`Fel vid skapande av mapp: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      
      console.log('Standardmapp skapad:', data);
      return data;
    } catch (error) {
      console.error('Fel vid skapande av standardmapp:', error);
      throw error;
    }
  }
};

export default projectService;