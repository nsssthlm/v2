import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Stack,
  Divider,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Alert,
  Button,
  IconButton,
  Select,
  Option
} from '@mui/joy';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';
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
  created_by_details: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  updated_at: string;
}

interface FileVersion {
  id: number;
  file_node: number;
  version: number;
  file_url: string;
  content_type: string;
  uploaded_by: number;
  uploaded_by_details: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
}

interface FileViewerProps {
  fileNode: FileNode | null;
}

const FileViewer: React.FC<FileViewerProps> = ({ fileNode }) => {
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<FileVersion | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [binaryFile, setBinaryFile] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  
  // Fetch file versions when fileNode changes
  useEffect(() => {
    if (!fileNode || fileNode.type !== 'file') {
      setVersions([]);
      setSelectedVersion(null);
      setFileContent(null);
      return;
    }
    
    const fetchVersions = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/workspace/file-versions/', {
          params: { file_node: fileNode.id }
        });
        
        // Sort by version (newest first)
        const sortedVersions = response.data.sort((a: FileVersion, b: FileVersion) => 
          b.version - a.version
        );
        
        setVersions(sortedVersions);
        
        // Select the latest version by default
        if (sortedVersions.length > 0) {
          setSelectedVersion(sortedVersions[0]);
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
  
  // Fetch file content when selectedVersion changes
  useEffect(() => {
    if (!selectedVersion) {
      setFileContent(null);
      setBinaryFile(false);
      return;
    }
    
    const fetchFileContent = async () => {
      setLoading(true);
      try {
        // Check if this is a viewable text-based file based on content type
        const isTextBased = selectedVersion.content_type.startsWith('text/') || 
                          ['application/json', 'application/javascript', 'application/xml'].includes(selectedVersion.content_type);
        
        if (isTextBased) {
          // Fetch as text
          const response = await axios.get(selectedVersion.file_url);
          setFileContent(response.data);
          setBinaryFile(false);
        } else {
          // Mark as binary (will show preview or download link)
          setFileContent(null);
          setBinaryFile(true);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching file content:', err);
        setError('Failed to load file content');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFileContent();
  }, [selectedVersion]);
  
  const handleVersionChange = (event: React.SyntheticEvent | null, value: string | null) => {
    if (!value) return;
    
    const versionId = parseInt(value);
    const version = versions.find(v => v.id === versionId);
    if (version) {
      setSelectedVersion(version);
    }
  };
  
  const getInitials = (first: string, last: string) => {
    return `${first[0]}${last[0]}`.toUpperCase();
  };
  
  // Determine content preview based on file type
  const renderFilePreview = () => {
    if (!selectedVersion) return null;
    
    // For images, show the image
    if (selectedVersion.content_type.startsWith('image/')) {
      return (
        <Box sx={{ textAlign: 'center', p: 2 }}>
          <img 
            src={selectedVersion.file_url} 
            alt={fileNode?.name} 
            style={{ maxWidth: '100%', maxHeight: '500px' }} 
          />
        </Box>
      );
    }
    
    // For PDFs, show an iframe
    if (selectedVersion.content_type === 'application/pdf') {
      return (
        <Box sx={{ height: '500px', width: '100%' }}>
          <iframe 
            src={`${selectedVersion.file_url}#view=FitH`}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title={fileNode?.name}
          />
        </Box>
      );
    }
    
    // For text-based files, show the content
    if (fileContent !== null) {
      return (
        <Box 
          sx={{ 
            p: 2, 
            maxHeight: '500px', 
            overflow: 'auto',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            bgcolor: 'background.level1',
            borderRadius: 'sm',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          {fileContent}
        </Box>
      );
    }
    
    // For other binary files, show download link
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        p: 4
      }}>
        <Typography level="body-lg" sx={{ color: 'text.tertiary', mb: 2 }}>
          This file type cannot be previewed directly
        </Typography>
        <Button
          startDecorator={<DownloadIcon />}
          component="a"
          href={selectedVersion.file_url}
          download
        >
          Download File
        </Button>
      </Box>
    );
  };
  
  if (!fileNode) {
    return (
      <Card variant="outlined" sx={{ height: '100%' }}>
        <CardContent sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          p: 4
        }}>
          <InsertDriveFileIcon sx={{ fontSize: 60, color: 'text.tertiary', mb: 2 }} />
          <Typography level="body-lg" sx={{ color: 'text.tertiary' }}>
            Select a file to view
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  if (fileNode.type === 'folder') {
    return (
      <Card variant="outlined" sx={{ height: '100%' }}>
        <CardContent sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          p: 4
        }}>
          <Typography level="body-lg" sx={{ color: 'text.tertiary' }}>
            {fileNode.name} is a folder. Select a file to view its contents.
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  if (loading && !selectedVersion) {
    return (
      <Card variant="outlined" sx={{ height: '100%' }}>
        <CardContent sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          p: 4
        }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        {error && (
          <Alert color="danger" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* File header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography level="h4">
              <InsertDriveFileIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              {fileNode.name}
            </Typography>
            
            <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
              <Typography level="body-sm" sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
                {fileNode.created_by_details.first_name} {fileNode.created_by_details.last_name}
              </Typography>
              
              <Typography level="body-sm" sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                {format(new Date(fileNode.updated_at), 'MMM d, yyyy h:mm a')}
              </Typography>
            </Stack>
          </Box>
          
          {/* Action buttons */}
          {selectedVersion && (
            <Box>
              <IconButton
                color="primary"
                variant="outlined"
                component="a"
                href={selectedVersion.file_url}
                download
                title="Download"
              >
                <DownloadIcon />
              </IconButton>
            </Box>
          )}
        </Stack>
        
        {/* Version selector */}
        {versions.length > 0 && (
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Typography level="body-sm">Version:</Typography>
            <Select
              value={selectedVersion?.id.toString() || ''}
              onChange={handleVersionChange}
              size="sm"
              sx={{ minWidth: 150 }}
              startDecorator={<HistoryIcon />}
            >
              {versions.map((version) => (
                <Option key={version.id} value={version.id.toString()}>
                  v{version.version} - {format(new Date(version.created_at), 'MMM d, yyyy')}
                </Option>
              ))}
            </Select>
          </Stack>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        {/* File content with tabs for content and comments */}
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v as number)}>
          <TabList sx={{ mb: 2 }}>
            <Tab>Content</Tab>
            <Tab>Comments</Tab>
          </TabList>
          
          <TabPanel value={0}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress />
              </Box>
            ) : (
              renderFilePreview()
            )}
          </TabPanel>
          
          <TabPanel value={1}>
            {selectedVersion && (
              <CommentSection fileVersion={selectedVersion} />
            )}
          </TabPanel>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FileViewer;