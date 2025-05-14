import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  List,
  ListItem,
  ListItemContent,
  ListItemDecorator,
  Chip,
  Button,
  IconButton,
  Stack,
  Divider
} from '@mui/joy';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import axios from 'axios';
import { format } from 'date-fns';
import CommentSection from './CommentSection';

interface FileNode {
  id: number;
  name: string;
  type: 'folder' | 'file';
  project: number;
  parent: number | null;
  created_by: number;
}

interface FileVersion {
  id: number;
  file_node: number;
  file: string;
  file_url: string;
  version_number: number;
  content_type: string;
  size: number;
  uploaded_by: number;
  uploaded_by_details: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
}

interface FileViewerProps {
  fileNode: FileNode | null;
}

const FileViewer: React.FC<FileViewerProps> = ({ fileNode }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [activeVersion, setActiveVersion] = useState<FileVersion | null>(null);
  
  // Fetch file versions when file changes
  useEffect(() => {
    if (!fileNode || fileNode.type !== 'file') {
      setVersions([]);
      setActiveVersion(null);
      return;
    }
    
    const fetchVersions = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/workspace/versions/', {
          params: {
            file_node: fileNode.id
          }
        });
        setVersions(response.data);
        if (response.data.length > 0) {
          setActiveVersion(response.data[0]); // Latest version
        } else {
          setActiveVersion(null);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching file versions:', err);
        setError('Failed to load file versions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVersions();
  }, [fileNode]);
  
  const handleVersionSelect = (version: FileVersion) => {
    setActiveVersion(version);
  };
  
  const handleUploadNewVersion = () => {
    if (!fileNode) return;
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (!target.files || target.files.length === 0) return;
      
      const file = target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('file_node', fileNode.id.toString());
      
      setLoading(true);
      try {
        const response = await axios.post('/api/workspace/versions/', formData);
        
        // Refresh versions
        const versionsResponse = await axios.get('/api/workspace/versions/', {
          params: {
            file_node: fileNode.id
          }
        });
        setVersions(versionsResponse.data);
        
        // Set active version to the newly uploaded one
        const newVersion = versionsResponse.data.find((v: FileVersion) => v.id === response.data.id);
        if (newVersion) {
          setActiveVersion(newVersion);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error uploading new version:', err);
        setError('Failed to upload new version');
      } finally {
        setLoading(false);
      }
    };
    fileInput.click();
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };
  
  const getFileTypeIcon = (contentType: string): string => {
    if (contentType.startsWith('image/')) return '🖼️';
    if (contentType === 'application/pdf') return '📄';
    if (contentType.includes('spreadsheet') || contentType.includes('excel')) return '📊';
    if (contentType.includes('document') || contentType.includes('word')) return '📝';
    if (contentType.includes('presentation') || contentType.includes('powerpoint')) return '📽️';
    if (contentType.includes('text/')) return '📋';
    return '📁';
  };
  
  if (!fileNode) {
    return (
      <Card variant="outlined" sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography level="body-lg" sx={{ textAlign: 'center', color: 'text.tertiary' }}>
          Select a file to view its contents
        </Typography>
      </Card>
    );
  }
  
  if (fileNode.type === 'folder') {
    return (
      <Card variant="outlined" sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography level="body-lg" sx={{ textAlign: 'center', color: 'text.tertiary' }}>
          This is a folder, not a file
        </Typography>
      </Card>
    );
  }
  
  if (loading) {
    return (
      <Card variant="outlined" sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card variant="outlined" sx={{ height: '100%', p: 2 }}>
        <Typography level="body-lg" color="danger">
          {error}
        </Typography>
      </Card>
    );
  }
  
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography level="h4">{fileNode.name}</Typography>
            <Typography level="body-sm" color="text.tertiary">
              {activeVersion && (
                <>Version {activeVersion.version_number} • {formatFileSize(activeVersion.size)}</>
              )}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button 
              variant="outlined" 
              color="primary" 
              startDecorator={<UploadIcon />}
              onClick={handleUploadNewVersion}
            >
              Upload New Version
            </Button>
            {activeVersion && (
              <IconButton 
                variant="soft" 
                color="primary"
                component="a"
                href={activeVersion.file_url}
                download
              >
                <DownloadIcon />
              </IconButton>
            )}
          </Stack>
        </Stack>
        
        <Divider sx={{ my: 2 }} />
        
        <Tabs defaultValue={0} sx={{ bgcolor: 'background.surface' }}>
          <TabList>
            <Tab>Preview</Tab>
            <Tab startDecorator={<HistoryIcon />}>Version History</Tab>
            <Tab>Comments</Tab>
          </TabList>
          
          <TabPanel value={0}>
            {activeVersion ? (
              <Box sx={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'auto' }}>
                {activeVersion.content_type.startsWith('image/') ? (
                  <img 
                    src={activeVersion.file_url} 
                    alt={fileNode.name}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                ) : activeVersion.content_type === 'application/pdf' ? (
                  <iframe
                    src={`${activeVersion.file_url}#view=fitH`}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title={fileNode.name}
                  />
                ) : (
                  <Box sx={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'background.level1',
                    borderRadius: 'sm',
                    p: 4
                  }}>
                    <Typography fontSize="4rem" sx={{ mb: 2 }}>
                      {getFileTypeIcon(activeVersion.content_type)}
                    </Typography>
                    <Typography level="body-lg">
                      {fileNode.name}
                    </Typography>
                    <Typography level="body-sm" color="text.tertiary">
                      This file type cannot be previewed
                    </Typography>
                    <Button 
                      variant="soft" 
                      color="primary" 
                      sx={{ mt: 2 }}
                      component="a"
                      href={activeVersion.file_url}
                      download
                      startDecorator={<DownloadIcon />}
                    >
                      Download
                    </Button>
                  </Box>
                )}
              </Box>
            ) : (
              <Typography level="body-lg" sx={{ textAlign: 'center', color: 'text.tertiary', p: 4 }}>
                No file versions available
              </Typography>
            )}
          </TabPanel>
          
          <TabPanel value={1}>
            <List>
              {versions.length > 0 ? (
                versions.map((version) => (
                  <ListItem 
                    key={version.id}
                    variant={activeVersion?.id === version.id ? 'soft' : 'plain'}
                    sx={{ 
                      borderRadius: 'sm',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'background.level1' }
                    }}
                    onClick={() => handleVersionSelect(version)}
                  >
                    <ListItemContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography level="title-sm">
                            Version {version.version_number}
                            {version === versions[0] && (
                              <Chip size="sm" variant="soft" color="primary" sx={{ ml: 1 }}>
                                Latest
                              </Chip>
                            )}
                          </Typography>
                          <Typography level="body-xs" startDecorator={<PersonIcon fontSize="small" />}>
                            {version.uploaded_by_details.first_name} {version.uploaded_by_details.last_name}
                          </Typography>
                          <Typography level="body-xs" startDecorator={<AccessTimeIcon fontSize="small" />}>
                            {format(new Date(version.created_at), 'MMM d, yyyy h:mm a')}
                          </Typography>
                        </Box>
                        <IconButton 
                          size="sm" 
                          variant="outlined"
                          component="a"
                          href={version.file_url}
                          download
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </ListItemContent>
                  </ListItem>
                ))
              ) : (
                <Typography level="body-lg" sx={{ textAlign: 'center', color: 'text.tertiary', p: 4 }}>
                  No version history available
                </Typography>
              )}
            </List>
          </TabPanel>
          
          <TabPanel value={2}>
            {activeVersion ? (
              <CommentSection fileVersion={activeVersion} />
            ) : (
              <Typography level="body-lg" sx={{ textAlign: 'center', color: 'text.tertiary', p: 4 }}>
                Select a file version to view comments
              </Typography>
            )}
          </TabPanel>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FileViewer;