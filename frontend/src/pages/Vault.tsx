import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  Grid, 
  Tabs, 
  TabList, 
  Tab, 
  TabPanel, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemContent, 
  ListItemDecorator,
  Sheet,
  Button,
  IconButton,
  Input,
  Breadcrumbs,
  Link,
  Chip,
  Divider,
  Table
} from '@mui/joy';
import {
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  InsertDriveFile as FileIcon,
  Search as SearchIcon,
  Add as AddIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Code as CodeIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';

interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: number;
  updatedAt?: Date;
  contentType?: string;
  children?: FileNode[];
  parentId?: string | null;
}

const getFileIcon = (fileType?: string) => {
  if (!fileType) return <FileIcon />;
  
  if (fileType.includes('image')) return <ImageIcon color="success" />;
  if (fileType.includes('pdf')) return <PdfIcon color="error" />;
  if (fileType.includes('doc') || fileType.includes('word')) return <DocIcon color="primary" />;
  if (fileType.includes('zip') || fileType.includes('rar')) return <ArchiveIcon color="warning" />;
  if (fileType.includes('code') || fileType.includes('json') || fileType.includes('html')) return <CodeIcon color="primary" />;
  
  return <FileIcon />;
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
};

const Vault: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('files');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [path, setPath] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  
  // Sample file structure for demonstration
  const fileStructure: FileNode[] = [
    {
      id: 'folder-1',
      name: 'Dokument',
      type: 'folder',
      updatedAt: new Date(2025, 4, 1),
      children: [
        {
          id: 'file-1',
          name: 'Projektbeskrivning.pdf',
          type: 'file',
          size: 2500000,
          contentType: 'application/pdf',
          updatedAt: new Date(2025, 4, 10),
          parentId: 'folder-1'
        },
        {
          id: 'file-2',
          name: 'Mötesprotokoll.docx',
          type: 'file',
          size: 450000,
          contentType: 'application/msword',
          updatedAt: new Date(2025, 4, 8),
          parentId: 'folder-1'
        },
        {
          id: 'folder-1-1',
          name: 'Kontrakt',
          type: 'folder',
          updatedAt: new Date(2025, 3, 15),
          parentId: 'folder-1',
          children: [
            {
              id: 'file-3',
              name: 'Leverantörsavtal.pdf',
              type: 'file',
              size: 1800000,
              contentType: 'application/pdf',
              updatedAt: new Date(2025, 3, 15),
              parentId: 'folder-1-1'
            }
          ]
        }
      ]
    },
    {
      id: 'folder-2',
      name: 'Ritningar',
      type: 'folder',
      updatedAt: new Date(2025, 4, 5),
      children: [
        {
          id: 'file-4',
          name: 'Plan 1.jpg',
          type: 'file',
          size: 5500000,
          contentType: 'image/jpeg',
          updatedAt: new Date(2025, 4, 5),
          parentId: 'folder-2'
        },
        {
          id: 'file-5',
          name: 'Fasad.jpg',
          type: 'file',
          size: 4800000,
          contentType: 'image/jpeg',
          updatedAt: new Date(2025, 4, 2),
          parentId: 'folder-2'
        },
        {
          id: 'file-6',
          name: 'Konstruktionsdetaljer.pdf',
          type: 'file',
          size: 8500000,
          contentType: 'application/pdf',
          updatedAt: new Date(2025, 3, 28),
          parentId: 'folder-2'
        }
      ]
    },
    {
      id: 'folder-3',
      name: 'Foton',
      type: 'folder',
      updatedAt: new Date(2025, 3, 20),
      children: [
        {
          id: 'file-7',
          name: 'Byggarbetsplats1.jpg',
          type: 'file',
          size: 7800000,
          contentType: 'image/jpeg',
          updatedAt: new Date(2025, 3, 20),
          parentId: 'folder-3'
        }
      ]
    },
    {
      id: 'file-8',
      name: 'Projektöversikt.xlsx',
      type: 'file',
      size: 680000,
      contentType: 'application/vnd.ms-excel',
      updatedAt: new Date(2025, 4, 12)
    }
  ];
  
  // Function to get current displayed files based on path
  const getCurrentFiles = (): FileNode[] => {
    if (!currentFolder) {
      return fileStructure;
    }
    
    // Find the current folder by traversing the path
    let current: FileNode[] = fileStructure;
    let folder: FileNode | undefined;
    
    for (const pathItem of path) {
      folder = current.find(f => f.id === pathItem.id);
      if (folder && folder.children) {
        current = folder.children;
      } else {
        return [];
      }
    }
    
    return current;
  };
  
  // Handle folder navigation
  const handleFolderClick = (folder: FileNode) => {
    setPath([...path, folder]);
    setCurrentFolder(folder.id);
    setSelectedFile(null);
  };
  
  // Handle file selection
  const handleFileClick = (file: FileNode) => {
    setSelectedFile(file);
  };
  
  // Navigate up to parent folder
  const navigateUp = () => {
    if (path.length > 0) {
      const newPath = [...path];
      newPath.pop();
      setPath(newPath);
      setCurrentFolder(newPath.length > 0 ? newPath[newPath.length - 1].id : null);
      setSelectedFile(null);
    }
  };
  
  // Navigate to specific path item
  const navigateToPath = (index: number) => {
    const newPath = path.slice(0, index + 1);
    setPath(newPath);
    setCurrentFolder(newPath.length > 0 ? newPath[newPath.length - 1].id : null);
    setSelectedFile(null);
  };
  
  const displayedFiles = getCurrentFiles();
  
  return (
    <Box sx={{ p: 1 }}>
      <Typography level="h1" sx={{ mb: 3 }}>Vault</Typography>
      
      <Tabs 
        value={activeTab} 
        onChange={(e, value) => setActiveTab(value as string)}
        sx={{ mb: 2 }}
      >
        <TabList>
          <Tab value="files">Filer</Tab>
          <Tab value="reviews">Granskningar</Tab>
          <Tab value="comments">Kommentarer</Tab>
          <Tab value="meetings">Möten</Tab>
          <Tab value="versions">Versioner</Tab>
        </TabList>
      </Tabs>
      
      <TabPanel value="files" sx={{ p: 0 }}>
        <Grid container spacing={2}>
          <Grid xs={12}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                  <IconButton 
                    disabled={path.length === 0} 
                    onClick={navigateUp}
                    variant="plain"
                    color="neutral"
                  >
                    <ArrowBackIcon />
                  </IconButton>
                </Box>
                
                <Breadcrumbs sx={{ flex: 1 }}>
                  <Link 
                    component="button"
                    onClick={() => { setPath([]); setCurrentFolder(null); }}
                    underline="hover"
                  >
                    Root
                  </Link>
                  {path.map((item, index) => (
                    <Link
                      key={item.id}
                      component="button"
                      onClick={() => navigateToPath(index)}
                      underline="hover"
                    >
                      {item.name}
                    </Link>
                  ))}
                </Breadcrumbs>
                
                <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                  <Input size="sm" placeholder="Sök filer..." startDecorator={<SearchIcon />} />
                  <Button startDecorator={<UploadIcon />} size="sm">Ladda upp</Button>
                  <Button startDecorator={<AddIcon />} size="sm">Ny mapp</Button>
                </Box>
              </Box>
            </Card>
          </Grid>
          
          <Grid xs={12} md={selectedFile ? 8 : 12}>
            <Card variant="outlined">
              <Table
                borderAxis="both"
                size="md"
                stickyHeader
                sx={{
                  '& tr:hover': {
                    backgroundColor: 'background.level1'
                  }
                }}
              >
                <thead>
                  <tr>
                    <th style={{ width: '50%' }}>Namn</th>
                    <th>Storlek</th>
                    <th>Senast ändrad</th>
                    <th style={{ width: '120px' }}>Åtgärder</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedFiles.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '32px 0' }}>
                        <Typography level="body-lg">Inga filer eller mappar att visa</Typography>
                      </td>
                    </tr>
                  ) : (
                    displayedFiles.map(item => (
                      <tr 
                        key={item.id}
                        onClick={() => item.type === 'folder' ? handleFolderClick(item) : handleFileClick(item)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {item.type === 'folder' ? 
                              <FolderIcon color="warning" /> : 
                              getFileIcon(item.contentType)
                            }
                            <Typography>{item.name}</Typography>
                          </Box>
                        </td>
                        <td>
                          {item.type === 'folder' ? 
                            `${item.children?.length || 0} objekt` : 
                            formatBytes(item.size || 0)
                          }
                        </td>
                        <td>
                          {item.updatedAt?.toLocaleDateString('sv-SE')}
                        </td>
                        <td>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="sm" variant="plain">
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="sm" variant="plain" color="danger">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card>
          </Grid>
          
          {selectedFile && (
            <Grid xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <Box sx={{ p: 2 }}>
                  <Typography level="title-lg">{selectedFile.name}</Typography>
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FileIcon />
                    <Box sx={{ ml: 2 }}>
                      <Typography level="body-sm" color="neutral">Typ</Typography>
                      <Typography level="body-md">
                        {selectedFile.contentType || 'Okänd filtyp'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography level="body-sm" color="neutral">Storlek</Typography>
                      <Typography level="body-md">
                        {formatBytes(selectedFile.size || 0)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography level="body-sm" color="neutral">Senast ändrad</Typography>
                      <Typography level="body-md">
                        {selectedFile.updatedAt?.toLocaleDateString('sv-SE')} 
                        {selectedFile.updatedAt && ` ${selectedFile.updatedAt.toLocaleTimeString('sv-SE')}`}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button fullWidth>Ladda ner</Button>
                    <Button fullWidth variant="outlined">Visa</Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
          )}
        </Grid>
      </TabPanel>
      
      <TabPanel value="reviews" sx={{ p: 0 }}>
        <Typography level="h3">Granskningar</Typography>
        <Typography>
          Granskningsmodulen är under utveckling. Här kommer granskningspaket och statusar att visas.
        </Typography>
      </TabPanel>
      
      <TabPanel value="comments" sx={{ p: 0 }}>
        <Typography level="h3">Kommentarer</Typography>
        <Typography>
          Kommmentarsmodulen är under utveckling. Här kommer diskussioner och kommentarer om dokument att visas.
        </Typography>
      </TabPanel>
      
      <TabPanel value="meetings" sx={{ p: 0 }}>
        <Typography level="h3">Möten</Typography>
        <Typography>
          Mötesmodulen är under utveckling. Här kommer projektmöten och protokoll att visas.
        </Typography>
      </TabPanel>
      
      <TabPanel value="versions" sx={{ p: 0 }}>
        <Typography level="h3">Versioner</Typography>
        <Typography>
          Versionsmodulen är under utveckling. Här kommer versionshantering för dokument att visas.
        </Typography>
      </TabPanel>
    </Box>
  );
};

export default Vault;