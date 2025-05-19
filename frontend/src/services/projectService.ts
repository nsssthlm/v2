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
      
      // Försöker först med korrekta API-endpointen
      try {
        // Använd fetch istället för axios för att garantera att sessionen skickas med
        const response = await fetch(`${API_BASE_URL}/api/custom/projects`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            console.log('Hittade projekt via API:', data);
            
            // Mappa om API-data till frontend-format
            const projects = data.map((item: any) => ({
              id: item.id.toString(),
              name: item.name,
              description: item.description || '',
              endDate: item.end_date || item.endDate || ''
            }));
            
            return projects;
          }
        } else {
          console.warn('Kunde inte hämta projekt från primär API-endpoint:', response.status);
        }
      } catch (apiError) {
        console.warn('Kunde inte hämta projekt från primär API-endpoint:', apiError);
      }
      
      // Försök med alternativ endpoint (core/project)
      try {
        const altResponse = await fetch(`${API_BASE_URL}/api/core/projects/`, { 
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        });
        
        if (altResponse.ok) {
          const altData = await altResponse.json();
          const projectsData = Array.isArray(altData) ? altData : 
                              (altData.results && Array.isArray(altData.results)) ? altData.results : null;
          
          if (projectsData) {
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
      
      // Ta bort automatisk skapande av standardmapp enligt användarens önskemål
      // Nya projekt ska inte ha några mappar som standard, användaren skapar själv mappar vid behov
      console.log('Nytt projekt skapat utan standardmappar enligt krav');
      
      return createdProject;
    } catch (error) {
      console.error('Fel vid skapande av projekt:', error);
      return null;
    }
  },
  
  // Metod för att skapa mappar i projekt (ska endast användas när användaren explicit ber om det)
  createFolder: async (projectId: string, folderName: string, parentId: number | null = null, isSidebarItem: boolean = true): Promise<any> => {
    try {
      // Hämta CSRF-token från cookies
      const csrfToken = getCsrfToken();
      console.log('CSRF-token för mappskapande:', csrfToken);
      
      // Förbättrad loggning för debugging
      console.log('Skapar mapp för projekt:', projectId, 'med namn:', folderName);
      
      const folderData = {
        name: folderName,
        project: projectId,
        parent: parentId,
        is_sidebar_item: isSidebarItem,
      };
      
      // Använd fetch med credentials för att säkerställa att sessionen skickas med
      const response = await fetch(`${API_BASE_URL}/api/files/directories/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {})
        },
        body: JSON.stringify(folderData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Mappskapande misslyckades med status:', response.status, errorText);
        throw new Error(`Fel vid skapande av mapp: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      
      console.log('Mapp skapad:', data);
      return data;
    } catch (error) {
      console.error('Fel vid skapande av mapp:', error);
      throw error;
    }
  }
};

export default projectService;