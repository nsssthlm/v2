import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  ListItemDecorator,
  Typography,
  CircularProgress,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Button,
  Modal,
  ModalDialog,
  ModalClose,
  FormControl,
  FormLabel,
  Input,
  Alert
} from '@mui/joy';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import axios from 'axios';
import { format } from 'date-fns';

interface FileNode {
  id: number;
  name: string;
  type: 'folder' | 'file';
  project: number;
  parent: number | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  children?: FileNode[];
}

interface FileTreeProps {
  projectId: number;
  onNodeSelect: (node: FileNode) => void;
}

const FileTree: React.FC<FileTreeProps> = ({ projectId, onNodeSelect }) => {
  const [nodes, setNodes] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  
  // For context menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);
  
  // For modal dialogs
  const [newFolderModal, setNewFolderModal] = useState<boolean>(false);
  const [uploadFileModal, setUploadFileModal] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [uploadParentId, setUploadParentId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Fetch files structure for the project
  useEffect(() => {
    if (!projectId) return;
    
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/workspace/files/', {
          params: { project: projectId }
        });
        
        // Convert flat list to tree structure
        const tree = buildFileTree(response.data);
        setNodes(tree);
        setError(null);
      } catch (err) {
        console.error('Error fetching files:', err);
        setError('Failed to load files');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFiles();
  }, [projectId]);
  
  // Build tree structure from flat list of nodes
  const buildFileTree = (flatNodes: FileNode[]): FileNode[] => {
    const nodeMap = new Map<number, FileNode>();
    const rootNodes: FileNode[] = [];
    
    // First pass: create map of all nodes
    flatNodes.forEach(node => {
      const nodeCopy = { ...node, children: [] };
      nodeMap.set(node.id, nodeCopy);
    });
    
    // Second pass: build parent-child relationships
    flatNodes.forEach(node => {
      if (node.parent === null) {
        rootNodes.push(nodeMap.get(node.id)!);
      } else {
        const parent = nodeMap.get(node.parent);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(nodeMap.get(node.id)!);
        }
      }
    });
    
    // Sort root nodes: folders first, then alphabetically
    return sortNodes(rootNodes);
  };
  
  // Sort nodes by type and name
  const sortNodes = (nodes: FileNode[]): FileNode[] => {
    return [...nodes].sort((a, b) => {
      // Sort folders before files
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      
      // Sort alphabetically by name
      return a.name.localeCompare(b.name);
    });
  };
  
  const handleNodeClick = (node: FileNode) => {
    if (node.type === 'folder') {
      toggleFolder(node.id);
    } else {
      onNodeSelect(node);
    }
  };
  
  const toggleFolder = (folderId: number) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };
  
  const handleContextMenu = (event: React.MouseEvent<HTMLElement>, node: FileNode) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
    setSelectedNode(node);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedNode(null);
  };
  
  const handleCreateFolder = (parentId: number | null = null) => {
    handleCloseMenu();
    setUploadParentId(parentId);
    setNewFolderModal(true);
  };
  
  const handleUploadFile = (parentId: number | null = null) => {
    handleCloseMenu();
    setUploadParentId(parentId);
    setUploadFileModal(true);
  };
  
  const submitNewFolder = async () => {
    if (!newFolderName.trim()) {
      setError('Folder name cannot be empty');
      return;
    }
    
    try {
      const response = await axios.post('/api/workspace/files/', {
        name: newFolderName,
        type: 'folder',
        project: projectId,
        parent: uploadParentId
      });
      
      // Add new folder to tree
      const updatedResponse = await axios.get('/api/workspace/files/', {
        params: { project: projectId }
      });
      
      const tree = buildFileTree(updatedResponse.data);
      setNodes(tree);
      
      // Expand parent folder
      if (uploadParentId) {
        setExpandedFolders(prev => {
          const newSet = new Set(prev);
          newSet.add(uploadParentId);
          return newSet;
        });
      }
      
      setNewFolderModal(false);
      setNewFolderName('');
      setError(null);
    } catch (err) {
      console.error('Error creating folder:', err);
      setError('Failed to create folder');
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const submitFileUpload = async () => {
    if (!selectedFile) {
      setError('No file selected');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', selectedFile.name);
    formData.append('project', projectId.toString());
    if (uploadParentId !== null) {
      formData.append('parent', uploadParentId.toString());
    }
    
    try {
      await axios.post('/api/workspace/files/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Refresh tree
      const response = await axios.get('/api/workspace/files/', {
        params: { project: projectId }
      });
      
      const tree = buildFileTree(response.data);
      setNodes(tree);
      
      // Expand parent folder
      if (uploadParentId) {
        setExpandedFolders(prev => {
          const newSet = new Set(prev);
          newSet.add(uploadParentId);
          return newSet;
        });
      }
      
      setUploadFileModal(false);
      setSelectedFile(null);
      setError(null);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file');
    }
  };
  
  const handleDeleteNode = async () => {
    if (!selectedNode) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedNode.name}?`)) {
      handleCloseMenu();
      return;
    }
    
    try {
      await axios.delete(`/api/workspace/files/${selectedNode.id}/`);
      
      // Refresh tree
      const response = await axios.get('/api/workspace/files/', {
        params: { project: projectId }
      });
      
      const tree = buildFileTree(response.data);
      setNodes(tree);
      
      handleCloseMenu();
    } catch (err) {
      console.error('Error deleting node:', err);
      setError('Failed to delete');
      handleCloseMenu();
    }
  };
  
  // Recursive component to render file nodes
  const renderNode = (node: FileNode, depth = 0) => {
    const isExpanded = expandedFolders.has(node.id);
    
    return (
      <React.Fragment key={node.id}>
        <ListItem 
          sx={{ 
            pl: `${depth * 24 + 8}px`,
            py: 0.5
          }}
        >
          <ListItemButton
            onClick={() => handleNodeClick(node)}
            selected={false} // Replace with selection logic if needed
            sx={{ borderRadius: 'sm' }}
            onContextMenu={(e) => handleContextMenu(e, node)}
          >
            <ListItemDecorator>
              {node.type === 'folder' ? (
                <FolderIcon color="primary" />
              ) : (
                <InsertDriveFileIcon />
              )}
            </ListItemDecorator>
            <ListItemContent>
              <Typography level="body-sm">{node.name}</Typography>
            </ListItemContent>
            
            <IconButton 
              size="sm"
              variant="plain"
              color="neutral"
              onClick={(e) => {
                e.stopPropagation();
                handleContextMenu(e, node);
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </ListItemButton>
        </ListItem>
        
        {node.type === 'folder' && isExpanded && node.children && node.children.length > 0 && (
          <List>
            {sortNodes(node.children).map(childNode => renderNode(childNode, depth + 1))}
          </List>
        )}
      </React.Fragment>
    );
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size="sm" />
      </Box>
    );
  }
  
  return (
    <Box>
      {error && (
        <Alert color="danger" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Action buttons */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button 
          size="sm" 
          variant="outlined"
          color="primary"
          startDecorator={<CreateNewFolderIcon />}
          onClick={() => handleCreateFolder(null)}
        >
          New Folder
        </Button>
        <Button 
          size="sm" 
          variant="outlined"
          color="primary"
          startDecorator={<UploadFileIcon />}
          onClick={() => handleUploadFile(null)}
        >
          Upload
        </Button>
      </Stack>
      
      {/* File tree */}
      <List size="sm">
        {nodes.length === 0 ? (
          <Typography level="body-sm" sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}>
            No files or folders yet
          </Typography>
        ) : (
          nodes.map(node => renderNode(node))
        )}
      </List>
      
      {/* Context menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        placement="bottom-end"
      >
        {selectedNode?.type === 'folder' && (
          <>
            <MenuItem onClick={() => handleCreateFolder(selectedNode.id)}>
              <ListItemDecorator>
                <CreateNewFolderIcon fontSize="small" />
              </ListItemDecorator>
              New Folder
            </MenuItem>
            <MenuItem onClick={() => handleUploadFile(selectedNode.id)}>
              <ListItemDecorator>
                <UploadFileIcon fontSize="small" />
              </ListItemDecorator>
              Upload File
            </MenuItem>
          </>
        )}
        <MenuItem onClick={handleDeleteNode} color="danger">
          <ListItemDecorator sx={{ color: 'danger.500' }}>
            <InsertDriveFileIcon fontSize="small" />
          </ListItemDecorator>
          Delete
        </MenuItem>
      </Menu>
      
      {/* New folder modal */}
      <Modal open={newFolderModal} onClose={() => setNewFolderModal(false)}>
        <ModalDialog>
          <ModalClose />
          <Typography level="h4">Create New Folder</Typography>
          <FormControl sx={{ mt: 2 }}>
            <FormLabel>Folder Name</FormLabel>
            <Input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name..."
            />
          </FormControl>
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button variant="plain" color="neutral" onClick={() => setNewFolderModal(false)}>
              Cancel
            </Button>
            <Button onClick={submitNewFolder}>Create</Button>
          </Stack>
        </ModalDialog>
      </Modal>
      
      {/* Upload file modal */}
      <Modal open={uploadFileModal} onClose={() => setUploadFileModal(false)}>
        <ModalDialog>
          <ModalClose />
          <Typography level="h4">Upload File</Typography>
          <Box sx={{ mt: 2 }}>
            <input
              accept="*/*"
              style={{ display: 'none' }}
              id="file-upload-input"
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="file-upload-input">
              <Button 
                component="span"
                variant="outlined"
                color="neutral"
                fullWidth
                startDecorator={<UploadFileIcon />}
              >
                Select File
              </Button>
            </label>
            {selectedFile && (
              <Typography level="body-sm" sx={{ mt: 1 }}>
                Selected: {selectedFile.name}
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button variant="plain" color="neutral" onClick={() => setUploadFileModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitFileUpload}
              disabled={!selectedFile}
            >
              Upload
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default FileTree;