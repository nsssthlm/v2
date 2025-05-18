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
import DraggableWidget from '../../components/dashboard/DraggableWidget';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Dashboard Widget typ
export interface DashboardWidget {
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
  
  // State för widgets
  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
    try {
      const savedWidgets = localStorage.getItem('dashboardWidgets');
      return savedWidgets ? JSON.parse(savedWidgets) : allWidgets;
    } catch (e) {
      console.error('Kunde inte läsa sparade widgets', e);
      return allWidgets;
    }
  });
  
  // State för dialogruta för att hantera widgets
  const [showWidgetDialog, setShowWidgetDialog] = useState(false);
  
  // State för att hålla koll på expanderade widgets
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);
  
  // Spara widgets när de ändras
  useEffect(() => {
    localStorage.setItem('dashboardWidgets', JSON.stringify(widgets));
  }, [widgets]);
  
  // Ta bort en widget
  const removeWidget = (widgetId: string) => {
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === widgetId 
          ? { ...widget, visible: false } 
          : widget
      )
    );
    
    // Om den expanderade widgeten tas bort, återställ expanderad state
    if (expandedWidget === widgetId) {
      setExpandedWidget(null);
    }
  };
  
  // Lägg till en widget
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
  
  // Flytta en widget via drag-and-drop
  const moveWidget = (dragIndex: number, hoverIndex: number) => {
    // Kopiera bara de synliga widgets till en ny array
    const visibleWidgets = widgets
      .filter(widget => widget.visible)
      .sort((a, b) => a.order - b.order);
    
    // Widget som dras
    const draggedWidget = visibleWidgets[dragIndex];
    
    // Återskapa array utan dragen widget
    const newWidgetsArray = visibleWidgets.filter((_, idx) => idx !== dragIndex);
    
    // Sätt in dragen widget på ny position
    newWidgetsArray.splice(hoverIndex, 0, draggedWidget);
    
    // Uppdatera ordningsnummer för alla widgets
    const updatedVisibleWidgets = newWidgetsArray.map((widget, index) => ({
      ...widget,
      order: index
    }));
    
    // Kombinera uppdaterade synliga widgets med dolda widgets
    const combinedWidgets = [
      ...updatedVisibleWidgets,
      ...widgets.filter(widget => !widget.visible)
    ];
    
    // Uppdatera state
    setWidgets(combinedWidgets);
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
    <DndProvider backend={HTML5Backend}>
      <Box>
        <Typography level="h1" component="h1" sx={{ mb: 3, color: 'text.primary', fontWeight: 'bold' }}>
          Dashboard
        </Typography>
        
        {/* Aktuellt projekt-information */}
        <Box sx={{ mb: 4 }}>
          <Typography level="h2" component="h2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            {currentProject?.name || 'Arkitektprojekt Översikt'}
          </Typography>
          <Typography level="body-md" sx={{ mb: 2, mt: 1 }}>
            {currentProject?.description || 'Välkommen till din projektöversikt. Här kan du se nyckeltal, tidslinjer och aktivitet för alla dina arkitektprojekt.'}
          </Typography>
          <Divider sx={{ bgcolor: '#e0f2e9', mb: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography level="body-sm">
              {currentProject?.endDate ? 
                `Projektslut: ${new Date(currentProject.endDate).toLocaleDateString()}` : 
                'Välj ett specifikt projekt för detaljerad information'}
            </Typography>
            <Typography level="body-sm" sx={{ color: 'text.secondary', fontWeight: 'medium' }}>
              {currentProject?.id ? `Projekt-ID: ${currentProject.id}` : 'Översiktsdashboard'}
            </Typography>
          </Box>
        </Box>
        
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
          {visibleWidgets.map((widget, index) => (
            <Grid key={widget.id} {...getGridSize(widget)}>
              <DraggableWidget
                widget={widget}
                index={index}
                moveWidget={moveWidget}
                removeWidget={removeWidget}
                toggleExpand={toggleWidgetSize}
                isExpanded={expandedWidget === widget.id}
              >
                {renderWidget(widget)}
              </DraggableWidget>
            </Grid>
          ))}
        </Grid>
        
        {/* Dialog för att lägga till/ta bort widgets */}
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
    </DndProvider>
  );
};

export default Dashboard;