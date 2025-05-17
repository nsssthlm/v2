import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Stack,
  Divider,
  Input,
  Grid,
  Textarea,
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  IconButton,
  Alert
} from '@mui/joy';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import ArticleIcon from '@mui/icons-material/Article';
import axios from 'axios';
import { format } from 'date-fns';
import { useParams, useNavigate } from 'react-router-dom';

interface WikiArticle {
  id: number;
  title: string;
  content: string;
  project: number;
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

interface WikiViewProps {
  projectId: number;
}

const WikiView: React.FC<WikiViewProps> = ({ projectId }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<WikiArticle | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [newArticle, setNewArticle] = useState<boolean>(false);
  
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  
  // Fetch articles for the project
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/workspace/wiki/', {
          params: { project: projectId }
        });
        setArticles(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching wiki articles:', err);
        setError('Failed to load wiki articles');
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticles();
  }, [projectId]);
  
  // Load selected article by ID from URL params
  useEffect(() => {
    if (id && articles.length > 0) {
      const article = articles.find(a => a.id === parseInt(id));
      if (article) {
        setSelectedArticle(article);
        setTitle(article.title);
        setContent(article.content);
      } else {
        setError(`Article with ID ${id} not found`);
      }
    } else if (articles.length > 0 && !id) {
      // Select first article by default if no ID in URL
      setSelectedArticle(articles[0]);
      setTitle(articles[0].title);
      setContent(articles[0].content);
    }
  }, [id, articles]);
  
  const handleArticleSelect = (article: WikiArticle) => {
    if (editMode || newArticle) {
      if (!confirm('Discard unsaved changes?')) {
        return;
      }
    }
    
    setSelectedArticle(article);
    setTitle(article.title);
    setContent(article.content);
    setEditMode(false);
    setNewArticle(false);
    navigate(`/workspace/wiki/${article.id}`);
  };
  
  const handleNewArticle = () => {
    if (editMode || newArticle) {
      if (!confirm('Discard unsaved changes?')) {
        return;
      }
    }
    
    setSelectedArticle(null);
    setTitle('');
    setContent('');
    setEditMode(false);
    setNewArticle(true);
    navigate('/workspace/wiki/new');
  };
  
  const handleEditToggle = () => {
    if (newArticle) return;
    setEditMode(!editMode);
  };
  
  const handleCancel = () => {
    if (newArticle) {
      setNewArticle(false);
      if (articles.length > 0) {
        handleArticleSelect(articles[0]);
      } else {
        setSelectedArticle(null);
        setTitle('');
        setContent('');
      }
    } else if (editMode) {
      setEditMode(false);
      // Reset to original values
      if (selectedArticle) {
        setTitle(selectedArticle.title);
        setContent(selectedArticle.content);
      }
    }
  };
  
  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    setLoading(true);
    try {
      if (newArticle) {
        // Create new article
        const response = await axios.post('/api/workspace/wiki/', {
          title,
          content,
          project: projectId
        });
        
        // Add to article list and select it
        const newArticleData = response.data;
        setArticles([...articles, newArticleData]);
        setSelectedArticle(newArticleData);
        setNewArticle(false);
        navigate(`/workspace/wiki/${newArticleData.id}`);
      } else if (editMode && selectedArticle) {
        // Update existing article
        const response = await axios.put(`/api/workspace/wiki/${selectedArticle.id}/`, {
          title,
          content,
          project: projectId
        });
        
        // Update article in list
        const updatedArticle = response.data;
        setArticles(articles.map(a => a.id === updatedArticle.id ? updatedArticle : a));
        setSelectedArticle(updatedArticle);
        setEditMode(false);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error saving wiki article:', err);
      setError('Failed to save article');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!selectedArticle) return;
    
    if (!confirm(`Are you sure you want to delete "${selectedArticle.title}"?`)) {
      return;
    }
    
    setLoading(true);
    try {
      await axios.delete(`/api/workspace/wiki/${selectedArticle.id}/`);
      
      // Remove from article list
      const newArticleList = articles.filter(a => a.id !== selectedArticle.id);
      setArticles(newArticleList);
      
      // Select another article if available
      if (newArticleList.length > 0) {
        handleArticleSelect(newArticleList[0]);
      } else {
        setSelectedArticle(null);
        setTitle('');
        setContent('');
      }
    } catch (err) {
      console.error('Error deleting wiki article:', err);
      setError('Failed to delete article');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !selectedArticle && !newArticle) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Grid container spacing={2} sx={{ height: '100%' }}>
      {/* Article sidebar */}
      <Grid xs={12} md={3}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography level="title-lg">Wiki Articles</Typography>
              <Button 
                startDecorator={<AddIcon />} 
                size="sm"
                onClick={handleNewArticle}
              >
                New
              </Button>
            </Stack>
            
            <Divider sx={{ my: 1 }} />
            
            <List>
              {articles.length === 0 ? (
                <ListItem>
                  <ListItemContent>
                    <Typography level="body-sm" sx={{ color: 'text.tertiary', fontStyle: 'italic' }}>
                      No articles yet
                    </Typography>
                  </ListItemContent>
                </ListItem>
              ) : (
                articles.map((article) => (
                  <ListItem key={article.id}>
                    <ListItemButton 
                      selected={selectedArticle?.id === article.id}
                      onClick={() => handleArticleSelect(article)}
                    >
                      <ListItemContent>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <ArticleIcon fontSize="small" />
                          <Typography level="body-sm">{article.title}</Typography>
                        </Stack>
                      </ListItemContent>
                    </ListItemButton>
                  </ListItem>
                ))
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>
      
      {/* Article content */}
      <Grid xs={12} md={9}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            {error && (
              <Alert color="danger" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {!selectedArticle && !newArticle ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%',
                p: 4
              }}>
                <Typography level="body-lg" sx={{ color: 'text.tertiary', mb: 2 }}>
                  Select an article or create a new one
                </Typography>
                <Button 
                  startDecorator={<AddIcon />}
                  onClick={handleNewArticle}
                >
                  Create New Article
                </Button>
              </Box>
            ) : (
              <>
                <Stack 
                  direction="row" 
                  justifyContent="space-between" 
                  alignItems="center" 
                  sx={{ mb: 2 }}
                >
                  {/* Title (editable or static) */}
                  {editMode || newArticle ? (
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Article Title"
                      size="lg"
                      sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}
                    />
                  ) : (
                    <Typography level="h3">{selectedArticle?.title}</Typography>
                  )}
                  
                  {/* Action buttons */}
                  <Stack direction="row" spacing={1}>
                    {editMode || newArticle ? (
                      <>
                        <Button 
                          startDecorator={<SaveIcon />}
                          onClick={handleSave}
                          loading={loading}
                        >
                          Save
                        </Button>
                        <Button 
                          startDecorator={<CancelIcon />}
                          variant="soft"
                          color="neutral"
                          onClick={handleCancel}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <IconButton 
                          variant="outlined"
                          color="neutral"
                          onClick={handleEditToggle}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          variant="outlined"
                          color="danger"
                          onClick={handleDelete}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </Stack>
                </Stack>
                
                {selectedArticle && !editMode && !newArticle && (
                  <Typography level="body-xs" sx={{ color: 'text.tertiary', mb: 2 }}>
                    Last updated: {format(new Date(selectedArticle.updated_at), 'MMM d, yyyy h:mm a')} by {selectedArticle.created_by_details.first_name} {selectedArticle.created_by_details.last_name}
                  </Typography>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                {/* Content (editable or static) */}
                {editMode || newArticle ? (
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Article content..."
                    minRows={10}
                    sx={{ width: '100%' }}
                  />
                ) : (
                  <Box sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedArticle?.content}
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default WikiView;