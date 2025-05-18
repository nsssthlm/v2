import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Card, Box, IconButton, Grid } from '@mui/joy';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { DashboardWidget } from '../../pages/dashboard/Dashboard';

// Konstant för drag-and-drop typen
const WIDGET_TYPE = 'DASHBOARD_WIDGET';

interface DraggableWidgetProps {
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

const DraggableWidget: React.FC<DraggableWidgetProps> = ({
  widget,
  index,
  moveWidget,
  removeWidget,
  toggleExpand,
  isExpanded,
  children
}) => {
  // Referens till den faktiska DOM-noden
  const ref = useRef<HTMLDivElement>(null);
  
  // Sätt upp drop target (där andra widgets kan släppas)
  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: string | symbol | null }>({
    accept: WIDGET_TYPE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Hoppa över om musen hovrar över samma objekt
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // Bestäm rektanglar för UI-element
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      
      // Hitta mittpunkter
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      
      // Bestäm musens position
      const clientOffset = monitor.getClientOffset();
      
      if (!clientOffset) {
        return;
      }
      
      // Hitta musens position relativt till det hövrade elementet
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;
      
      // Utför flyttning oavsett riktning (vänster-höger, höger-vänster, upp-ner, ner-upp)
      // Detta gör att drag-and-drop fungerar i alla riktningar
      
      // Dags att flytta widgeten
      moveWidget(dragIndex, hoverIndex);
      
      // Uppdatera indexet på det dragna objektet omedelbart
      item.index = hoverIndex;
    },
  });
  
  // Sätt upp drag source (vad som kan dras)
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: WIDGET_TYPE,
    item: () => {
      return { id: widget.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  // Kombinera drag och drop funktionalitet
  dragPreview(drop(ref));
  
  return (
    <div
      ref={ref}
      style={{ 
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        height: '100%'
      }}
      data-handler-id={handlerId}
    >
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
        {/* Handtag för drag-and-drop */}
        <Box
          ref={drag}
          sx={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            cursor: 'grab',
            zIndex: 10,
            p: 0.5,
            borderRadius: 'md',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
            '&:hover': {
              color: '#007934',
              bgcolor: 'rgba(224, 242, 233, 0.7)'
            }
          }}
        >
          <DragIndicatorIcon fontSize="small" />
        </Box>
        
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
            onClick={() => toggleExpand(widget.id)}
          >
            {isExpanded ? 
              <FullscreenExitIcon fontSize="small" /> : 
              <FullscreenIcon fontSize="small" />
            }
          </IconButton>
        </Box>
        
        {/* Widget-innehåll */}
        <Box sx={{ p: 2, height: '100%', pt: 4 }}>
          {children}
        </Box>
      </Card>
    </div>
  );
};

export default DraggableWidget;