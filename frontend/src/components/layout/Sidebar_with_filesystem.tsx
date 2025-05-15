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
  FormLabel
} from '@mui/joy';
import { Link, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

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

// Komponent som representerar en fil eller mapp i sidomenyn
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
    <>
      <ListItem 
        sx={{ 
          mb: 0.5,
          pl: level * 1.5, // Låt indenteringen fortsätta för varje nivå
          pr: 0,
          position: 'relative',
          overflow: 'visible',
          display: 'block',
          paddingRight: '20px' // Extra utrymme till höger för att säkerställa plats åt plusknappen
        }}
      >
        <ListItemButton
          onClick={() => isFolder && toggleFolder(node.id)}
          component="div"
          sx={{ 
            py: 0.3,
            pl: 0.5,
            borderRadius: '4px',
            color: 'neutral.700',
            fontSize: '0.875rem',
            display: 'grid',
            gridTemplateColumns: 'minmax(20px, 20px) auto minmax(30px, 30px)',
            gridGap: '4px',
            alignItems: 'center',
            width: '100%',
            overflow: 'visible',
            position: 'relative'
          }}
        >
          {/* Ikon för fil/mapp */}
          <Box
            sx={{
              width: 16,
              height: 16,
              mr: 1.5,
              color: isFolder ? '#e3a008' : '#3182ce',  // Mer exakta färger för mapparna/filerna
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              {isFolder ? (
                <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
              ) : (
                <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
              )}
            </svg>
          </Box>
          
          {/* Filnamn/mappnamn i egen grid-cell */}
          <Typography 
            level="body-xs" 
            sx={{ 
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              wordBreak: 'keep-all',
              display: 'block',
              textOverflow: 'ellipsis'
            }}
          >
            {node.name}
          </Typography>
          
          {/* Plusknapp i egen grid-cell med fast avstånd */}
          {isFolder && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <IconButton 
                size="sm" 
                variant="plain" 
                color="neutral"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddNewFolder(node.id);
                }}
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.7,
                  minWidth: '18px',
                  width: '18px',
                  height: '18px',
                  p: '2px',
                  bgcolor: 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)'
                  },
                  '&:focus': {
                    outline: 'none',
                    bgcolor: 'transparent'
                  }
                }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </IconButton>
            </Box>
          )}
        </ListItemButton>
      </ListItem>
      
      {/* Rekursivt visa barnens innehåll om det är en öppen mapp */}
      {isFolder && isOpen && children.length > 0 && (
        <Box sx={{ 
          ml: 1,
          width: '100%',
          position: 'relative'
        }}>
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
        </Box>
      )}
    </>
  );
};

// Interface för filer och mappar i sidomenyn
interface SidebarFileNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  parent_id: string | null;
  children?: SidebarFileNode[];
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
  
  // Håll reda på öppna filer/mappar i filsystemet
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  
  // Hämta sparade mappar från localStorage när sidan laddas
  const [filesystemNodes, setFilesystemNodes] = useState<SidebarFileNode[]>(() => {
    // Försök hämta sparade filer/mappar från localStorage
    const savedNodes = localStorage.getItem('filesystemNodes');
    if (savedNodes) {
      try {
        return JSON.parse(savedNodes);
      } catch (error) {
        console.error('Fel vid läsning av sparade filer:', error);
        return [];
      }
    }
    // Inga sparade mappar, börja med en tom lista
    return [];
  });
  
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
  
  // Rensa filsystemet vid första laddning
  useEffect(() => {
    // Rensa allt filsystem relaterat till localStorage för att börja med ett tomt system
    //localStorage.removeItem('filesystemNodes');
    //localStorage.removeItem('fileBrowserInitialized');
    //setFilesystemNodes([]);
  }, []);
  
  // Spara ändringar i filsystemet till localStorage
  useEffect(() => {
    localStorage.setItem('filesystemNodes', JSON.stringify(filesystemNodes));
  }, [filesystemNodes]);
  
  // Skapa ny mapp
  const createNewFolder = () => {
    if (newFolderName.trim() === '') return;
    
    const newFolderId = uuidv4();
    const newFolder: SidebarFileNode = {
      id: newFolderId,
      name: newFolderName.trim(),
      type: 'folder',
      parent_id: currentParentId
    };
    
    // Uppdatera state och spara automatiskt till localStorage via useEffect
    setFilesystemNodes(prev => [...prev, newFolder]);
    setNewFolderDialogOpen(false);
    setNewFolderName('');
    
    // Automatiskt öppna den nya mappen och dess föräldrar
    openFolder(newFolderId);
    
    // Automatiskt öppna föräldramappen också
    if (currentParentId) {
      openFolder(currentParentId);
    }
  };

  // Check if a menu item is active
  const isActive = (path: string) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
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
        bgcolor: '#fff',
      }}
    >
      {/* Header with Logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          height: 56,
        }}
      >
        <Box 
          sx={{ 
            width: 32, 
            height: 32, 
            borderRadius: 8, 
            bgcolor: 'primary.500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 1.5,
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.59 7.41L18.17 11H6v2h12.17l-3.59 3.59L16 18l6-6-6-6-1.41 1.41z"/>
          </svg>
        </Box>
        <Typography level="title-lg" sx={{ fontWeight: 'bold' }}>
          ValvX
        </Typography>
        
        {/* Light/Dark mode toggle and collapse button */}
        <Box sx={{ ml: 'auto', display: 'flex' }}>
          <IconButton size="sm" variant="plain" color="neutral">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
            </svg>
          </IconButton>
          <IconButton size="sm" variant="plain" color="neutral">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
            </svg>
          </IconButton>
        </Box>
      </Box>
      
      {/* Navigation Menu */}
      <Box 
        component="nav" 
        sx={{ 
          p: 2,  
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        <List sx={{ '--List-gap': '8px', mb: 2 }}>
          {mainMenuItems.map((item, index) => (
            <ListItem key={index} nested={Boolean(item.submenu?.length)}>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={isActive(item.path)}
                onClick={() => item.collapsible && toggleSubmenu(item.path)}
              >
                <ListItemContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', mr: 1.5 }}>
                      {item.icon}
                    </Box>
                    <Typography level="body-sm">{item.name}</Typography>
                    {item.badge && (
                      <Box 
                        sx={{ 
                          ml: 'auto', 
                          backgroundColor: 'primary.500', 
                          color: 'white', 
                          fontSize: '0.7rem',
                          px: 0.8,
                          py: 0.2,
                          borderRadius: 10
                        }}
                      >
                        {item.badge}
                      </Box>
                    )}
                  </Box>
                </ListItemContent>
                {item.collapsible && (
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                    style={{ 
                      transform: openSubmenus[item.path] ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.15s'
                    }}
                  >
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"/>
                  </svg>
                )}
              </ListItemButton>
              
              {item.submenu?.length > 0 && openSubmenus[item.path] && (
                <List sx={{ '--List-gap': '4px', my: 1 }}>
                  {item.submenu.map((subItem, subIndex) => (
                    <ListItem key={subIndex}>
                      <ListItemButton
                        component={Link}
                        to={subItem.path}
                        selected={isActive(subItem.path)}
                        sx={{ pl: 4 }}
                      >
                        <Typography level="body-xs">{subItem.name}</Typography>
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </ListItem>
          ))}
        </List>
        
        {/* File System under Filer option */}
        <Box 
          sx={{ 
            display: location.pathname.startsWith('/vault') ? 'block' : 'none',
            mt: 2 
          }}
        >
          <Typography 
            level="body-xs" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 1.5, 
              color: 'text.tertiary',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}
          >
            Filer
          </Typography>
          
          <List sx={{ '--List-gap': '2px', pl: 0 }}>
            {/* Root level plus button for adding folders */}
            <ListItem sx={{ mb: 0.5 }}>
              <ListItemButton 
                onClick={() => handleAddNewFolder(null)}
                sx={{ 
                  py: 0.5, 
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: '1px dashed',
                    borderColor: 'primary.500',
                    color: 'primary.600',
                    mr: 1
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                </Box>
                <Typography level="body-xs" sx={{ color: 'primary.600' }}>
                  Skapa ny mapp
                </Typography>
              </ListItemButton>
            </ListItem>
            
            {/* File system tree */}
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
          </List>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <List sx={{ '--List-gap': '8px' }}>
          <ListItem>
            <ListItemButton 
              component={Link} 
              to="/settings"
              selected={isActive('/settings')}
            >
              <ListItemContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', mr: 1.5 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                    </svg>
                  </Box>
                  <Typography level="body-sm">Inställningar</Typography>
                </Box>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton 
              component={Link} 
              to="/profile"
              selected={isActive('/profile')}
            >
              <ListItemContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', mr: 1.5 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </Box>
                  <Typography level="body-sm">Profil</Typography>
                </Box>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton 
              component={Link} 
              to="/logout"
              onClick={(e) => {
                e.preventDefault();
                // Handle logout here
              }}
            >
              <ListItemContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', mr: 1.5, color: 'danger.600' }}>
                    {logoutItem.icon}
                  </Box>
                  <Typography level="body-sm" sx={{ color: 'danger.600' }}>
                    {logoutItem.name}
                  </Typography>
                </Box>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
      
      {/* New Folder Dialog */}
      <Modal open={newFolderDialogOpen} onClose={() => setNewFolderDialogOpen(false)}>
        <ModalDialog>
          <DialogTitle>Skapa ny mapp</DialogTitle>
          <DialogContent>
            <FormControl>
              <FormLabel>Mappnamn</FormLabel>
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus
                sx={{ mt: 1, mb: 2 }}
              />
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button
              variant="plain"
              color="neutral"
              onClick={() => setNewFolderDialogOpen(false)}
            >
              Avbryt
            </Button>
            <Button onClick={createNewFolder}>Skapa</Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Sheet>
  );
};

export default Sidebar;