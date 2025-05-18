import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Box, IconButton } from '@mui/joy';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { DashboardWidget } from '../../pages/dashboard/Dashboard';

// Konstant för drag-and-drop typen
const WIDGET_TYPE = 'DASHBOARD_WIDGET';

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
        height: '100%'
      }}
      data-handler-id={handlerId}
    >
      <Box 
        sx={{ 
          height: '100%', 
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
          border: '1px solid #f0f0f0',
          transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
          transform: 'translateY(0)',
          '&:hover': {
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            transform: 'translateY(-4px)',
            borderColor: '#e0e0e0',
            '& .widget-controls': {
              opacity: 1,
              transform: 'translateY(0)'
            },
            '& .drag-handle': {
              opacity: 1,
              transform: 'translateY(0)'
            }
          }
        }}
      >
        {/* Handtag för drag-and-drop */}
        <Box
          className="drag-handle"
          ref={drag}
          sx={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            cursor: 'grab',
            zIndex: 10,
            p: 0.5,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(0, 0, 0, 0.4)',
            opacity: 0,
            transform: 'translateY(-5px)',
            transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
            width: '28px',
            height: '28px',
            '&:hover': {
              color: '#007934',
              backgroundColor: 'rgba(224, 242, 233, 0.7)'
            },
            '&:active': {
              cursor: 'grabbing',
              backgroundColor: 'rgba(224, 242, 233, 0.9)'
            }
          }}
        >
          <DragIndicatorIcon style={{ fontSize: '18px' }} />
        </Box>
        
        {/* Widget-kontroller */}
        <Box 
          className="widget-controls"
          sx={{ 
            position: 'absolute', 
            top: '12px', 
            right: '12px', 
            display: 'flex',
            opacity: 0,
            transform: 'translateY(-5px)',
            transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
            zIndex: 10,
            gap: 0.5,
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            p: '4px',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Expandera/förminska-knapp */}
          <IconButton 
            size="sm"
            sx={{
              color: '#007934',
              borderRadius: '6px',
              backgroundColor: 'rgba(224, 242, 233, 0.5)',
              '&:hover': {
                backgroundColor: 'rgba(224, 242, 233, 0.9)'
              },
              width: '26px',
              height: '26px'
            }}
            onClick={() => toggleExpand(widget.id)}
          >
            {isExpanded ? 
              <FullscreenExitIcon style={{ fontSize: '16px' }} /> : 
              <FullscreenIcon style={{ fontSize: '16px' }} />
            }
          </IconButton>

          {/* Ta bort-knapp */}
          <IconButton 
            size="sm"
            sx={{
              color: '#e53935',
              borderRadius: '6px',
              backgroundColor: 'rgba(253, 237, 237, 0.5)',
              '&:hover': {
                backgroundColor: 'rgba(253, 237, 237, 0.9)'
              },
              width: '26px',
              height: '26px'
            }}
            onClick={() => removeWidget(widget.id)}
          >
            <CloseIcon style={{ fontSize: '16px' }} />
          </IconButton>
        </Box>
        
        {/* Widget-innehåll med inre skugga för 3D-effekt */}
        <Box 
          sx={{ 
            p: 3,
            height: '100%', 
            pt: 5,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '6px',
              background: 'linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0) 100%)',
              zIndex: 1
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '6px',
              background: 'linear-gradient(0deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0) 100%)',
              zIndex: 1
            }
          }}
        >
          {children}
        </Box>
      </Box>
    </div>
  );
};

export default ModernDraggableWidget;