import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import projectService from '../services/projectService';

// Projekttypen
export interface Project {
  id: string;
  name: string;
  description: string;
  endDate: string;
  // Här kan vi lägga till fler fält som är relevanta för projekt i framtiden
}

// Standardprojekt som är synkroniserade med databasen
const defaultProjects: Project[] = [
  {
    id: '1',
    name: 'Test projekt',
    description: 'Ett testprojekt',
    endDate: '2026-12-31'
  },
  {
    id: '2',
    name: 'Nya Slussen',
    description: 'Ombyggnad av Slussen i Stockholm',
    endDate: '2025-06-30'
  },
  {
    id: '3',
    name: 'Karlatornet',
    description: 'Byggnation av Karlatornet i Göteborg',
    endDate: '2027-12-31'
  }
];

// Kontexttyp
interface ProjectContextType {
  currentProject: Project;
  setCurrentProject: (project: Project) => void;
  projects: Project[];
  addProject: (project: Project) => void;
  loading: boolean;
  
  // Lägg till properties för projekt-IDs som behövs i components
  contextProjectId?: string;
  activeProjectId?: string;
}

// Skapa kontexten
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Props för providern
interface ProjectProviderProps {
  children: ReactNode;
}

// ProjectProvider-komponenten som ger tillgång till kontexten
export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  // Ladda projekt från databasen
  const [projects, setProjects] = useState<Project[]>(defaultProjects);

  // Hämta alla projekt från databasen vid uppstart med förbättrad felhantering
  useEffect(() => {
    const fetchAllProjects = async () => {
      try {
        // Hämta projekt från backend-API via vår förbättrade projektservice
        console.log('Försöker hämta projekt från databasen...');
        const projectsData = await projectService.getAllProjects();
        
        if (projectsData && projectsData.length > 0) {
          console.log('Hämtade projekt från databasen:', projectsData);
          setProjects(projectsData);

          // Uppdatera currentProject baserat på selectedProjectId
          const selectedProjectId = sessionStorage.getItem('selectedProjectId');
          if (selectedProjectId) {
            const selectedProject = projectsData.find(p => p.id === selectedProjectId);
            if (selectedProject) {
              console.log('Sätter aktivt projekt till:', selectedProject);
              setCurrentProjectState(selectedProject);
            }
          } 
          // Annars behåll nuvarande projekt om det finns i listan
          else if (currentProject && currentProject.id) {
            const currentInDb = projectsData.find(p => p.id === currentProject.id);
            if (currentInDb) {
              setCurrentProjectState(currentInDb);
            } else {
              // Fallback till senast skapade projektet om nuvarande inte hittades
              const latestProject = [...projectsData].sort((a, b) => parseInt(b.id) - parseInt(a.id))[0];
              setCurrentProjectState(latestProject);
            }
          }
        } else {
          console.warn('Inga projekt hittades i databasen, använder standardprojekt');
          // Om API-anropet inte returnerar några projekt, behåll de fördefinierade
        }
      } catch (error) {
        console.error('Fel vid hämtning av projekt:', error);
      }
    };

    fetchAllProjects();
  }, []);

  // Ladda aktuellt projekt baserat på selectedProjectId från sessionStorage om det finns
  const [currentProject, setCurrentProjectState] = useState<Project>(() => {
    // Kontrollera om det finns ett valt projektid i sessionStorage
    const selectedProjectId = sessionStorage.getItem('selectedProjectId');

    if (selectedProjectId) {
      // Försök hitta projektet i vår lista av projekt
      const selectedProject = projects.find(p => p.id === selectedProjectId);
      if (selectedProject) {
        console.log('Använder valt projekt från sessionStorage:', selectedProject);
        return selectedProject;
      }
    }

    // Annars försök ladda senaste valda projekt
    const savedCurrentProject = sessionStorage.getItem('currentProject');
    if (savedCurrentProject) {
      try {
        const parsed = JSON.parse(savedCurrentProject);
        const validProject = projects.find(p => p.id === parsed.id);
        if (validProject) {
          console.log('Använder senast sparade projekt:', validProject);
          return validProject;
        }
      } catch (e) {
        console.error('Kunde inte tolka sparat projekt', e);
      }
    }

    // Använd första projektet som standard eller senast skapade projektet
    const sortedProjects = [...projects].sort((a, b) => parseInt(b.id) - parseInt(a.id));
    const firstProject = sortedProjects[0] || defaultProjects[0];
    console.log('Använder standardprojekt:', firstProject);
    return firstProject;
  });

  // Flagga för att visa när inladdningen är klar
  const [loading, setLoading] = useState(true);

  // Sätt bara flaggan för när inladdningen är färdig
  useEffect(() => {
    setLoading(false);
  }, []);

  const setCurrentProject = (project: Project) => {
    console.log('Sätter nytt projekt:', project);
    
    // Uppdatera state
    setCurrentProjectState(project);
    
    // Spara i sessionStorage för att persistera vid omladdning
    sessionStorage.setItem('currentProject', JSON.stringify(project));
    sessionStorage.setItem('selectedProjectId', project.id);

    // Meddela projektbytet
    console.log('Projekt har bytts till:', project.name);
    
    // Viktigt: Avkommentera INTE denna kod, den orsakar utloggning
    // window.location.href = '/';
  };

  // Lägg till ett nytt projekt till projektkontexten
  const addProject = (project: Project) => {
    // Lägg till projektet i listan
    const updatedProjects = [...projects, project];
    setProjects(updatedProjects);

    // Byt automatiskt till det nya projektet
    setCurrentProject(project);

    console.log('Nytt projekt tillagt:', project);
  };

  // Kontextens värde med ID-properties som behövs i komponenter
  const value = {
    currentProject,
    setCurrentProject,
    projects,
    addProject,
    loading,
    contextProjectId: currentProject?.id,
    activeProjectId: currentProject?.id
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

// Hook för att använda projektkontexten
export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};