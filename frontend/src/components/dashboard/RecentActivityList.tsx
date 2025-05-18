import React from 'react';
import { Box, Card, Typography, IconButton, List, ListItem, Avatar } from '@mui/joy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CommentIcon from '@mui/icons-material/Comment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

interface ActivityItem {
  id: number;
  icon: string;
  text: string;
  time: string;
  user?: string;
}

interface RecentActivityListProps {
  title: string;
  activities: ActivityItem[];
}

const RecentActivityList = ({ title, activities }: RecentActivityListProps) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload':
        return <ArrowUpwardIcon sx={{ color: '#60cd18' }} />;
      case 'download':
        return <FileDownloadIcon sx={{ color: '#1976d2' }} />;
      case 'comment':
        return <CommentIcon sx={{ color: '#ff9800' }} />;
      case 'user':
        return <AccountCircleIcon sx={{ color: '#9e9e9e' }} />;
      default:
        return <CommentIcon sx={{ color: '#9e9e9e' }} />;
    }
  };

  return (
    <Card variant="plain" sx={{ 
      p: 2, 
      height: '100%',
      bgcolor: 'background.surface', 
      boxShadow: 'none',
      borderRadius: 'lg',
      border: '1px solid',
      borderColor: 'divider'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography level="title-sm" sx={{ 
          textTransform: 'uppercase', 
          letterSpacing: '0.5px',
          color: 'text.secondary',
          fontWeight: 'medium'
        }}>
          {title}
        </Typography>
        <IconButton variant="plain" color="neutral" size="sm">
          <MoreVertIcon />
        </IconButton>
      </Box>
      
      <List sx={{ '--ListItem-paddingY': '0.75rem' }}>
        {activities.map((activity) => (
          <ListItem
            key={activity.id}
            sx={{ 
              alignItems: 'flex-start',
              gap: 2,
              borderBottom: '1px solid',
              borderColor: 'rgba(0, 0, 0, 0.05)',
              py: 1.5,
              '&:last-child': {
                borderBottom: 'none'
              },
              '&:hover': {
                bgcolor: '#e0f2e9'
              }
            }}
          >
            <Avatar 
              size="sm" 
              sx={{ 
                bgcolor: activity.icon === 'upload' ? '#e0f2e9' : 'background.level1',
                color: activity.icon === 'upload' ? '#e0f2e9' : 
                       activity.icon === 'comment' ? '#e0f2e9' :
                       activity.icon === 'download' ? '#e0f2e9' : '#e0f2e9',
                mt: 0.5,
                fontSize: '1rem'
              }}
            >
              {getActivityIcon(activity.icon)}
            </Avatar>
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography 
                level="body-sm" 
                sx={{ 
                  color: activity.icon === 'upload' ? '#60cd18' : 'text.primary',
                  fontWeight: activity.icon === 'upload' ? 'medium' : 'normal'
                }}
              >
                {activity.text}
              </Typography>
              <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5 }}>
                {activity.time}
              </Typography>
            </Box>
          </ListItem>
        ))}
      </List>
    </Card>
  );
};

export default RecentActivityList;