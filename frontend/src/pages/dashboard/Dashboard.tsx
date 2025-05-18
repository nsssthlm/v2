import React, { useState, useEffect, useRef } from 'react';
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
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import SettingsIcon from '@mui/icons-material/Settings';

// Widget typ för dashboard
interface DashboardWidget {
  id: string;
  type: 'metrics' | 'barChart' | 'pieChart' | 'topProjects' | 'recentActivity';
  title: string;
  size: 'small' | 'medium' | 'large';
  order: number;
  data?: any;
  metricIndex?: number;
  visible?: boolean;
}

// Dashboard komponent
const Dashboard = () => {
  const { currentProject } = useProject();
  
  // Definiera initialt tillgängliga widgets
  const initialWidgets: DashboardWidget[] = [
    { id: 'metrics-0', type: 'metrics', title: metricsData[0].title, metricIndex: 0, size: 'small', order: 0, visible: true },
    { id: 'metrics-1', type: 'metrics', title: metricsData[1].title, metricIndex: 1, size: 'small', order: 1, visible: true },
    { id: 'metrics-2', type: 'metrics', title: metricsData[2].title, metricIndex: 2, size: 'small', order: 2, visible: true },
    { id: 'metrics-3', type: 'metrics', title: metricsData[3].title, metricIndex: 3, size: 'small', order: 3, visible: true },
    { id: 'barChart', type: 'barChart', title: 'PROJEKTIONER VS FAKTISKA', data: projectChartData, size: 'medium', order: 4, visible: true },
    { id: 'pieChart', type: 'pieChart', title: 'PROJEKTTYPER', data: projectTypeData, size: 'medium', order: 5, visible: true },
    { id: 'topProjects', type: 'topProjects', title: 'TOPPROJEKT', data: topProjectsData, size: 'medium', order: 6, visible: true },
    { id: 'recentActivity', type: 'recentActivity', title: 'SENASTE AKTIVITET', data: recentActivityData, size: 'medium', order: 7, visible: true }
  ];

  // State för widgets
  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
    try {
      const savedWidgets = localStorage.getItem('dashboardWidgets');
      return savedWidgets ? JSON.parse(savedWidgets) : initialWidgets;
    } catch (e) {
      console.error('Kunde inte läsa sparade widgets', e);
      return initialWidgets;
    }
  });

  // State för att visa dialog för att lägga till/ta bort widgets
  const [showWidgetDialog, setShowWidgetDialog] = useState(false);
  
  // Referens för drag-funktionalitet
  const dragWidget = useRef<DashboardWidget | null>(null);
  const dragNode = useRef<HTMLElement | null>(null);
  const dragOverNode = useRef<HTMLElement | null>(null);
  
  // Spara widgets när de ändras
  useEffect(() => {
    localStorage.setItem('dashboardWidgets', JSON.stringify(widgets));
  }, [widgets]);
  
  // Ta bort en widget
  const removeWidget = (widgetId: string) => {
    setWidgets(prevWidgets => 
      prevWidgets.map(widget => 
        widget.id === widgetId 
          ? { ...widget, visible: false }
          : widget
      )
    );
  };
  
  // Visa en widget
  const showWidget = (widgetId: string) => {
    // Hitta nästa ordningsnummer
    const visibleWidgets = widgets.filter(w => w.visible);
    const nextOrder = visibleWidgets.length > 0 
      ? Math.max(...visibleWidgets.map(w => w.order)) + 1 
      : 0;
    
    setWidgets(prevWidgets => 
      prevWidgets.map(widget => 
        widget.id === widgetId 
          ? { ...widget, visible: true, order: nextOrder }
          : widget
      )
    );
  };
  
  // Hantera start av drag
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, widget: DashboardWidget) => {
    dragWidget.current = widget;
    dragNode.current = e.currentTarget;
    dragNode.current.addEventListener('dragend', handleDragEnd);
    
    setTimeout(() => {
      if (dragNode.current) {
        dragNode.current.style.opacity = '0.4';
      }
    }, 0);
  };
  
  // Hantera drag över
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, widget: DashboardWidget) => {
    e.preventDefault();
    dragOverNode.current = e.currentTarget;
    
    if (dragWidget.current && dragWidget.current.id !== widget.id) {
      e.currentTarget.style.background = '#e0f2e9';
    }
  };
  
  // Hantera drag leave
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.background = '';
  };
  
  // Hantera drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetWidget: DashboardWidget) => {
    e.preventDefault();
    e.currentTarget.style.background = '';
    
    if (dragWidget.current && dragWidget.current.id !== targetWidget.id) {
      const updatedWidgets = [...widgets];
      
      // Byt plats på widgets
      const draggedIndex = updatedWidgets.findIndex(w => w.id === dragWidget.current?.id);
      const targetIndex = updatedWidgets.findIndex(w => w.id === targetWidget.id);
      
      const draggedOrder = updatedWidgets[draggedIndex].order;
      const targetOrder = updatedWidgets[targetIndex].order;
      
      updatedWidgets[draggedIndex] = { ...updatedWidgets[draggedIndex], order: targetOrder };
      updatedWidgets[targetIndex] = { ...updatedWidgets[targetIndex], order: draggedOrder };
      
      setWidgets(updatedWidgets);
    }
  };
  
  // Hantera slut på drag
  const handleDragEnd = () => {
    if (dragNode.current) {
      dragNode.current.removeEventListener('dragend', handleDragEnd);
      dragNode.current.style.opacity = '1';
      dragNode.current = null;
    }
    dragWidget.current = null;
    dragOverNode.current = null;
  };
  
  // Ändra storlek på widget
  const changeWidgetSize = (widgetId: string, newSize: 'small' | 'medium' | 'large') => {
    setWidgets(prevWidgets => 
      prevWidgets.map(widget => 
        widget.id === widgetId 
          ? { ...widget, size: newSize }
          : widget
      )
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

      {/* Knapp för att lägga till widgets */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="outlined" 
          color="primary" 
          startDecorator={<AddIcon />}
          onClick={() => setShowAddDialog(true)}
        >
          Lägg till widget
        </Button>
      </Box>

      {/* Den flyttbara dashboard-layouten */}
      <Sheet 
        variant="outlined" 
        sx={{ 
          p: 2, 
          borderRadius: 'lg', 
          mb: 4, 
          bgcolor: 'background.level1',
          position: 'relative'
        }}
      >
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={80}
          containerPadding={[0, 0]}
          margin={[16, 16]}
          onLayoutChange={handleLayoutChange}
          isDraggable={true}
          isResizable={true}
          draggableCancel=".widget-non-draggable"
        >
          {activeWidgets.map(widget => (
            <Box key={widget.id} className="widget-wrapper" sx={{ overflow: 'hidden' }}>
              <Card 
                variant="outlined" 
                sx={{ 
                  height: '100%', 
                  p: 2,
                  position: 'relative',
                  borderRadius: 'md',
                  '&:hover .widget-remove-btn': {
                    opacity: 1
                  }
                }}
                className="widget-content"
              >
                {/* Ta bort-knapp */}
                <IconButton 
                  className="widget-remove-btn widget-non-draggable"
                  variant="plain"
                  color="danger"
                  size="sm"
                  sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8, 
                    opacity: 0, 
                    transition: 'opacity 0.2s',
                    zIndex: 10 
                  }}
                  onClick={() => removeWidget(widget.id)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>

                {/* Widget-innehåll */}
                <Box sx={{ height: '100%', overflow: 'auto' }}>
                  {renderWidget(widget)}
                </Box>
              </Card>
            </Box>
          ))}
        </ResponsiveGridLayout>
      </Sheet>

      {/* Dialog för att lägga till nya widgets */}
      <Modal open={showAddDialog} onClose={() => setShowAddDialog(false)}>
        <ModalDialog sx={{ maxWidth: 500 }}>
          <DialogTitle>Lägg till widget</DialogTitle>
          <DialogContent>
            <Typography level="body-sm" sx={{ mb: 2 }}>
              Välj en widget att lägga till på din dashboard:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {availableWidgets.length > 0 ? (
                availableWidgets.map(widget => (
                  <Card 
                    key={widget.id} 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      width: '45%', 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#e0f2e9' }
                    }}
                    onClick={() => addWidget(widget)}
                  >
                    <Typography level="body-md" fontWeight="bold">
                      {widget.title}
                    </Typography>
                  </Card>
                ))
              ) : (
                <Typography level="body-sm" sx={{ color: 'text.secondary', p: 2 }}>
                  Alla widgets är redan tillagda. Ta bort någon på dashboarden för att kunna lägga till den igen.
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button variant="plain" color="neutral" onClick={() => setShowAddDialog(false)}>
              Avbryt
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default Dashboard;