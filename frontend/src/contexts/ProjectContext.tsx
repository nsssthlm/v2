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
  
  // Initiera currentProject från localStorage om det finns
  const [currentProject, setCurrentProjectState] = useState<Project>(() => {
    // Försök hämta från localStorage först
    const savedProject = localStorage.getItem('currentProject');
    if (savedProject) {
      try {
        return JSON.parse(savedProject) as Project;
      } catch (e) {
        console.error('Kunde inte parsa sparat projekt från localStorage', e);
      }
    }
    return defaultProject;
  });
  
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
          
          // Hitta rätt projekt att aktivera - använd localStorage istället för sessionStorage
          // för att behålla valet även efter inloggning
          const selectedProjectId = localStorage.getItem('selectedProjectId');
          if (selectedProjectId) {
            console.log('Hittade sparat projektId i localStorage:', selectedProjectId);
            const selectedProject = projectsData.find(p => p.id === selectedProjectId);
            if (selectedProject) {
              console.log('Aktiverar sparat projekt:', selectedProject);
              setCurrentProjectState(selectedProject);
            } else {
              console.log('Sparat projekt hittades ej, använder första i listan');
              setCurrentProjectState(projectsData[0]);
            }
          } else {
            // Om inget valt projekt, använd det första
            console.log('Inget sparat projektval, använder första projekt i listan');
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
    
    // Spara både i sessionStorage och localStorage för att säkerställa att
    // användarens val sparas även om de måste logga in igen
    localStorage.setItem('currentProject', JSON.stringify(project));
    localStorage.setItem('selectedProjectId', project.id);
    console.log('Projektval sparat i localStorage, projektId:', project.id);
    
    // Även i sessionStorage för bakåtkompatibilitet
    sessionStorage.setItem('currentProject', JSON.stringify(project));
    sessionStorage.setItem('selectedProjectId', project.id);

    // Uppdatera URL:en utan att ladda om sidan om vi är i en mapp
    if (window.location.pathname.includes('/folders/')) {
      window.history.pushState({}, '', '/');
      // Utlös en route-ändring event så React Router märker förändringen
      window.dispatchEvent(new Event('popstate'));
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