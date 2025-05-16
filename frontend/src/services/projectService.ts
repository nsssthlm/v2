import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Project } from '../contexts/ProjectContext';

// Interface för att skapa ett nytt projekt
export interface ProjectInput {
  name: string;
  description: string;
  start_date: string;
  end_date?: string;
}

// Service för att hantera projekt via backend API
const projectService = {
  // Hämta alla projekt
  getAllProjects: async (): Promise<Project[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/core/projects/`);
      
      // Mappa om API-data till frontend-format
      const projects = response.data.map((item: any) => ({
        id: item.id.toString(),
        name: item.name,
        description: item.description || '',
        endDate: item.end_date || ''
      }));
      
      return projects;
    } catch (error) {
      console.error('Fel vid hämtning av projekt:', error);
      return [];
    }
  },
  
  // Skapa ett nytt projekt
  createProject: async (projectData: ProjectInput): Promise<Project | null> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/core/projects/`, projectData);
      
      // Mappa om API-svaret till frontend-format
      const createdProject: Project = {
        id: response.data.id.toString(),
        name: response.data.name,
        description: response.data.description || '',
        endDate: response.data.end_date || ''
      };
      
      return createdProject;
    } catch (error) {
      console.error('Fel vid skapande av projekt:', error);
      return null;
    }
  }
};

export default projectService;