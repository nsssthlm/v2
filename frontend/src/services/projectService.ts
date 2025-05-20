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
 * Alla anrop är förenklade utan extra headers
 */
const projectService = {
  // Hämta alla projekt
  getAllProjects: async (): Promise<Project[]> => {
    try {
      const headers = getAuthHeader();
      
      const response = await axios.get(`${API_BASE_URL}/custom/projects`, { 
        headers 
      });
      
      // Mappa om API-data till frontend-format
      const projects = Array.isArray(response.data) ? response.data.map((item: any) => ({
        id: item.id.toString(),
        name: item.name,
        description: item.description || '',
        endDate: item.end_date || item.endDate || ''
      })) : [];
      
      return projects;
    } catch (error) {
      console.error('Fel vid hämtning av projekt:', error);
      return [];
    }
  },
  
  // Skapa ett nytt projekt
  createProject: async (projectData: ProjectInput): Promise<Project | null> => {
    try {
      const headers = getStandardHeaders();
      
      console.log('Skapar projekt med URL:', `${API_BASE_URL}/custom/create-project`);
      console.log('Projekdata:', projectData);
      console.log('Headers:', headers);
      
      // Använd rätt API-endpoint för Django backend
      const response = await axios.post(`${API_BASE_URL}/custom/create-project`, projectData, {
        headers
      });
      
      // Mappa om API-svaret till frontend-format
      const createdProject: Project = {
        id: response.data.id.toString(),
        name: response.data.name,
        description: response.data.description || '',
        endDate: response.data.end_date || response.data.endDate || ''
      };
      
      // Skapa en standardmapp för projektet
      try {
        await projectService.createDefaultFolder(createdProject.id);
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
      // Enkel request utan headers
      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      };
      
      // Förbättrad loggning för debugging
      console.log('Skapar standardmapp för projekt:', projectId);
      
      const folderData = {
        name: 'Dokument',
        project: projectId,
        parent: null,
        is_sidebar_item: true, // Använd korrekt fältnamn is_sidebar_item (inte is_sidebar)
      };
      
      const response = await axios.post(`${API_BASE_URL}/files/directories/`, folderData, {
        headers
      });
      
      console.log('Standardmapp skapad:', response.data);
      return response.data;
    } catch (error) {
      console.error('Fel vid skapande av standardmapp:', error);
      throw error;
    }
  }
};

export default projectService;