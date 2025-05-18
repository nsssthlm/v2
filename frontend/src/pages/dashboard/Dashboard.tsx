import { Box, Typography, Grid, Card, Divider } from '@mui/joy';
import { useProject } from '../../contexts/ProjectContext';
import ProjectMetricsCard from '../../components/dashboard/ProjectMetricsCard';
import SimpleBarChart from '../../components/dashboard/SimpleBarChart';
import SimplePieChart from '../../components/dashboard/SimplePieChart';
import RecentActivityList from '../../components/dashboard/RecentActivityList';
import TopProjectsTable from '../../components/dashboard/TopProjectsTable';
import { 
  metricsData, 
  projectChartData, 
  projectTypeData, 
  recentActivityData,
  topProjectsData
} from '../../components/dashboard/DashboardData';

const Dashboard = () => {
  const { currentProject } = useProject();
  
  return (
    <Box>
      <Typography level="h1" component="h1" sx={{ mb: 3, color: '#60cd18', fontWeight: 'bold' }}>
        Dashboard
      </Typography>
      
      {/* Aktuellt projekt-information */}
      <Card 
        variant="plain" 
        sx={{ 
          mb: 4, 
          p: 3,
          bgcolor: 'background.surface', 
          boxShadow: 'sm',
          borderRadius: 'lg',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography level="h2" component="h2" sx={{ fontWeight: 'bold', color: '#60cd18' }}>
          {currentProject?.name || 'Arkitektprojekt Översikt'}
        </Typography>
        <Typography level="body-md" sx={{ mb: 2, mt: 1 }}>
          {currentProject?.description || 'Välkommen till din projektöversikt. Här kan du se nyckeltal, tidslinjer och aktivitet för alla dina arkitektprojekt.'}
        </Typography>
        <Divider sx={{ bgcolor: 'rgba(96, 205, 24, 0.1)' }} />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Typography level="body-sm">
            {currentProject?.endDate ? 
              `Projektslut: ${new Date(currentProject.endDate).toLocaleDateString()}` : 
              'Välj ett specifikt projekt för detaljerad information'}
          </Typography>
          <Typography level="body-sm" sx={{ color: '#60cd18', fontWeight: 'medium' }}>
            {currentProject?.id ? `Projekt-ID: ${currentProject.id}` : 'Översiktsdashboard'}
          </Typography>
        </Box>
      </Card>

      {/* Metrikkort */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {metricsData.map((metric, index) => (
          <Grid key={index} xs={12} sm={6} md={3}>
            <ProjectMetricsCard 
              title={metric.title}
              value={metric.value}
              trend={metric.trend}
              icon={metric.icon}
            />
          </Grid>
        ))}
      </Grid>

      {/* Projektioner vs Faktiska */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={12} lg={8}>
          <SimpleBarChart 
            title="PROJEKTIONER VS FAKTISKA"
            data={projectChartData}
          />
        </Grid>
        <Grid xs={12} lg={4}>
          <SimplePieChart 
            title="PROJEKTTYPER"
            data={projectTypeData}
          />
        </Grid>
      </Grid>

      {/* Topprojekt och Aktiviteter */}
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <TopProjectsTable 
            title="TOPPROJEKT"
            projects={topProjectsData}
          />
        </Grid>
        <Grid xs={12} md={4}>
          <RecentActivityList 
            title="SENASTE AKTIVITET"
            activities={recentActivityData}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;