import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, Divider, Button, IconButton, Sheet, Modal, ModalDialog, DialogTitle, DialogContent, DialogActions, Grid } from '@mui/joy';
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
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// Widget-typer för dashboarden
interface DashboardWidget {
  id: string;
  type: 'metrics' | 'barChart' | 'pieChart' | 'topProjects' | 'recentActivity';
  title: string;
  size: 'small' | 'medium' | 'large';
  metricIndex?: number;
  order: number;
  visible: boolean;
}

const Dashboard = () => {
  const { currentProject } = useProject();
  
  // Definiera alla tillgängliga widgets
  const allWidgets: DashboardWidget[] = [
    { id: 'metrics-0', type: 'metrics', title: metricsData[0].title, metricIndex: 0, size: 'small', order: 0, visible: true },
    { id: 'metrics-1', type: 'metrics', title: metricsData[1].title, metricIndex: 1, size: 'small', order: 1, visible: true },
    { id: 'metrics-2', type: 'metrics', title: metricsData[2].title, metricIndex: 2, size: 'small', order: 2, visible: true },
    { id: 'metrics-3', type: 'metrics', title: metricsData[3].title, metricIndex: 3, size: 'small', order: 3, visible: true },
    { id: 'barChart', type: 'barChart', title: 'PROJEKTIONER VS FAKTISKA', size: 'medium', order: 4, visible: true },
    { id: 'pieChart', type: 'pieChart', title: 'PROJEKTTYPER', size: 'medium', order: 5, visible: true },
    { id: 'topProjects', type: 'topProjects', title: 'TOPPROJEKT', size: 'medium', order: 6, visible: true },
    { id: 'recentActivity', type: 'recentActivity', title: 'SENASTE AKTIVITET', size: 'medium', order: 7, visible: true },
  ];
  
  // State för widgets som visas på dashboarden
  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
    try {
      const savedWidgets = localStorage.getItem('dashboardWidgets');
      return savedWidgets ? JSON.parse(savedWidgets) : allWidgets;
    } catch (e) {
      console.error('Kunde inte läsa sparade widgets', e);
      return allWidgets;
    }
  });
  
  // State för att visa redigeringsdialog
  const [showWidgetDialog, setShowWidgetDialog] = useState(false);
  
  // State för att hålla koll på vilken widget som är expanderad
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);
  
  // Spara widgets när de ändras
  useEffect(() => {
    localStorage.setItem('dashboardWidgets', JSON.stringify(widgets));
  }, [widgets]);
  
  // Ta bort (göm) en widget
  const removeWidget = (widgetId: string) => {
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === widgetId 
          ? { ...widget, visible: false } 
          : widget
      )
    );
  };
  
  // Lägg till (visa) en widget
  const addWidget = (widgetId: string) => {
    const maxOrder = widgets.reduce((max, widget) => widget.visible && widget.order > max ? widget.order : max, -1);
    
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === widgetId 
          ? { ...widget, visible: true, order: maxOrder + 1 } 
          : widget
      )
    );
  };
  
  // Expandera/minimera en widget
  const toggleWidgetSize = (widgetId: string) => {
    if (expandedWidget === widgetId) {
      setExpandedWidget(null);
    } else {
      setExpandedWidget(widgetId);
    }
  };
  
  // Flytta en widget uppåt i ordningen
  const moveWidgetUp = (widgetId: string) => {
    const visibleWidgets = widgets.filter(w => w.visible);
    const widgetIndex = visibleWidgets.findIndex(w => w.id === widgetId);
    if (widgetIndex <= 0) return; // Redan högst upp
    
    const currentWidget = visibleWidgets[widgetIndex];
    const aboveWidget = visibleWidgets[widgetIndex - 1];
    
    setWidgets(prev => 
      prev.map(widget => {
        if (widget.id === currentWidget.id) {
          return { ...widget, order: aboveWidget.order };
        } else if (widget.id === aboveWidget.id) {
          return { ...widget, order: currentWidget.order };
        }
        return widget;
      })
    );
  };
  
  // Flytta en widget nedåt i ordningen
  const moveWidgetDown = (widgetId: string) => {
    const visibleWidgets = widgets.filter(w => w.visible);
    const widgetIndex = visibleWidgets.findIndex(w => w.id === widgetId);
    if (widgetIndex === -1 || widgetIndex >= visibleWidgets.length - 1) return; // Redan längst ner
    
    const currentWidget = visibleWidgets[widgetIndex];
    const belowWidget = visibleWidgets[widgetIndex + 1];
    
    setWidgets(prev => 
      prev.map(widget => {
        if (widget.id === currentWidget.id) {
          return { ...widget, order: belowWidget.order };
        } else if (widget.id === belowWidget.id) {
          return { ...widget, order: currentWidget.order };
        }
        return widget;
      })
    );
  };
  
  // Rendera en specifik widget baserat på dess typ
  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'metrics':
        if (typeof widget.metricIndex === 'number') {
          const metric = metricsData[widget.metricIndex];
          return (
            <ProjectMetricsCard 
              title={metric.title}
              value={metric.value}
              trend={metric.trend}
              icon={metric.icon}
            />
          );
        }
        return null;
      case 'barChart':
        return (
          <SimpleBarChart 
            title={widget.title}
            data={projectChartData}
          />
        );
      case 'pieChart':
        return (
          <SimplePieChart 
            title={widget.title}
            data={projectTypeData}
          />
        );
      case 'topProjects':
        return (
          <TopProjectsTable 
            title={widget.title}
            projects={topProjectsData}
          />
        );
      case 'recentActivity':
        return (
          <RecentActivityList 
            title={widget.title}
            activities={recentActivityData}
          />
        );
      default:
        return null;
    }
  };
  
  // Filtrera widgets som ska visas och sortera dem efter ordning
  const visibleWidgets = widgets
    .filter(widget => widget.visible)
    .sort((a, b) => a.order - b.order);
  
  // Widgets som är dolda (kan läggas till)
  const hiddenWidgets = widgets
    .filter(widget => !widget.visible)
    .sort((a, b) => a.id.localeCompare(b.id));
  
  // Bestäm gridstorlek baserad på widgetstorlek och om den är expanderad
  const getGridSize = (widget: DashboardWidget) => {
    if (expandedWidget === widget.id) {
      return { xs: 12 }; // Tar hela bredden om expanderad
    }
    
    if (widget.type === 'metrics') {
      return { xs: 12, sm: 6, md: 3 }; // Små metrics-kort
    }
    
    if (widget.type === 'barChart' || widget.type === 'topProjects') {
      return { xs: 12, md: 8 }; // Breda diagram/tabeller
    }
    
    return { xs: 12, md: 4 }; // Standard för mindre widgets
  };
  
  return (
    <Box>
      <Typography level="h1" component="h1" sx={{ mb: 3, color: 'text.primary', fontWeight: 'bold' }}>
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
        <Typography level="h2" component="h2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          {currentProject?.name || 'Arkitektprojekt Översikt'}
        </Typography>
        <Typography level="body-md" sx={{ mb: 2, mt: 1 }}>
          {currentProject?.description || 'Välkommen till din projektöversikt. Här kan du se nyckeltal, tidslinjer och aktivitet för alla dina arkitektprojekt.'}
        </Typography>
        <Divider sx={{ bgcolor: '#e0f2e9' }} />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Typography level="body-sm">
            {currentProject?.endDate ? 
              `Projektslut: ${new Date(currentProject.endDate).toLocaleDateString()}` : 
              'Välj ett specifikt projekt för detaljerad information'}
          </Typography>
          <Typography level="body-sm" sx={{ color: 'text.secondary', fontWeight: 'medium' }}>
            {currentProject?.id ? `Projekt-ID: ${currentProject.id}` : 'Översiktsdashboard'}
          </Typography>
        </Box>
      </Card>
      
      {/* Knapp för att redigera dashboard */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="outlined" 
          color="primary" 
          startDecorator={<AddIcon />}
          onClick={() => setShowWidgetDialog(true)}
          sx={{ bgcolor: '#e0f2e9', borderColor: '#007934', color: '#007934' }}
        >
          Redigera dashboard
        </Button>
      </Box>
      
      {/* Dashboard-widgets */}
      <Grid container spacing={2}>
        {visibleWidgets.map(widget => (
          <Grid key={widget.id} {...getGridSize(widget)}>
            <Card 
              variant="outlined" 
              sx={{ 
                height: '100%', 
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover .widget-controls': {
                  opacity: 1
                }
              }}
            >
              {/* Widget-kontroller */}
              <Box 
                className="widget-controls"
                sx={{ 
                  position: 'absolute', 
                  top: '8px', 
                  right: '8px', 
                  display: 'flex',
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                  zIndex: 10,
                  gap: 0.5,
                  bgcolor: 'rgba(255,255,255,0.8)',
                  p: 0.5,
                  borderRadius: 'md'
                }}
              >
                {/* Ta bort-knapp */}
                <IconButton 
                  size="sm"
                  color="danger"
                  variant="plain"
                  onClick={() => removeWidget(widget.id)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
                
                {/* Expandera/förminska-knapp */}
                <IconButton 
                  size="sm"
                  color="primary"
                  variant="plain"
                  onClick={() => toggleWidgetSize(widget.id)}
                >
                  {expandedWidget === widget.id ? 
                    <FullscreenExitIcon fontSize="small" /> : 
                    <FullscreenIcon fontSize="small" />
                  }
                </IconButton>
                
                {/* Flytta upp-knapp */}
                <IconButton 
                  size="sm"
                  color="neutral"
                  variant="plain"
                  onClick={() => moveWidgetUp(widget.id)}
                  disabled={widget.order === Math.min(...visibleWidgets.map(w => w.order))}
                >
                  <KeyboardArrowUpIcon fontSize="small" />
                </IconButton>
                
                {/* Flytta ner-knapp */}
                <IconButton 
                  size="sm"
                  color="neutral"
                  variant="plain"
                  onClick={() => moveWidgetDown(widget.id)}
                  disabled={widget.order === Math.max(...visibleWidgets.map(w => w.order))}
                >
                  <KeyboardArrowDownIcon fontSize="small" />
                </IconButton>
              </Box>
              
              {/* Widget-innehåll */}
              <Box sx={{ p: 2, height: '100%' }}>
                {renderWidget(widget)}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Dialog för att lägga till widgets */}
      <Modal open={showWidgetDialog} onClose={() => setShowWidgetDialog(false)}>
        <ModalDialog sx={{ maxWidth: 500 }}>
          <DialogTitle>Redigera dashboard</DialogTitle>
          <DialogContent>
            <Typography level="body-sm" sx={{ mb: 2 }}>
              Här kan du anpassa din dashboard genom att visa eller dölja widgets.
            </Typography>
            
            {/* Widgets som är synliga */}
            <Typography level="body-md" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>
              Aktiva widgets
            </Typography>
            {visibleWidgets.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {visibleWidgets.map(widget => (
                  <Card 
                    key={widget.id} 
                    variant="soft" 
                    sx={{ 
                      p: 1, 
                      width: 'calc(50% - 8px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      bgcolor: '#e0f2e9'
                    }}
                  >
                    <Typography level="body-sm">{widget.title}</Typography>
                    <IconButton 
                      size="sm" 
                      color="danger" 
                      onClick={() => removeWidget(widget.id)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Card>
                ))}
              </Box>
            ) : (
              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                Inga aktiva widgets. Lägg till nedan.
              </Typography>
            )}
            
            {/* Widgets som är dolda */}
            <Typography level="body-md" sx={{ fontWeight: 'bold', mt: 3, mb: 1 }}>
              Tillgängliga widgets
            </Typography>
            {hiddenWidgets.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {hiddenWidgets.map(widget => (
                  <Card 
                    key={widget.id} 
                    variant="outlined" 
                    sx={{ 
                      p: 1, 
                      width: 'calc(50% - 8px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#e0f2e9' }
                    }}
                    onClick={() => addWidget(widget.id)}
                  >
                    <Typography level="body-sm">{widget.title}</Typography>
                    <IconButton 
                      size="sm" 
                      color="primary"
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Card>
                ))}
              </Box>
            ) : (
              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                Alla widgets är redan aktiva.
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              variant="plain" 
              color="neutral" 
              onClick={() => setShowWidgetDialog(false)}
            >
              Stäng
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default Dashboard;