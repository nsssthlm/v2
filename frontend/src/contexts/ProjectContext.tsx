import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Projekttypen
export interface Project {
  id: string;
  name: string;
  description: string;
  endDate: string;
  // Här kan vi lägga till fler fält som är relevanta för projekt i framtiden
}

// Standardprojekt för nya användare
const defaultProjects: Project[] = [
  {
    id: '1',
    name: 'Globen',
    description: 'Renoveringsprojekt för Globen arena',
    endDate: '2026-12-31'
  },
  {
    id: '2',
    name: 'Nya Slussen',
    description: 'Ombyggnad av Slussen i Stockholm',
    endDate: '2025-06-30'
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
  // Ladda projekt från localStorage eller använd standard
  const [projects, setProjects] = useState<Project[]>(() => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      return JSON.parse(savedProjects);
    }
    return defaultProjects;
  });

  // Ladda aktuellt projekt från sessionStorage
  const [currentProject, setCurrentProjectState] = useState<Project>(() => {
    const savedCurrentProject = sessionStorage.getItem('currentProject');
    if (savedCurrentProject) {
      return JSON.parse(savedCurrentProject);
    }
    return projects[0]; // Använd första projektet som standard
  });

  // Flagga för att visa när inladdningen är klar
  const [loading, setLoading] = useState(true);

  // Spara projekt till localStorage när de ändras
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
    setLoading(false);
  }, [projects]);

  // Spara aktuellt projekt till sessionStorage
  const setCurrentProject = (project: Project) => {
    setCurrentProjectState(project);
    sessionStorage.setItem('currentProject', JSON.stringify(project));
    
    // Här kan vi uppdatera URL eller andra delar av appen baserat på projektet
    // t.ex. window.history.pushState(null, '', `/projects/${project.id}`);
  };

  // Lägg till ett nytt projekt
  const addProject = (project: Project) => {
    setProjects([...projects, project]);
    setCurrentProject(project); // Byt automatiskt till det nya projektet
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