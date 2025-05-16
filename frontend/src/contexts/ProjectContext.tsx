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
}

// Skapa kontexten
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Props för providern
interface ProjectProviderProps {
  children: ReactNode;
}

// ProjectProvider-komponenten som ger tillgång till kontexten
export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  // Ladda projekt - använd sessionStorage om det finns sparade projekt
  const [projects, setProjects] = useState<Project[]>(() => {
    // Försök ladda projekt från sessionStorage
    const savedProjects = sessionStorage.getItem('projects');
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Kunde inte tolka sparade projekt', e);
      }
    }
    // Fallback till defaultProjects om inget finns i sessionStorage
    return defaultProjects;
  });

  // Ladda aktuellt projekt från sessionStorage om det finns och är ett giltigt projekt
  const [currentProject, setCurrentProjectState] = useState<Project>(() => {
    const savedCurrentProject = sessionStorage.getItem('currentProject');
    if (savedCurrentProject) {
      try {
        const parsed = JSON.parse(savedCurrentProject);
        // Kontrollera att det är ett giltigt projekt som finns i vår lista
        // men använd den laddade projektlistan (projects) istället för defaultProjects
        // så att nya projekt också hittas
        const currentProjects = JSON.parse(sessionStorage.getItem('projects') || '[]');
        const allProjects = Array.isArray(currentProjects) && currentProjects.length > 0 
          ? currentProjects 
          : defaultProjects;
          
        const validProject = allProjects.find(p => p.id === parsed.id);
        if (validProject) {
          return validProject;
        }
      } catch (e) {
        console.error('Kunde inte tolka sparat projekt', e);
      }
    }
    // Använd första projektet som standard
    const firstProject = projects?.[0] || defaultProjects[0];
    return firstProject;
  });

  // Flagga för att visa när inladdningen är klar
  const [loading, setLoading] = useState(true);

  // Sätt bara flaggan för när inladdningen är färdig
  useEffect(() => {
    setLoading(false);
  }, []);

  // Spara aktuellt projekt till sessionStorage
  const setCurrentProject = (project: Project) => {
    setCurrentProjectState(project);
    sessionStorage.setItem('currentProject', JSON.stringify(project));
    
    // När projektet byts, rensa tidigare innehåll och uppdatera URL:en
    // Detta löser problemet med att innehåll från tidigare projekt visas
    if (window.location.pathname.includes('/folders/')) {
      // Om vi är inne på en folder-sida, gå tillbaka till startsidan 
      // efter projektbyte för att undvika gammalt innehåll
      window.location.href = '/';
    }
  };

  // Lägg till ett nytt projekt till projektkontexten
  const addProject = (project: Project) => {
    // Lägg till projektet i listan
    const updatedProjects = [...projects, project];
    setProjects(updatedProjects);
    
    // Spara projekten i sessionStorage så de behålls vid siduppdatering
    sessionStorage.setItem('projects', JSON.stringify(updatedProjects));
    
    // Byt automatiskt till det nya projektet
    setCurrentProject(project);
    
    console.log('Nytt projekt tillagt:', project);
  };

  // Kontextens värde
  const value = {
    currentProject,
    setCurrentProject,
    projects,
    addProject,
    loading
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