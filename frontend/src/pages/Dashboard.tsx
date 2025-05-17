import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Box,
  Divider,
  AspectRatio,
  Sheet,
  Chip,
  CircularProgress,
  Button
} from '@mui/joy';
import { Project } from '../types';
import api from '../services/api';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Fetch from our sample endpoint
        const response = await api.get('/project-sample/');
        setProjects(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError('Kunde inte hämta projektdata. Vänligen försök igen senare.');
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Statistics summary
  const statistics = {
    activeProjects: projects.length,
    tasksThisWeek: 15,
    unreadMessages: 3,
    upcomingMeetings: 2
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography level="h4" color="danger">Ett fel uppstod</Typography>
        <Typography>{error}</Typography>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outlined" 
          color="neutral" 
          sx={{ mt: 2 }}
        >
          Försök igen
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      <Typography level="h1" sx={{ mb: 3 }}>Dashboard</Typography>

      {/* Stats Overview */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card variant="soft" sx={{ height: '100%' }}>
            <CardContent>
              <Typography level="title-md">Aktiva projekt</Typography>
              <Typography level="h2">{statistics.activeProjects}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card variant="soft" color="primary" sx={{ height: '100%' }}>
            <CardContent>
              <Typography level="title-md">Uppgifter denna vecka</Typography>
              <Typography level="h2">{statistics.tasksThisWeek}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card variant="soft" color="warning" sx={{ height: '100%' }}>
            <CardContent>
              <Typography level="title-md">Olästa meddelanden</Typography>
              <Typography level="h2">{statistics.unreadMessages}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card variant="soft" color="success" sx={{ height: '100%' }}>
            <CardContent>
              <Typography level="title-md">Kommande möten</Typography>
              <Typography level="h2">{statistics.upcomingMeetings}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Project Cards */}
      <Typography level="h3" sx={{ mb: 2 }}>Mina projekt</Typography>
      <Grid container spacing={2}>
        {projects.map((project) => (
          <Grid key={project.id} xs={12} md={6} lg={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <CardContent>
                  <Typography level="title-lg">{project.name}</Typography>
                  <Typography level="body-sm" sx={{ mb: 1 }}>
                    {project.start_date} - {project.end_date || 'Pågående'}
                  </Typography>
                  <Typography level="body-md" sx={{ mb: 2 }}>
                    {project.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    <Chip size="sm" color="primary">Uppgifter: {(project as any).tasks_count || 0}</Chip>
                    <Chip size="sm" color="success">Filer: {(project as any).files_count || 0}</Chip>
                    <Chip size="sm" color="neutral">Team: {(project as any).team_size || 0}</Chip>
                  </Box>
                </CardContent>
                <Box sx={{ mt: 'auto', p: 2, pt: 0 }}>
                  <Button variant="outlined" color="neutral" size="sm">Visa detaljer</Button>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;