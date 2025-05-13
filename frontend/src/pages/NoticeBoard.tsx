import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Divider, 
  Chip, 
  Avatar, 
  Sheet,
  IconButton,
  Input,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Stack
} from '@mui/joy';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Notifications as NotificationsIcon,
  AccountCircle as UserIcon,
  Building as BuildingIcon,
  CalendarMonth as CalendarIcon,
  Announcement as AnnouncementIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface Notice {
  id: number;
  title: string;
  content: string;
  date: Date;
  author: string;
  authorAvatar?: string;
  type: 'announcement' | 'update' | 'alert';
  project?: string;
  isRead: boolean;
}

const NoticeBoard: React.FC = () => {
  const [tabValue, setTabValue] = useState<string>('all');
  
  // Dummy notices data
  const notices: Notice[] = [
    {
      id: 1,
      title: 'Ny version av konstruktionsritning finns tillgänglig',
      content: 'En uppdaterad version av ritningarna för Office Building A har laddats upp. Kontrollera de senaste ändringarna i Vault.',
      date: new Date(2025, 4, 10, 9, 30),
      author: 'Anna Andersson',
      type: 'update',
      project: 'Office Building A',
      isRead: false
    },
    {
      id: 2,
      title: 'Möte om projektplanering inbokat',
      content: 'Ett möte för att diskutera projektplaneringen för Residential Complex B har schemalagts för den 20 maj. Se kalender för detaljer.',
      date: new Date(2025, 4, 8, 14, 15),
      author: 'Marcus Nilsson',
      type: 'announcement',
      project: 'Residential Complex B',
      isRead: true
    },
    {
      id: 3,
      title: 'Viktig information om byggtillstånd',
      content: 'Vi har fått feedback från kommunen angående byggtillstånden för Hospital Renovation C. Åtgärder krävs innan den 25 maj.',
      date: new Date(2025, 4, 5, 11, 20),
      author: 'Lena Karlsson',
      type: 'alert',
      project: 'Hospital Renovation C',
      isRead: false
    },
    {
      id: 4,
      title: 'Månadsmöte för alla projektledare',
      content: 'Påminnelse om att månadsmötet för alla projektledare kommer att hållas den 15 maj kl 13:00. Agenda skickas ut dagen innan.',
      date: new Date(2025, 4, 2, 9, 0),
      author: 'Sofia Berg',
      type: 'announcement',
      isRead: true
    },
    {
      id: 5,
      title: 'Ny teammedlem har lagts till i Hospital Renovation C',
      content: 'Välkomna Erik Lundgren som ansluter till projektteamet för Hospital Renovation C som installationsingenjör.',
      date: new Date(2025, 3, 28, 10, 45),
      author: 'Peter Svensson',
      type: 'update',
      project: 'Hospital Renovation C',
      isRead: true
    }
  ];

  const filterNotices = (tab: string) => {
    if (tab === 'all') return notices;
    if (tab === 'unread') return notices.filter(notice => !notice.isRead);
    if (tab === 'announcements') return notices.filter(notice => notice.type === 'announcement');
    if (tab === 'alerts') return notices.filter(notice => notice.type === 'alert');
    return notices;
  };

  const getNoticeIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <AnnouncementIcon />;
      case 'alert':
        return <NotificationsIcon color="error" />;
      case 'update':
        return <BuildingIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNoticeColor = (type: string) => {
    switch (type) {
      case 'announcement':
        return 'primary';
      case 'alert':
        return 'danger';
      case 'update':
        return 'success';
      default:
        return 'neutral';
    }
  };

  const filteredNotices = filterNotices(tabValue);

  return (
    <Box sx={{ p: 1 }}>
      <Typography level="h1" sx={{ mb: 3 }}>Anslagstavla</Typography>
      
      {/* Search and filter */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid xs={12} md={6}>
              <Input
                startDecorator={<SearchIcon />}
                placeholder="Sök i meddelanden..."
                fullWidth
              />
            </Grid>
            <Grid xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button 
                variant="outlined" 
                color="neutral" 
                startDecorator={<FilterListIcon />}
                sx={{ mr: 1 }}
              >
                Filter
              </Button>
              <Button variant="solid">Nytt meddelande</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Tabs and content */}
      <Card>
        <Tabs value={tabValue} onChange={(e, value) => setTabValue(value as string)}>
          <TabList variant="plain">
            <Tab value="all">Alla</Tab>
            <Tab value="unread">
              Olästa
              <Chip 
                size="sm" 
                color="primary" 
                variant="soft" 
                sx={{ ml: 1 }}
              >
                {notices.filter(n => !n.isRead).length}
              </Chip>
            </Tab>
            <Tab value="announcements">Tillkännagivanden</Tab>
            <Tab value="alerts">Varningar</Tab>
          </TabList>
          
          <Divider />
          
          <Box sx={{ p: 2 }}>
            {filteredNotices.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography level="body-lg">Inga meddelanden att visa</Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {filteredNotices.map((notice) => (
                  <Card 
                    key={notice.id}
                    variant={notice.isRead ? "outlined" : "soft"}
                    sx={{ 
                      boxShadow: notice.isRead ? 'none' : 'sm',
                      borderLeft: '4px solid',
                      borderLeftColor: `${getNoticeColor(notice.type)}.500`,
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                          <Box sx={{ mr: 1.5 }}>
                            {getNoticeIcon(notice.type)}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                              <Typography level="title-md">{notice.title}</Typography>
                              {!notice.isRead && (
                                <Chip size="sm" color="primary" variant="soft">Ny</Chip>
                              )}
                            </Box>
                            <Typography level="body-sm">
                              {format(notice.date, 'PPP', { locale: sv })} • {format(notice.date, 'HH:mm')}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Typography level="body-md" sx={{ mb: 2 }}>
                        {notice.content}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar size="sm" sx={{ mr: 1 }}>
                            <UserIcon />
                          </Avatar>
                          <Typography level="body-sm">{notice.author}</Typography>
                        </Box>
                        
                        {notice.project && (
                          <Chip 
                            size="sm" 
                            startDecorator={<BuildingIcon fontSize="small" />}
                          >
                            {notice.project}
                          </Chip>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>
        </Tabs>
      </Card>
    </Box>
  );
};

export default NoticeBoard;