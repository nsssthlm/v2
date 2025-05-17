import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemContent,
  Divider,
  IconButton,
  Button,
} from '@mui/joy';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ArticleIcon from '@mui/icons-material/Article';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Textarea from '@mui/joy/Textarea';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

interface ProjectDashboard {
  id: number;
  project: number;
  welcome_message: string;
  show_recent_files: boolean;
  show_recent_wiki: boolean;
  show_team_activity: boolean;
  custom_config: any;
}

interface FileNode {
  id: number;
  name: string;
  type: string;
  updated_at: string;
}

interface WikiArticle {
  id: number;
  title: string;
  updated_at: string;
}

interface PDFDocument {
  id: number;
  title: string;
  updated_at: string;
}

interface Activity {
  type: string;
  item_id: number;
  item_name: string;
  user_name: string;
  timestamp: string;
}

interface DashboardProps {
  projectId: number;
}

const Dashboard: React.FC<DashboardProps> = ({ projectId }) => {
  const [dashboard, setDashboard] = useState<ProjectDashboard | null>(null);
  const [recentFiles, setRecentFiles] = useState<FileNode[]>([]);
  const [recentWiki, setRecentWiki] = useState<WikiArticle[]>([]);
  const [recentPdfs, setRecentPdfs] = useState<PDFDocument[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editMessage, setEditMessage] = useState<string>('');
  
  // Fetch dashboard data for the project
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        // Get dashboard config
        const dashboardResponse = await axios.get('/api/workspace/dashboard/for_project', {
          params: { project: projectId }
        });
        setDashboard(dashboardResponse.data);
        setEditMessage(dashboardResponse.data.welcome_message || '');
        
        // Get recent files (top 5)
        const filesResponse = await axios.get('/api/workspace/files/', {
          params: {
            project: projectId,
            ordering: '-updated_at',
            limit: 5
          }
        });
        setRecentFiles(filesResponse.data.slice(0, 5));
        
        // Get recent wiki articles (top 5)
        const wikiResponse = await axios.get('/api/workspace/wiki/', {
          params: {
            project: projectId,
            ordering: '-updated_at',
            limit: 5
          }
        });
        setRecentWiki(wikiResponse.data.slice(0, 5));
        
        // Get recent PDFs (top 5)
        const pdfResponse = await axios.get('/api/workspace/pdf/', {
          params: {
            project: projectId,
            ordering: '-updated_at',
            limit: 5
          }
        });
        setRecentPdfs(pdfResponse.data.slice(0, 5));
        
        // For activities, in a real app we would fetch from an activity log
        // Here we'll create some sample activities based on the actual data
        const allItems = [
          ...filesResponse.data.map((file: FileNode) => ({
            type: 'file',
            item_id: file.id,
            item_name: file.name,
            user_name: 'Team Member',
            timestamp: file.updated_at
          })),
          ...wikiResponse.data.map((wiki: WikiArticle) => ({
            type: 'wiki',
            item_id: wiki.id,
            item_name: wiki.title,
            user_name: 'Team Member',
            timestamp: wiki.updated_at
          })),
          ...pdfResponse.data.map((pdf: PDFDocument) => ({
            type: 'pdf',
            item_id: pdf.id,
            item_name: pdf.title,
            user_name: 'Team Member',
            timestamp: pdf.updated_at
          }))
        ];
        
        // Sort by timestamp and take the most recent 10
        allItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setActivities(allItems.slice(0, 10));
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
  }, [projectId]);
  
  const handleSaveMessage = async () => {
    if (!dashboard) return;
    
    try {
      const response = await axios.patch(`/api/workspace/dashboard/${dashboard.id}/`, {
        welcome_message: editMessage
      });
      
      setDashboard(response.data);
      setEditMode(false);
    } catch (err) {
      console.error('Error updating welcome message:', err);
      setError('Failed to update welcome message');
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 2 }}>
      {error && (
        <Typography color="danger" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      {/* Welcome card */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography level="h4">Workspace Dashboard</Typography>
            {editMode ? (
              <Stack direction="row" spacing={1}>
                <Button 
                  startDecorator={<SaveIcon />}
                  onClick={handleSaveMessage}
                >
                  Save
                </Button>
                <Button 
                  startDecorator={<CancelIcon />}
                  variant="soft"
                  color="neutral"
                  onClick={() => {
                    setEditMode(false);
                    setEditMessage(dashboard?.welcome_message || '');
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            ) : (
              <IconButton 
                variant="outlined"
                color="neutral"
                onClick={() => setEditMode(true)}
              >
                <EditIcon />
              </IconButton>
            )}
          </Stack>
          
          {editMode ? (
            <Textarea
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
              placeholder="Enter a welcome message..."
              minRows={3}
              sx={{ width: '100%' }}
            />
          ) : (
            <Typography level="body-lg">
              {dashboard?.welcome_message || 'Welcome to your project workspace!'}
            </Typography>
          )}
        </CardContent>
      </Card>
      
      <Grid container spacing={3}>
        {/* Recent Files */}
        <Grid xs={12} md={4}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography level="title-lg" sx={{ mb: 2 }}>Recent Files</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                {recentFiles.length === 0 ? (
                  <ListItem>
                    <ListItemContent>
                      <Typography level="body-sm" sx={{ color: 'text.tertiary', fontStyle: 'italic' }}>
                        No files yet
                      </Typography>
                    </ListItemContent>
                  </ListItem>
                ) : (
                  recentFiles.map((file) => (
                    <ListItem key={file.id}>
                      <ListItemContent>
                        <Link 
                          to={`/workspace?project=${projectId}&file=${file.id}`}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <InsertDriveFileIcon fontSize="small" />
                            <Box>
                              <Typography level="body-sm">{file.name}</Typography>
                              <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                                Updated {format(new Date(file.updated_at), 'MMM d, yyyy')}
                              </Typography>
                            </Box>
                          </Stack>
                        </Link>
                      </ListItemContent>
                    </ListItem>
                  ))
                )}
              </List>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button 
                  size="sm"
                  component={Link}
                  to={`/workspace?project=${projectId}`}
                >
                  View All Files
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Wiki Articles */}
        <Grid xs={12} md={4}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography level="title-lg" sx={{ mb: 2 }}>Recent Wiki Articles</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                {recentWiki.length === 0 ? (
                  <ListItem>
                    <ListItemContent>
                      <Typography level="body-sm" sx={{ color: 'text.tertiary', fontStyle: 'italic' }}>
                        No wiki articles yet
                      </Typography>
                    </ListItemContent>
                  </ListItem>
                ) : (
                  recentWiki.map((article) => (
                    <ListItem key={article.id}>
                      <ListItemContent>
                        <Link 
                          to={`/workspace/wiki/${article.id}`}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <ArticleIcon fontSize="small" />
                            <Box>
                              <Typography level="body-sm">{article.title}</Typography>
                              <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                                Updated {format(new Date(article.updated_at), 'MMM d, yyyy')}
                              </Typography>
                            </Box>
                          </Stack>
                        </Link>
                      </ListItemContent>
                    </ListItem>
                  ))
                )}
              </List>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button 
                  size="sm"
                  component={Link}
                  to={`/workspace/wiki`}
                >
                  View All Wiki Articles
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent PDFs */}
        <Grid xs={12} md={4}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography level="title-lg" sx={{ mb: 2 }}>Recent PDF Documents</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                {recentPdfs.length === 0 ? (
                  <ListItem>
                    <ListItemContent>
                      <Typography level="body-sm" sx={{ color: 'text.tertiary', fontStyle: 'italic' }}>
                        No PDF documents yet
                      </Typography>
                    </ListItemContent>
                  </ListItem>
                ) : (
                  recentPdfs.map((pdf) => (
                    <ListItem key={pdf.id}>
                      <ListItemContent>
                        <Link 
                          to={`/workspace/pdf/${pdf.id}`}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <PictureAsPdfIcon fontSize="small" color="error" />
                            <Box>
                              <Typography level="body-sm">{pdf.title}</Typography>
                              <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                                Updated {format(new Date(pdf.updated_at), 'MMM d, yyyy')}
                              </Typography>
                            </Box>
                          </Stack>
                        </Link>
                      </ListItemContent>
                    </ListItem>
                  ))
                )}
              </List>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button 
                  size="sm"
                  component={Link}
                  to={`/workspace/pdf`}
                >
                  View All PDF Documents
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Activity feed */}
        <Grid xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography level="title-lg" sx={{ mb: 2 }}>Recent Activity</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                {activities.length === 0 ? (
                  <ListItem>
                    <ListItemContent>
                      <Typography level="body-sm" sx={{ color: 'text.tertiary', fontStyle: 'italic' }}>
                        No recent activity
                      </Typography>
                    </ListItemContent>
                  </ListItem>
                ) : (
                  activities.map((activity, index) => (
                    <ListItem key={index}>
                      <ListItemContent>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {activity.type === 'file' && <InsertDriveFileIcon fontSize="small" />}
                          {activity.type === 'wiki' && <ArticleIcon fontSize="small" />}
                          {activity.type === 'pdf' && <PictureAsPdfIcon fontSize="small" color="error" />}
                          
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography level="body-sm">
                              <strong>{activity.user_name}</strong> updated{' '}
                              <Chip
                                size="sm"
                                variant="soft"
                                color={
                                  activity.type === 'file' ? 'primary' :
                                  activity.type === 'wiki' ? 'success' : 'danger'
                                }
                              >
                                {activity.type}
                              </Chip>{' '}
                              <strong>{activity.item_name}</strong>
                            </Typography>
                            <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                              {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
                            </Typography>
                          </Box>
                        </Stack>
                      </ListItemContent>
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;