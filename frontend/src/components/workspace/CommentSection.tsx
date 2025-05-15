import React, { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Textarea,
  Button,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Divider
} from '@mui/joy';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import { format } from 'date-fns';

interface FileVersion {
  id: number;
  file_node: number;
}

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_pic: string | null;
}

interface Comment {
  id: number;
  file_version: number;
  user: number;
  user_details: User;
  content: string;
  created_at: string;
  updated_at: string;
}

interface CommentSectionProps {
  fileVersion: FileVersion;
}

const CommentSection: React.FC<CommentSectionProps> = ({ fileVersion }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  // Fetch comments when file version changes
  useEffect(() => {
    const fetchComments = async () => {
      if (!fileVersion) return;
      
      setLoading(true);
      try {
        const response = await axios.get('/api/workspace/comments/', {
          params: {
            file_version: fileVersion.id
          }
        });
        setComments(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments');
      } finally {
        setLoading(false);
      }
    };
    
    fetchComments();
  }, [fileVersion]);
  
  const handleSubmitComment = async () => {
    if (!commentText.trim() || !fileVersion) return;
    
    setSubmitting(true);
    try {
      const response = await axios.post('/api/workspace/comments/', {
        file_version: fileVersion.id,
        content: commentText
      });
      
      // Add new comment to the list
      setComments([...comments, response.data]);
      setCommentText('');
    } catch (err) {
      console.error('Error posting comment:', err);
      setError('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };
  
  const getInitials = (user: User): string => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`;
    }
    return user.username[0].toUpperCase();
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
      {/* Comment list */}
      <Box sx={{ maxHeight: '400px', overflow: 'auto', mb: 2 }}>
        {comments.length === 0 ? (
          <Typography level="body-sm" sx={{ textAlign: 'center', color: 'text.tertiary', py: 4 }}>
            No comments yet. Be the first to comment!
          </Typography>
        ) : (
          <Stack spacing={2}>
            {comments.map((comment) => (
              <Card key={comment.id} variant="outlined" sx={{ bgcolor: 'background.level1' }}>
                <CardContent>
                  <Stack direction="row" spacing={1.5} sx={{ mb: 1 }}>
                    <Avatar size="sm">
                      {comment.user_details.profile_pic ? (
                        <img 
                          src={comment.user_details.profile_pic} 
                          alt={comment.user_details.username} 
                        />
                      ) : (
                        getInitials(comment.user_details)
                      )}
                    </Avatar>
                    <Box>
                      <Typography level="title-sm">
                        {comment.user_details.first_name} {comment.user_details.last_name}
                      </Typography>
                      <Typography level="body-xs" color="text.tertiary">
                        {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography level="body-md" sx={{ whiteSpace: 'pre-wrap' }}>
                    {comment.content}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Comment form */}
      <Box>
        {error && (
          <Typography level="body-sm" color="danger" sx={{ mb: 1 }}>
            {error}
          </Typography>
        )}
        <Textarea
          placeholder="Add a comment..."
          minRows={2}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          sx={{ mb: 1 }}
        />
        <Button
          variant="solid"
          color="primary"
          startDecorator={<SendIcon />}
          onClick={handleSubmitComment}
          loading={submitting}
          disabled={!commentText.trim()}
        >
          Post Comment
        </Button>
      </Box>
    </Box>
  );
};

export default CommentSection;