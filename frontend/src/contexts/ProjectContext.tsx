import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import projectService from '../services/projectService';

// Projekttypen
export interface Project {
  id: string;
  name: string;
  description: string;
  endDate: string;
}

// Kontexttyp
interface ProjectContextType {
  currentProject: Project;
  setCurrentProject: (project: Project) => void;
  projects: Project[];
  addProject: (project: Project) => void;
  loading: boolean;
}

// Skapa kontexten
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Props för providern
interface ProjectProviderProps {
  children: ReactNode;
}

// ProjectProvider-komponenten som ger tillgång till kontexten
export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  // Standardprojekt
  const defaultProject: Project = {
    id: '1',
    name: 'Projekt 1',
    description: 'Ett generellt projekt för att samla dokument',
    endDate: '2026-12-31'
  };
  
  // State för projekten och laddar-status
  const [projects, setProjects] = useState<Project[]>([defaultProject]);
  const [currentProject, setCurrentProjectState] = useState<Project>(defaultProject);
  const [loading, setLoading] = useState(true);

  // Hämta alla projekt från databasen vid uppstart
  useEffect(() => {
    const fetchAllProjects = async () => {
      try {
        console.log('Försöker hämta projekt från databasen...');
        const projectsData = await projectService.getAllProjects();
        
        if (projectsData && projectsData.length > 0) {
          console.log('Hämtade projekt från databasen:', projectsData);
          
          // Uppdatera projektlistan
          setProjects(projectsData);
          
          // Hitta rätt projekt att aktivera
          const selectedProjectId = sessionStorage.getItem('selectedProjectId');
          if (selectedProjectId) {
            const selectedProject = projectsData.find(p => p.id === selectedProjectId);
            if (selectedProject) {
              setCurrentProjectState(selectedProject);
            } else {
              setCurrentProjectState(projectsData[0]);
            }
          } else {
            // Om inget valt projekt, använd det första
            setCurrentProjectState(projectsData[0]);
          }
        } else {
          // Behåll standardprojektet om inget kommer från API
          console.log('Inga projekt från API, använder standardprojekt');
        }
      } catch (error) {
        console.error('Fel vid hämtning av projekt:', error);
        // Behåll standardprojektet vid fel
      } finally {
        setLoading(false);
      }
    };

    fetchAllProjects();
  }, []);

  // Funktion för att byta aktivt projekt
  const setCurrentProject = (project: Project) => {
    console.log('Sätter nytt projekt:', project);
    setCurrentProjectState(project);
    sessionStorage.setItem('currentProject', JSON.stringify(project));
    sessionStorage.setItem('selectedProjectId', project.id);

    // Navigera till start om vi är i en mapp
    if (window.location.pathname.includes('/folders/')) {
      window.location.href = '/';
    }
  };

  // Lägg till ett nytt projekt
  const addProject = (project: Project) => {
    const updatedProjects = [...projects, project];
    setProjects(updatedProjects);
    setCurrentProject(project);
    console.log('Nytt projekt tillagt:', project);
  };

  return (
    <ProjectContext.Provider value={{
      currentProject,
      setCurrentProject,
      projects,
      addProject,
      loading
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

// Hook för att använda projektkontexten
export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject måste användas inom en ProjectProvider');
  }
  return context;
};