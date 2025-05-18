import React, { useRef } from 'react';
import { Card, Box, Typography, IconButton, Sheet } from '@mui/joy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import { useDrag, useDrop } from 'react-dnd';
import { DashboardWidget } from './ModernDashboard';

// Identifierare för drag-and-drop
const WIDGET_TYPE = 'dashboard-widget';

interface ModernDraggableWidgetProps {
  widget: DashboardWidget;
  index: number;
  moveWidget: (dragIndex: number, hoverIndex: number) => void;
  removeWidget: (id: string) => void;
  toggleExpand: (id: string) => void;
  isExpanded: boolean;
  children: React.ReactNode;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const ModernDraggableWidget: React.FC<ModernDraggableWidgetProps> = ({
  widget,
  index,
  moveWidget,
  removeWidget,
  toggleExpand,
  isExpanded,
  children
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Konfigurera drag-funktionalitet
  const [{ isDragging }, drag] = useDrag({
    type: WIDGET_TYPE,
    item: { index, id: widget.id, type: WIDGET_TYPE } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });
  
  // Konfigurera drop-funktionalitet
  const [{ isOver }, drop] = useDrop({
    accept: WIDGET_TYPE,
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Undvik onödig uppdatering om vi drar över samma widget
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // Flytta widget i dashboard
      moveWidget(dragIndex, hoverIndex);
      
      // Uppdatera index för dragen widget
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });
  
  // Kombinera drag och drop
  drag(drop(ref));
  
  // Beräkna styling baserat på drag-status
  const opacity = isDragging ? 0.4 : 1;
  const scale = isOver ? 1.02 : 1;
  const zIndex = isOver ? 10 : 1;
  
  return (
    <Card
      ref={ref}
      sx={{
        opacity,
        transform: `scale(${scale})`,
        zIndex,
        transition: 'all 0.2s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        bgcolor: '#ffffff',
        position: 'relative',
        boxShadow: isExpanded 
          ? '0 8px 32px rgba(0, 0, 0, 0.12)' 
          : '0 4px 16px rgba(0, 0, 0, 0.06)',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0, 121, 52, 0.08)',
          border: '1px solid rgba(0, 121, 52, 0.12)',
        },
        border: '1px solid rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
      }}
    >
      {/* Widget Header - visar alltid oavsett widget-typ */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'rgba(0, 0, 0, 0.04)',
          cursor: 'move',
          background: 'linear-gradient(to right, #f8faf9, #e8f5e9)',
        }}
      >
        <Typography
          level="title-md"
          sx={{
            fontWeight: 600,
            color: '#2e7d32',
            letterSpacing: '-0.01em',
            fontSize: { xs: '0.9rem', md: '1rem' },
          }}
        >
          {widget.title}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            variant="plain"
            color="neutral"
            size="sm"
            onClick={() => toggleExpand(widget.id)}
            sx={{
              '&:hover': {
                bgcolor: 'rgba(0, 121, 52, 0.08)',
              },
            }}
          >
            {isExpanded ? (
              <CloseFullscreenIcon fontSize="small" />
            ) : (
              <OpenInFullIcon fontSize="small" />
            )}
          </IconButton>
          
          <IconButton
            variant="plain"
            color="danger"
            size="sm"
            onClick={() => removeWidget(widget.id)}
            sx={{
              '&:hover': {
                bgcolor: 'rgba(211, 47, 47, 0.08)',
              },
            }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      {/* Widget Content */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 2,
          transition: 'all 0.3s ease',
          // Förbättra visuellt djup med subtil gradient
          background: 'linear-gradient(145deg, #ffffff, #fafcfa)',
        }}
      >
        {children}
      </Box>
    </Card>
  );
};

export default ModernDraggableWidget;