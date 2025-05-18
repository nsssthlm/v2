import React from 'react';
import { Box, Typography, Card, List, ListItem, ListItemContent, ListDivider, ListItemDecorator } from '@mui/joy';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';

interface Activity {
  id: number;
  action: string;
  project: string;
  user: string;
  time: string;
}

interface RecentActivityListProps {
  title: string;
  activities: Activity[];
  height?: number | string;
  maxItems?: number;
}

// Hjälpfunktion för att visa aktionsikon
const getActionIcon = (action: string) => {
  const actionLower = action.toLowerCase();
  
  if (actionLower.includes('laddat upp') || actionLower.includes('dokument') || actionLower.includes('ritning')) {
    return <InsertDriveFileOutlinedIcon sx={{ color: '#007934', fontSize: '1.2rem' }} />;
  } else if (actionLower.includes('uppdaterat') || actionLower.includes('ändr')) {
    return <EditOutlinedIcon sx={{ color: '#2196f3', fontSize: '1.2rem' }} />;
  } else if (actionLower.includes('komment')) {
    return <AddCommentOutlinedIcon sx={{ color: '#9c27b0', fontSize: '1.2rem' }} />;
  } else if (actionLower.includes('möte')) {
    return <MeetingRoomOutlinedIcon sx={{ color: '#ff9800', fontSize: '1.2rem' }} />;
  } else if (actionLower.includes('budget')) {
    return <AccountBalanceOutlinedIcon sx={{ color: '#f44336', fontSize: '1.2rem' }} />;
  }
  
  return <InsertDriveFileOutlinedIcon sx={{ color: '#757575', fontSize: '1.2rem' }} />;
};

const RecentActivityList: React.FC<RecentActivityListProps> = ({ 
  title, 
  activities,
  height = 'auto',
  maxItems = 5
}) => {
  // Begränsa antalet aktiviteter som visas
  const displayedActivities = activities.slice(0, maxItems);
  
  return (
    <Card 
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        transition: 'box-shadow 0.2s',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0, 121, 52, 0.08)',
          border: '1px solid rgba(0, 121, 52, 0.12)'
        }
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'rgba(0, 0, 0, 0.04)' }}>
        <Typography 
          level="title-md" 
          sx={{ 
            fontWeight: 600, 
            color: '#2e7d32',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: '0.875rem'
          }}
        >
          {title}
        </Typography>
      </Box>
      
      <Box 
        sx={{ 
          flexGrow: 1,
          overflowY: 'auto',
          height: height !== 'auto' ? height : undefined,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#e0e0e0',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          }
        }}
      >
        <List sx={{ '--ListDivider-gap': '0px' }}>
          {displayedActivities.map((activity, index) => (
            <React.Fragment key={activity.id}>
              <ListItem
                sx={{ 
                  py: 1.5,
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    bgcolor: '#f5f5f5'
                  }
                }}
              >
                <ListItemDecorator sx={{ alignSelf: 'flex-start' }}>
                  {getActionIcon(activity.action)}
                </ListItemDecorator>
                <ListItemContent>
                  <Box sx={{ mb: 0.5 }}>
                    <Typography level="body-sm" sx={{ fontWeight: 600 }}>
                      {activity.action}
                    </Typography>
                    <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                      Projekt: {activity.project}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography level="body-xs" sx={{ color: 'text.tertiary', fontStyle: 'italic' }}>
                      av {activity.user}
                    </Typography>
                    <Typography level="body-xs" sx={{ 
                      color: '#007934', 
                      fontWeight: 600,
                      bgcolor: '#e8f5e9',
                      py: 0.5,
                      px: 1,
                      borderRadius: '4px'
                    }}>
                      {activity.time}
                    </Typography>
                  </Box>
                </ListItemContent>
              </ListItem>
              {index < displayedActivities.length - 1 && (
                <ListDivider sx={{ 
                  '--ListDivider-thickness': '1px',
                  bgcolor: 'rgba(0, 0, 0, 0.04)'
                }} />
              )}
            </React.Fragment>
          ))}
          {displayedActivities.length === 0 && (
            <ListItem sx={{ py: 2 }}>
              <ListItemContent sx={{ textAlign: 'center' }}>
                <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                  Ingen aktivitet tillgänglig
                </Typography>
              </ListItemContent>
            </ListItem>
          )}
        </List>
      </Box>
    </Card>
  );
};

export default RecentActivityList;