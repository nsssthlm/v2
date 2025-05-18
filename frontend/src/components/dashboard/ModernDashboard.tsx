import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, Divider, Button, IconButton, Sheet, Modal, ModalDialog, DialogTitle, DialogContent, DialogActions, Grid } from '@mui/joy';
import { useProject } from '../../contexts/ProjectContext';
import ModernMetricsCard from './ModernMetricsCard';
import SimpleBarChart from './SimpleBarChart';
import SimplePieChart from './SimplePieChart';
import RecentActivityList from './RecentActivityList';
import TopProjectsTable from './TopProjectsTable';
import ModernRevenueWidget from './ModernRevenueWidget';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ModernDraggableWidget from './ModernDraggableWidget';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Dashboard Widget typ
export interface DashboardWidget {
  id: string;
  type: 'metrics' | 'barChart' | 'pieChart' | 'topProjects' | 'recentActivity' | 'lineChart' | 'calendar';
  title: string;
  size: 'small' | 'medium' | 'large';
  metricIndex?: number;
  order: number;
  visible: boolean;
  value?: string | number;
  trend?: {
    value: number;
    isPositive?: boolean;
    text: string;
  };
  icon?: string;
  dataIndex?: number;
}

// Import dashboard data
import { 
  projectHoursData, 
  documentTypesData, 
  projectStatusData, 
  budgetAllocationData,
  activeProjectsData,
  recentActivitiesData,
  documentStatsData,
  projectStatsData
} from './DashboardData';
import { markedDates } from './CalendarData';
import CalendarWidget from './CalendarWidget';

// Definiera metricsData för användning i dashborden
const metricsData = [
  {
    title: 'Projektledare',
    value: projectStatsData.totalProjects.toString(),
    trend: { value: 12, isPositive: true, text: 'sedan förra månaden' },
    icon: 'people'
  },
  {
    title: 'Aktiva projekt',
    value: projectStatsData.activeProjects.toString(),
    trend: { value: 8, isPositive: true, text: 'sedan förra månaden' },
    icon: 'task'
  },
  {
    title: 'Dokument',
    value: documentStatsData.totalDocuments.toString(),
    trend: { value: 18, isPositive: true, text: 'nya denna månad' },
    icon: 'document'
  },
  {
    title: 'Budget',
    value: projectStatsData.usedBudget,
    trend: { value: 5, isPositive: false, text: 'över budget' },
    icon: 'money'
  },
  {
    title: 'Granskningar',
    value: documentStatsData.reviewsPending.toString(),
    trend: { value: 15, isPositive: false, text: 'behöver åtgärd' },
    icon: 'review'
  }
];

const ModernDashboard: React.FC = () => {
  const { currentProject } = useProject();
  
  // Vi har avsiktligen tagit bort det duplicerade handleCalendarDateClick här
  // Den finns längre ner i filen
  
  // State för dashboard widgets
  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
    // Försök läsa sparade widgets från localStorage
    const savedWidgets = localStorage.getItem('dashboardWidgets');
    
    if (savedWidgets) {
      try {
        return JSON.parse(savedWidgets);
      } catch (e) {
        console.error('Fel vid parsning av sparade widgets:', e);
      }
    }
    
    // Fallback till standard widgets
    return [
      { id: 'metric1', type: 'metrics', title: 'Projektledare', size: 'small', metricIndex: 0, order: 0, visible: true },
      { id: 'metric2', type: 'metrics', title: 'Aktiva projekt', size: 'small', metricIndex: 1, order: 1, visible: true },
      { id: 'metric3', type: 'metrics', title: 'Dokument', size: 'small', metricIndex: 2, order: 2, visible: true },
      { id: 'metric4', type: 'metrics', title: 'Budget', size: 'small', metricIndex: 3, order: 3, visible: true },
      { id: 'metric5', type: 'metrics', title: 'Granskningar', size: 'small', metricIndex: 4, order: 4, visible: true },
      { id: 'projectHours', type: 'barChart', title: 'Projekttimmar', size: 'medium', order: 5, visible: true },
      { id: 'docTypes', type: 'pieChart', title: 'Dokumenttyper', size: 'medium', order: 6, visible: true },
      { id: 'projectStatus', type: 'pieChart', title: 'Projektstatus', size: 'medium', order: 7, visible: true },
      { id: 'budgetAlloc', type: 'pieChart', title: 'Budgetfördelning', size: 'medium', order: 8, visible: true },
      { id: 'projectCalendar', type: 'calendar', title: 'Projektkalender', size: 'medium', order: 9, visible: true },
      { id: 'topProjects', type: 'topProjects', title: 'Projekt i Fokus', size: 'medium', order: 10, visible: true },
      { id: 'recentActivity', type: 'recentActivity', title: 'Senaste aktivitet', size: 'medium', order: 11, visible: true },
      { id: 'revenueChart', type: 'lineChart', title: 'Intäkter & Kostnader', size: 'large', order: 12, visible: true },
    ];
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
  
  // Växla widgetens storlek (expandera/minimera)
  const toggleWidgetSize = (widgetId: string) => {
    if (expandedWidget === widgetId) {
      setExpandedWidget(null); // Minimera if already expanded
    } else {
      setExpandedWidget(widgetId); // Expandera
    }
  };
  
  // Flytta en widget (drag-and-drop)
  const moveWidget = (dragIndex: number, hoverIndex: number) => {
    const visibleWidgets = widgets.filter(w => w.visible).sort((a, b) => a.order - b.order);
    
    if (dragIndex < 0 || hoverIndex < 0 || dragIndex >= visibleWidgets.length || hoverIndex >= visibleWidgets.length) {
      return;
    }
    
    const dragWidget = visibleWidgets[dragIndex];
    const hoverWidget = visibleWidgets[hoverIndex];
    
    if (!dragWidget || !hoverWidget) return;
    
    // Uppdatera alla ordervärden
    setWidgets(prev => prev.map(widget => {
      if (widget.id === dragWidget.id) {
        return { ...widget, order: hoverWidget.order };
      }
      if (widget.id === hoverWidget.id) {
        return { ...widget, order: dragWidget.order };
      }
      return widget;
    }));
  };
  
  // Filtrera fram synliga widgets och sortera efter order
  const visibleWidgets = widgets
    .filter(widget => widget.visible)
    .sort((a, b) => a.order - b.order);
  
  // Filtrera fram dolda widgets
  const hiddenWidgets = widgets
    .filter(widget => !widget.visible)
    .sort((a, b) => a.id.localeCompare(b.id));
  
  // Definiera en ModernMetricsCardProps-typ för vår ModernMetricsCard
  type ModernMetricsCardProps = {
    title: string;
    value: string | number;
    trend?: {
      value: number;
      isPositive?: boolean;
      text: string;
    };
    icon?: string;
  };

  // Hantera klick på ett datum från kalendern
  const handleCalendarDateClicked = (date: Date) => {
    console.log('Datum valt:', date.toLocaleDateString('sv-SE'));
    // Här kan du implementera funktionalitet för att visa aktiviteter för det valda datumet
  };

  // Rendera en specifik widget baserat på dess typ
  const renderWidget = (widget: DashboardWidget) => {
    // Bestäm höjd baserat på expanderat tillstånd
    const isExpanded = expandedWidget === widget.id;
    const height = isExpanded ? 500 : (widget.size === 'large' ? 400 : 300);

    switch (widget.type) {
      case 'metrics':
        if (typeof widget.metricIndex === 'number' && widget.metricIndex < metricsData.length) {
          const metric = metricsData[widget.metricIndex];
          const props: ModernMetricsCardProps = {
            title: metric.title,
            value: metric.value,
            trend: metric.trend,
            icon: metric.icon
          };
          return <ModernMetricsCard {...props} />;
        }
        return null;
      case 'barChart':
        // Välj rätt data baserat på widget-ID
        return (
          <SimpleBarChart 
            title={widget.title}
            data={projectHoursData}
            height={height}
          />
        );
      case 'pieChart':
        // Välj rätt data baserat på widget-ID
        switch (widget.id) {
          case 'docTypes':
            return (
              <SimplePieChart 
                title={widget.title}
                data={documentTypesData}
                height={height}
                innerRadius={isExpanded ? 60 : 0}
                outerRadius={isExpanded ? 120 : 80}
              />
            );
          case 'projectStatus':
            return (
              <SimplePieChart 
                title={widget.title}
                data={projectStatusData}
                height={height}
                innerRadius={isExpanded ? 60 : 40}
                outerRadius={isExpanded ? 120 : 80}
              />
            );
          case 'budgetAlloc':
            return (
              <SimplePieChart 
                title={widget.title}
                data={budgetAllocationData}
                height={height}
                innerRadius={isExpanded ? 60 : 40}
                outerRadius={isExpanded ? 120 : 80}
              />
            );
          default:
            return (
              <SimplePieChart 
                title={widget.title}
                data={documentTypesData}
                height={height}
              />
            );
        }
      case 'topProjects':
        return (
          <TopProjectsTable 
            title={widget.title}
            projects={activeProjectsData}
            height={height}
            maxRows={isExpanded ? 8 : 5}
          />
        );
      case 'recentActivity':
        return (
          <RecentActivityList 
            title={widget.title}
            activities={recentActivitiesData}
            height={height}
            maxItems={isExpanded ? 10 : 5}
          />
        );
      case 'lineChart':
        return (
          <ModernRevenueWidget 
            title={widget.title}
          />
        );
      case 'calendar':
        return (
          <CalendarWidget
            title={widget.title}
            height={height}
            onDateClick={handleCalendarDateClicked}
            markedDates={markedDates}
          />
        );
      default:
        return null;
    }
  };
  
  // Bestäm storlek för en widget
  const getGridSize = (widget: DashboardWidget) => {
    if (expandedWidget === widget.id) {
      return { xs: 12, md: 12 }; // Expanderad widget tar upp hela bredden
    }
    
    if (widget.size === 'large') {
      return { xs: 12, md: 8 }; // Stor widget tar upp 2/3 av bredden på desktop
    }
    
    if (widget.size === 'medium') {
      return { xs: 12, md: 6 }; // Medium widget tar upp halva bredden på desktop
    }
    
    return { xs: 12, sm: 6, md: 4 }; // Standard för mindre widgets
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ 
        maxWidth: '1400px', 
        mx: 'auto',
        p: { xs: 2, md: 4 },
        bgcolor: '#f8faf9',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
      }}>
        <Typography 
          level="h1" 
          component="h1" 
          sx={{ 
            mb: 4, 
            color: '#007934', 
            fontWeight: 900, 
            fontSize: { xs: '1.75rem', md: '2.25rem' },
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          }}
        >
          Dashboard
        </Typography>
        
        {/* Aktuellt projekt-information */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            level="h2" 
            component="h2" 
            sx={{ 
              fontWeight: 'bold', 
              color: 'text.primary',
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              lineHeight: 1.3
            }}
          >
            {currentProject?.name || 'Arkitektprojekt Översikt'}
          </Typography>
          <Typography level="body-md" sx={{ mb: 2, mt: 1, color: 'text.secondary' }}>
            {currentProject?.description || 'Välkommen till din projektöversikt. Här kan du se nyckeltal, tidslinjer och aktivitet för alla dina arkitektprojekt.'}
          </Typography>
          <Divider sx={{ bgcolor: '#e0f2e9', mb: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
              Statistik uppdaterad: {new Date().toLocaleDateString('sv-SE')}
            </Typography>
            
            <Button 
              variant="outlined" 
              color="primary" 
              startDecorator={<AddIcon />}
              onClick={() => setShowWidgetDialog(true)}
              sx={{ 
                bgcolor: '#e8f5e9', 
                borderColor: 'transparent', 
                color: '#007934',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#007934',
                  bgcolor: '#d7eeda'
                }
              }}
            >
              Anpassa dashboard
            </Button>
          </Box>
        </Box>
        
        {/* Dashboard-widgets */}
        <Grid container spacing={3}>
          {visibleWidgets.map((widget, index) => (
            <Grid key={widget.id} {...getGridSize(widget)}>
              <ModernDraggableWidget
                widget={widget}
                index={index}
                moveWidget={moveWidget}
                removeWidget={removeWidget}
                toggleExpand={toggleWidgetSize}
                isExpanded={expandedWidget === widget.id}
              >
                {renderWidget(widget)}
              </ModernDraggableWidget>
            </Grid>
          ))}
        </Grid>
        
        {/* Widgethanteraren dialog */}
        <Modal open={showWidgetDialog} onClose={() => setShowWidgetDialog(false)}>
          <ModalDialog 
            sx={{ 
              maxWidth: 500, 
              borderRadius: '16px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
            }}
          >
            <DialogTitle sx={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold',
              pb: 1
            }}>
              Anpassa din dashboard
            </DialogTitle>
            <DialogContent>
              <Typography level="body-sm" sx={{ mb: 3, color: 'text.secondary' }}>
                Här kan du anpassa dashboarden genom att visa eller dölja olika widgets.
              </Typography>
              
              {/* Widgets som är synliga */}
              <Typography level="title-md" sx={{ fontWeight: 'bold', mt: 2, mb: 2, color: '#007934' }}>
                Aktiva widgets
              </Typography>
              {visibleWidgets.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {visibleWidgets.map(widget => (
                    <Card 
                      key={widget.id} 
                      variant="soft" 
                      sx={{ 
                        p: 1.5, 
                        width: 'calc(50% - 12px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: '#e8f5e9',
                        border: '1px solid #c8e6c9',
                        borderRadius: '10px',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: '#d7eeda',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                        }
                      }}
                    >
                      <Typography level="body-sm" sx={{ fontWeight: 500 }}>{widget.title}</Typography>
                      <IconButton 
                        size="sm" 
                        onClick={() => removeWidget(widget.id)}
                        sx={{ 
                          color: '#b71c1c',
                          '&:hover': {
                            bgcolor: 'rgba(183, 28, 28, 0.08)'
                          }
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 2 }}>
                  Inga aktiva widgets. Lägg till någon nedan.
                </Typography>
              )}
              
              {/* Widgets som är dolda */}
              {hiddenWidgets.length > 0 && (
                <>
                  <Typography level="title-md" sx={{ fontWeight: 'bold', mt: 4, mb: 2, color: 'text.secondary' }}>
                    Tillgängliga widgets
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {hiddenWidgets.map(widget => (
                      <Card 
                        key={widget.id} 
                        variant="outlined" 
                        sx={{ 
                          p: 1.5, 
                          width: 'calc(50% - 12px)',
                          bgcolor: '#ffffff',
                          cursor: 'pointer',
                          border: '1px dashed #bdbdbd',
                          borderRadius: '10px',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: '#f5f5f5',
                            borderColor: '#9e9e9e'
                          }
                        }}
                        onClick={() => addWidget(widget.id)}
                      >
                        <Typography level="body-sm">{widget.title}</Typography>
                        <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5 }}>
                          Klicka för att lägga till
                        </Typography>
                      </Card>
                    ))}
                  </Box>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button 
                variant="solid" 
                color="primary" 
                onClick={() => setShowWidgetDialog(false)}
                sx={{ 
                  bgcolor: '#007934', 
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: '#006228'
                  }
                }}
              >
                Klar
              </Button>
            </DialogActions>
          </ModalDialog>
        </Modal>
      </Box>
    </DndProvider>
  );
};

export default ModernDashboard;