import { useState, useEffect } from 'react';
import { 
  Sheet, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemContent, 
  Typography, 
  Box, 
  Input, 
  IconButton, 
  Divider,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  CircularProgress
} from '@mui/joy';
import { Link, useLocation } from 'react-router-dom';
import directoryService, { DirectoryInput } from '../../services/directoryService';
import { useProject } from '../../contexts/ProjectContext';

// Interface för menyobjekt
// Används för att typa submenu-items i sidebar-navigationen
interface SubmenuItem {
  name: string;
  path: string;
  icon?: React.ReactNode;
  hasAddButton?: boolean;
}

// Komponent för varje nod (fil/mapp) i filsystemet
interface FileSystemNodeProps {
  node: SidebarFileNode;
  level: number;
  filesystemNodes: SidebarFileNode[];
  openFolders: Record<string, boolean>;
  toggleFolder: (id: string) => void;
  handleAddNewFolder: (parentId: string | null) => void;
}

// Helt ombyggd komponent för filsystemet
const FileSystemNode = ({
  node,
  level,
  filesystemNodes,
  openFolders,
  toggleFolder,
  handleAddNewFolder
}: FileSystemNodeProps) => {
  const isFolder = node.type === 'folder';
  const isOpen = openFolders[node.id] || false;
  
  // Hitta alla barn till denna nod
  const children = filesystemNodes.filter(n => n.parent_id === node.id);
  
  return (
    <div className="folder-node" style={{ position: 'relative', marginBottom: '4px', width: '100%' }}>
      {/* L-streck för hierarkin */}
      {level > 0 && (
        <div style={{
          position: 'absolute',
          left: `${level * 24 - 8}px`,
          top: 0,
          width: '10px',
          height: '20px',
          borderLeft: '1px solid #A0A0A0',
          borderBottom: '1px solid #A0A0A0',
          pointerEvents: 'none'
        }} />
      )}
      
      {/* En HTML-button istället för div för bättre klickbarhet */}
      <div
        style={{
          backgroundColor: 'transparent',
          paddingLeft: `${level * 24 + 12}px`,
          paddingRight: '8px',
          paddingTop: '4px',
          paddingBottom: '4px',
          width: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          cursor: isFolder ? 'pointer' : 'default',
          borderRadius: '4px',
          textAlign: 'left',
          whiteSpace: 'nowrap',
          transition: 'background-color 0.15s'
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (isFolder) {
            toggleFolder(node.id);
            
            // Bara navigera till mappens sida om den inte har några barn (är lägst i hierarkin)
            const hasChildren = filesystemNodes.some(n => n.parent_id === node.id);
            if (node.slug && !hasChildren) {
              window.location.href = `/folders/${node.slug}`;
            }
          }
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        title={isFolder ? "Klicka för att expandera/kollapsa" : ""}
      >
        {/* Mappikon direkt i parent div utan extra span */}
        {/* Ikon */}
        <span style={{
          display: 'inline-flex',
          width: '16px',
          height: '16px',
          marginRight: '10px',
          color: isFolder ? '#e3a008' : '#3182ce',
          flexShrink: 0
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            {isFolder ? (
              <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
            ) : (
              <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
            )}
          </svg>
        </span>
        
        {/* Mappnamn */}
        <span style={{
          fontSize: '0.875rem',
          display: 'inline-block',
          fontWeight: 'normal',
          whiteSpace: 'nowrap',
          flexGrow: 1
        }}>
          {node.name}
          
          {/* Dold knapp för att navigera till mappen */}
          {isFolder && node.slug && (
            <div style={{ display: 'none' }}>
              <a 
                href={`/folders/${node.slug}`}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  // Navigera till den interna sidan
                  window.location.href = `/folders/${node.slug}`;
                }}
              />
            </div>
          )}
        </span>
      
        {/* Plusknapp - nu inom namnspannet men med stopPropagation för att undvika hoverproblem*/}
        {isFolder && (
          <span 
            style={{
              opacity: 0.7,
              minWidth: '20px',
              width: '20px',
              height: '20px',
              padding: '2px',
              marginLeft: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: '4px',
              flexShrink: 0,
              position: 'relative',
              zIndex: 1
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleAddNewFolder(node.id);
            }}
            onMouseOver={(e) => {
              e.stopPropagation();
              (e.currentTarget as HTMLSpanElement).style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
            }}
            onMouseOut={(e) => {
              e.stopPropagation();
              (e.currentTarget as HTMLSpanElement).style.backgroundColor = 'transparent';
            }}
            title="Lägg till undermapp"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </span>
        )}
      </div>
      
      {/* Barnmappar */}
      {isFolder && isOpen && children.length > 0 && (
        <div style={{ display: 'block', width: '100%' }}>
          {children.map(child => (
            <FileSystemNode
              key={child.id}
              node={child}
              level={level + 1}
              filesystemNodes={filesystemNodes}
              openFolders={openFolders}
              toggleFolder={toggleFolder}
              handleAddNewFolder={handleAddNewFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Interface för filer och mappar i sidomenyn
interface SidebarFileNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  parent_id: string | null;
  children?: SidebarFileNode[];
  db_id?: number;  // ID från databasen
  slug?: string;   // Slug för webbadress
}

// Define top-level menu items
const mainMenuItems = [
  { 
    name: 'Dashboard', 
    path: '/dashboard', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 5a2 2 0 012-2h4a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm12-2a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2V5a2 2 0 00-2-2h-4zm0 14a2 2 0 002-2v-4a2 2 0 00-2-2h-4a2 2 0 00-2 2v4a2 2 0 002 2h4z" />
      </svg>
    ),
    submenu: []
  },
  { 
    name: 'Project Leader Dashboard', 
    path: '/projectleader', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 13v-1h4v1H8zm0 3v-1h8v1H8zm-2.55-7h13.1c.3 0 .55.25.55.55 0 .24-.16.45-.4.53l-6.6 1.97c-.11.03-.22.03-.33 0l-6.6-1.97a.546.546 0 01-.17-1.03c.07-.03.14-.05.22-.05z"/><path d="M18.24 5H5.76C4.79 5 4 5.79 4 6.76v10.48c0 .97.79 1.76 1.76 1.76h12.48c.97 0 1.76-.79 1.76-1.76V6.76c0-.97-.79-1.76-1.76-1.76zm.26 12H5.5a.5.5 0 01-.5-.5v-11a.5.5 0 01.5-.5h13a.5.5 0 01.5.5v11a.5.5 0 01-.5.5z"/>
      </svg>
    ),
    submenu: [],
    badge: 'New'
  },
  { 
    name: 'Tidsrapportering', 
    path: '/time', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
      </svg>
    ),
    submenu: []
  },
  { 
    name: 'Projektplanering', 
    path: '/planning', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 3h18v18H3V3zm16.5 16.5v-15h-15v15h15zM11 7h6v2h-6V7zm0 4h6v2h-6v-2zm0 4h6v2h-6v-2zM7 7h2v2H7V7zm0 4h2v2H7v-2zm0 4h2v2H7v-2z"/>
      </svg>
    ),
    submenu: [
      { name: 'Kanban', path: '/planning/kanban' },
      { name: 'Gantt Chart', path: '/planning/gantt' },
      { name: 'Ekonomi & Tid', path: '/planning/economy' }
    ],
    collapsible: true
  },
  { 
    name: 'Kommunikation', 
    path: '/communication', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/>
      </svg>
    ),
    submenu: [
      { name: 'Meddelanden', path: '/communication/messages' }
    ],
    collapsible: true
  },
  { 
    name: '3D Viewer', 
    path: '/3dviewer', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 18.8l-5.9-3.4V8.6l5.9 3.4v6.8zm1-8.3L7.1 6.9l5.9-3.4 5.9 3.4-5.9 3.6zm6.9 4.9l-5.9 3.4v-6.8l5.9-3.4v6.8z"/>
      </svg>
    ),
    submenu: [
      { name: '3D Översikt', path: '/3dviewer/overview' },
      { name: 'Design', path: '/3dviewer/design' },
      { name: 'Byggarbetsplats', path: '/3dviewer/construction' }
    ],
    collapsible: true
  },
  { 
    name: 'Vault', 
    path: '/vault', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM6.24 5h11.52l.83 1H5.42l.82-1zM5 19V8h14v11H5zm8-5.35V10.5h-2.5v3.15c-.66.25-1.15.97-1.15 1.85 0 1.1.9 2 2 2s2-.9 2-2c0-.88-.49-1.6-1.15-1.85z"/>
      </svg>
    ),
    submenu: [
      { name: 'Hem', path: '/vault/home' },
      { name: 'Kommentarer', path: '/vault/comments' },
      { name: 'Review Package', path: '/vault/review' },
      { name: 'Versionsset', path: '/vault/versions' },
      { name: 'Möten', path: '/vault/meetings' }
    ],
    collapsible: true
  }
];

// Define the logout option
const logoutItem = {
  name: 'Logga ut',
  path: '/logout',
  icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
    </svg>
  )
};

const Sidebar = () => {
  const location = useLocation();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    '/planning': true,    // Öppna dessa undermenyer som standard
    '/communication': true,
    '/3dviewer': true,
    '/vault': true
  });
  
  // Använd projektkontext för att få det aktuella projektets ID
  const { currentProject } = useProject();
  
  // Håll reda på öppna filer/mappar i filsystemet
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  
  // State för filsystemets noder från API
  const [filesystemNodes, setFilesystemNodes] = useState<SidebarFileNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State för att hantera dialogrutan för att skapa nya mappar
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);

  // Toggle submenu
  const toggleSubmenu = (path: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };
  
  // Växla mellan öppen/stängd mapp i filsystemet
  const toggleFolder = (folderId: string) => {
    setOpenFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };
  
  // Öppna en specifik mapp
  const openFolder = (folderId: string) => {
    setOpenFolders(prev => ({
      ...prev,
      [folderId]: true
    }));
    
    // Öppna också alla föräldramappar till denna mapp
    const openParentFolders = (nodeId: string) => {
      const node = filesystemNodes.find(n => n.id === nodeId);
      if (node && node.parent_id) {
        setOpenFolders(prev => ({
          ...prev,
          [node.parent_id!]: true
        }));
        openParentFolders(node.parent_id);
      }
    };
    
    const folder = filesystemNodes.find(n => n.id === folderId);
    if (folder && folder.parent_id) {
      openParentFolders(folder.parent_id);
    }
  };
  
  // Hantera klick på plustecknet för att skapa ny mapp
  const handleAddNewFolder = (parentId: string | null) => {
    setCurrentParentId(parentId);
    setNewFolderName('');
    setNewFolderDialogOpen(true);
  };
  
  // Ladda sidebarobjekt från API baserat på aktuellt projekt
  useEffect(() => {
    const loadSidebarItems = async () => {
      setIsLoading(true);
      try {
        // Använd projektets ID för att filtrera mappar
        const directoriesData = await directoryService.getSidebarDirectories(currentProject.id);
        
        // Konvertera från API-format till SidebarFileNode-format
        const sidebarNodes: SidebarFileNode[] = directoriesData.map(dir => ({
          id: dir.id.toString(),  // Konvertera till string-format
          name: dir.name,
          type: dir.type as 'folder' | 'file',
          parent_id: dir.parent ? dir.parent.toString() : null,
          db_id: dir.id,
          slug: dir.slug || undefined
        }));
        
        setFilesystemNodes(sidebarNodes);
      } catch (error) {
        console.error('Fel vid hämtning av mappar:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Ladda om mapparna när projektet ändras
    loadSidebarItems();
  }, [currentProject.id]); // Beroende på projektets ID så att mapparna laddas om vid projektbyte
  
  // Skapa ny mapp via API kopplad till aktuellt projekt
  const createNewFolder = async () => {
    if (newFolderName.trim() === '') return;
    
    // Kontrollera om det redan finns en mapp med samma namn på samma nivå
    const parentId = currentParentId || null;
    const siblingFolders = filesystemNodes.filter(node => node.parent_id === parentId);
    const nameExists = siblingFolders.some(folder => 
      folder.name.toLowerCase() === newFolderName.trim().toLowerCase()
    );
    
    if (nameExists) {
      alert('En mapp med detta namn finns redan. Vänligen välj ett annat namn.');
      return;
    }
    
    // Om parent_id finns, konvertera från string till number för API
    const parentDbId = currentParentId 
      ? filesystemNodes.find(n => n.id === currentParentId)?.db_id ?? null
      : null;
    
    try {
      // Skapa objekt för API-anrop - vi låter service-lagret hantera projektkopplingen
      const newDirData: DirectoryInput = {
        name: newFolderName.trim(),
        type: 'folder',
        is_sidebar_item: true,
        parent: parentDbId
      };
      
      // Skicka till API (med extra loggning) - skicka projektets ID separat
      console.log('Försöker skapa ny mapp med data:', newDirData);
      const createdDir = await directoryService.createDirectory(newDirData, currentProject.id);
      console.log('Mapp skapad med data:', createdDir);
      
      if (createdDir) {
        // Konvertera från API-format och lägg till i state
        const newFolder: SidebarFileNode = {
          id: createdDir.id.toString(),
          name: createdDir.name,
          type: 'folder' as 'folder' | 'file',
          parent_id: createdDir.parent ? createdDir.parent.toString() : null,
          db_id: createdDir.id,
          slug: createdDir.slug || undefined
        };
        
        // Uppdatera state
        setFilesystemNodes(prev => [...prev, newFolder]);
        
        // Automatiskt öppna den nya mappen och dess föräldrar
        openFolder(newFolder.id);
        
        // Automatiskt öppna föräldramappen också
        if (currentParentId) {
          openFolder(currentParentId);
        }
      }
    } catch (error: any) {
      console.error('Fel vid skapande av mapp:', error);
      alert(`Kunde inte skapa mappen: ${error.message || 'Okänt fel'}`);
    }
    
    // Stäng dialogrutan
    setNewFolderDialogOpen(false);
  };
  
  // Helper: check if a path is active
  const isActive = (path: string): boolean => {
    // Handle exact match for home or dashboard
    if (path === '/' || path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    // For other routes, check if location starts with path (for submenu items)
    return location.pathname.startsWith(path);
  };

  return (
    <Sheet
      sx={{
        width: 250,
        height: '100vh',
        borderRight: '1px solid',
        borderColor: 'divider',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'var(--joy-palette-background-surface, #fff)',
        position: 'relative',
        overflowX: 'visible',
        '& ul': { overflowX: 'visible !important' }, // Använd !important för att override andra stilar
        '& li': { overflowX: 'visible !important' }, // Samma för list items
      }}
    >
      {/* ValvX logo i vänstra hörnet */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}>
        <Box 
          sx={{ 
            width: 28, 
            height: 28, 
            borderRadius: 6, 
            bgcolor: '#007934', // SEB gröna
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 1.5,
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          <Typography level="title-lg">V</Typography>
        </Box>
        <Typography level="title-lg" sx={{ fontWeight: 'bold' }}>
          ValvX
        </Typography>
      </Box>

      {/* Sökfält */}
      <Box sx={{ px: 2, pt: 1, pb: 2 }}>
        <Input
          size="sm"
          placeholder="Search"
          startDecorator={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" opacity={0.5}>
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          }
          sx={{ 
            '--Input-radius': '4px',
            bgcolor: 'background.level1'
          }}
        />
      </Box>
      
      {/* Main navigation menu */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1.5 }}>
        <List size="sm" sx={{ '--ListItem-radius': '8px' }}>
          {mainMenuItems.map((item) => (
            <Box key={item.path}>
              <ListItem
                sx={{ 
                  mb: 0.5,
                  ...(isActive(item.path) && {
                    bgcolor: '#e0f2e9', // Ljusare SEB grön för aktiva val
                  })
                }}
              >
                <ListItemButton
                  selected={isActive(item.path)}
                  component={Link}
                  to={item.submenu && item.submenu.length > 0 && item.collapsible ? '#' : item.path}
                  sx={{
                    '&:hover': {
                      backgroundColor: '#e0f2e9', // Ljusare SEB grön vid hover
                    }
                  }}
                  onClick={
                    (item.submenu && item.submenu.length > 0 && item.collapsible) 
                      ? (e) => {
                          e.preventDefault();
                          toggleSubmenu(item.path);
                        }
                      : undefined
                  }
                >
                  {item.icon && (
                    <Box sx={{ mr: 1.5, color: isActive(item.path) ? '#007934' : 'neutral.500' }}>
                      {item.icon}
                    </Box>
                  )}
                  <ListItemContent>
                    <Typography level="title-sm">{item.name}</Typography>
                  </ListItemContent>
                  
                  {item.badge && (
                    <Typography level="body-xs" color="primary" sx={{ 
                      ml: 1, 
                      px: 0.8, 
                      py: 0.1, 
                      borderRadius: 8, 
                      bgcolor: '#e0f2e9', // Ljusare SEB grön
                      fontWeight: 'bold'
                    }}>
                      {item.badge}
                    </Typography>
                  )}
                  
                  {item.submenu && item.submenu.length > 0 && item.collapsible && (
                    <Box sx={{ transition: 'transform 0.2s', transform: openSubmenus[item.path] ? 'rotate(-180deg)' : 'none' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                      </svg>
                    </Box>
                  )}
                </ListItemButton>
              </ListItem>
              
              {/* Submenu items */}
              {item.submenu && item.submenu.length > 0 && item.collapsible && openSubmenus[item.path] && (
                <Box sx={{ ml: 3.5 }}>
                  {item.submenu.map((subItem) => (
                    <ListItem
                      key={subItem.path}
                      sx={{
                        mb: 0.5,
                        ...(isActive(subItem.path) && {
                          bgcolor: '#e0f2e9', // Ljusare SEB grön
                        })
                      }}
                    >
                      <ListItemButton
                        selected={isActive(subItem.path)}
                        component={Link}
                        to={subItem.path}
                        sx={{
                          '&:hover': {
                            backgroundColor: '#e0f2e9', // Ljusare SEB grön vid hover
                          }
                        }}
                      >
                        <ListItemContent>
                          <Typography level="body-sm">{subItem.name}</Typography>
                        </ListItemContent>
                      </ListItemButton>
                    </ListItem>
                  ))}
                </Box>
              )}
            </Box>
          ))}

          <Divider sx={{ my: 2 }} />
          
          {/* Filer (filsystem) */}
          <ListItem sx={{ mb: 0.5 }}>
            <ListItemButton 
              selected={location.pathname.startsWith('/folders')}
              component={Link}
              to="#"
              onClick={(e) => {
                e.preventDefault();
                toggleSubmenu('Filer');
              }}
            >
              <Box sx={{ mr: 1.5, color: location.pathname.startsWith('/folders') ? 'primary.500' : 'neutral.500' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                </svg>
              </Box>
              <ListItemContent>
                <Typography level="title-sm">Filer</Typography>
              </ListItemContent>
              
              {/* Plus knapp för att lägga till huvudmapp, liknande de andra mapparna */}
              <Box 
                component="span" 
                sx={{
                  opacity: 0.7,
                  minWidth: '20px',
                  width: '20px',
                  height: '20px',
                  padding: '2px',
                  marginRight: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  zIndex: 10,
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.04)'
                  }
                }}
                onClick={(e) => {
                  e.preventDefault(); // Förhindra att det navigerar
                  e.stopPropagation(); // Förhindra att föräldraelement fångar klicket
                  setNewFolderName('');
                  setCurrentParentId(null);
                  setNewFolderDialogOpen(true);
                }}
                title="Lägg till ny huvudmapp"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </Box>
              
              <Box sx={{ 
                transition: 'transform 0.2s', 
                transform: openSubmenus['Filer'] ? 'rotate(-180deg)' : 'none',
                p: 0.2
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                </svg>
              </Box>
            </ListItemButton>
          </ListItem>
          
          {/* Filsystem för filträdet */}
          {openSubmenus['Filer'] && (
            <Box sx={{ pl: 1.5, pr: 0, mb: 1, position: 'relative' }}>
              {isLoading ? (
                <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress size="sm" />
                </Box>
              ) : filesystemNodes.length > 0 ? (
                <Box sx={{ mt: 1, width: '100%' }}>
                  
                  {/* Filsystemsträd - visa alla noder utan förälder först */}
                  {filesystemNodes
                    .filter(node => node.parent_id === null)
                    .map(node => (
                      <FileSystemNode
                        key={node.id}
                        node={node}
                        level={0}
                        filesystemNodes={filesystemNodes}
                        openFolders={openFolders}
                        toggleFolder={toggleFolder}
                        handleAddNewFolder={handleAddNewFolder}
                      />
                    ))
                  }
                </Box>
              ) : (
                <Typography level="body-sm" sx={{ py: 2, pl: 1, fontStyle: 'italic' }}>
                  Inga mappar hittades.
                </Typography>
              )}
            </Box>
          )}
                    
          {/* Logout at the bottom of sidebar */}
          <ListItem sx={{ mt: 'auto' }}>
            <ListItemButton
              component={Link}
              to={logoutItem.path}
            >
              <Box sx={{ mr: 1.5, color: 'neutral.500' }}>
                {logoutItem.icon}
              </Box>
              <ListItemContent>
                <Typography level="title-sm">{logoutItem.name}</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
      
      {/* Modal för att skapa ny mapp */}
      <Modal open={newFolderDialogOpen} onClose={() => setNewFolderDialogOpen(false)}>
        <ModalDialog>
          <DialogTitle>Skapa ny mapp</DialogTitle>
          <DialogContent>
            <FormControl sx={{ mt: 1 }}>
              <FormLabel>Mappnamn</FormLabel>
              <Input
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newFolderName.trim() !== '') {
                    createNewFolder();
                  }
                }}
                placeholder="Ange mappnamn"
              />
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button variant="plain" color="neutral" onClick={() => setNewFolderDialogOpen(false)}>
              Avbryt
            </Button>
            <Button onClick={createNewFolder} disabled={newFolderName.trim() === ''}>Skapa</Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Sheet>
  );
};

export default Sidebar;