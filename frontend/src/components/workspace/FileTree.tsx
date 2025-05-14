import React, { useState, useEffect } from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemContent,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  CircularProgress
} from '@mui/joy';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

interface FileNode {
  id: number;
  name: string;
  type: 'folder' | 'file';
  project: number;
  parent: number | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}

interface FileTreeProps {
  projectId: number;
  onNodeSelect: (node: FileNode) => void;
}

const FileTree: React.FC<FileTreeProps> = ({ projectId, onNodeSelect }) => {
  const [nodes, setNodes] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<number | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);
  const [path, setPath] = useState<{ id: number | null; name: string }[]>([{ id: null, name: 'Root' }]);

  // Load files and folders for current directory
  useEffect(() => {
    const fetchNodes = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/workspace/files/`, {
          params: {
            project: projectId,
            parent: currentFolder,
          },
        });
        setNodes(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching file nodes:', err);
        setError('Failed to load files and folders');
      } finally {
        setLoading(false);
      }
    };

    fetchNodes();
  }, [projectId, currentFolder]);

  const handleNodeClick = (node: FileNode) => {
    if (node.type === 'folder') {
      // Navigate into folder
      setCurrentFolder(node.id);
      setPath([...path, { id: node.id, name: node.name }]);
    } else {
      // Select file
      onNodeSelect(node);
    }
  };

  const handlePathClick = (pathItem: { id: number | null; name: string }, index: number) => {
    // Navigate to a specific folder in the path
    setCurrentFolder(pathItem.id);
    setPath(path.slice(0, index + 1));
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, node: FileNode) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedNode(node);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedNode(null);
  };

  const handleNewFolder = async () => {
    // This would be replaced with a modal for name input
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;
    
    try {
      await axios.post('/api/workspace/files/', {
        name: folderName,
        type: 'folder',
        project: projectId,
        parent: currentFolder,
      });
      // Refresh the list
      const response = await axios.get(`/api/workspace/files/`, {
        params: {
          project: projectId,
          parent: currentFolder,
        },
      });
      setNodes(response.data);
    } catch (err) {
      console.error('Error creating folder:', err);
      setError('Failed to create folder');
    }
    
    handleMenuClose();
  };

  const handleUploadFile = () => {
    // This would trigger a file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (!target.files || target.files.length === 0) return;
      
      const file = target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);
      formData.append('type', 'file');
      formData.append('project', projectId.toString());
      if (currentFolder) {
        formData.append('parent', currentFolder.toString());
      }
      
      try {
        // First create the file node
        const nodeResponse = await axios.post('/api/workspace/files/', formData);
        
        // Then create the file version
        const versionFormData = new FormData();
        versionFormData.append('file', file);
        versionFormData.append('file_node', nodeResponse.data.id);
        
        await axios.post('/api/workspace/versions/', versionFormData);
        
        // Refresh the list
        const response = await axios.get(`/api/workspace/files/`, {
          params: {
            project: projectId,
            parent: currentFolder,
          },
        });
        setNodes(response.data);
      } catch (err) {
        console.error('Error uploading file:', err);
        setError('Failed to upload file');
      }
    };
    fileInput.click();
    
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!selectedNode) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedNode.name}?`)) {
      handleMenuClose();
      return;
    }
    
    try {
      await axios.delete(`/api/workspace/files/${selectedNode.id}/`);
      
      // Refresh the list
      const response = await axios.get(`/api/workspace/files/`, {
        params: {
          project: projectId,
          parent: currentFolder,
        },
      });
      setNodes(response.data);
    } catch (err) {
      console.error('Error deleting node:', err);
      setError('Failed to delete item');
    }
    
    handleMenuClose();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, color: 'danger.500' }}>
        <Typography level="body-sm">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.surface' }}>
      {/* Breadcrumb navigation */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        {path.map((item, index) => (
          <React.Fragment key={index}>
            <Typography
              component="span"
              sx={{
                cursor: 'pointer',
                color: index === path.length - 1 ? 'primary.500' : 'text.secondary',
                '&:hover': { textDecoration: 'underline' },
                fontWeight: index === path.length - 1 ? 'bold' : 'normal',
              }}
              onClick={() => handlePathClick(item, index)}
            >
              {item.name}
            </Typography>
            {index < path.length - 1 && (
              <Typography component="span" sx={{ mx: 0.5, color: 'text.tertiary' }}>
                /
              </Typography>
            )}
          </React.Fragment>
        ))}
      </Box>

      {/* Action buttons */}
      <Box sx={{ display: 'flex', p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <IconButton onClick={handleNewFolder} size="sm" variant="plain" color="neutral">
          <CreateNewFolderIcon />
        </IconButton>
        <IconButton onClick={handleUploadFile} size="sm" variant="plain" color="neutral">
          <UploadFileIcon />
        </IconButton>
      </Box>

      {/* File/folder list */}
      <List>
        {nodes.length === 0 ? (
          <ListItem>
            <ListItemContent>
              <Typography level="body-sm" sx={{ fontStyle: 'italic', color: 'text.tertiary' }}>
                This folder is empty
              </Typography>
            </ListItemContent>
          </ListItem>
        ) : (
          nodes.map((node) => (
            <ListItem
              key={node.id}
              endAction={
                <IconButton size="sm" variant="plain" color="neutral" onClick={(e) => handleMenuOpen(e, node)}>
                  <MoreVertIcon />
                </IconButton>
              }
            >
              <ListItemButton onClick={() => handleNodeClick(node)}>
                <ListItemIcon>
                  {node.type === 'folder' ? <FolderIcon color="primary" /> : <InsertDriveFileIcon />}
                </ListItemIcon>
                <ListItemContent>
                  <Typography level="body-sm">{node.name}</Typography>
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>

      {/* Context menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        placement="bottom-end"
      >
        {selectedNode?.type === 'folder' && (
          <MenuItem onClick={handleNewFolder}>
            <ListItemIcon>
              <CreateNewFolderIcon fontSize="small" />
            </ListItemIcon>
            <ListItemContent>New Folder</ListItemContent>
          </MenuItem>
        )}
        {selectedNode?.type === 'folder' && (
          <MenuItem onClick={handleUploadFile}>
            <ListItemIcon>
              <UploadFileIcon fontSize="small" />
            </ListItemIcon>
            <ListItemContent>Upload File</ListItemContent>
          </MenuItem>
        )}
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemContent>Rename</ListItemContent>
        </MenuItem>
        <Divider />
        <MenuItem color="danger" onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemContent>Delete</ListItemContent>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default FileTree;