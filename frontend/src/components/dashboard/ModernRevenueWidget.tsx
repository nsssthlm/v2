import React from 'react';
import { Box, Card, Typography, Divider } from '@mui/joy';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

interface ModernRevenueWidgetProps {
  title?: string;
}

const ModernRevenueWidget: React.FC<ModernRevenueWidgetProps> = ({ title = 'INTÄKTER' }) => {
  // Data för diagrammet baserat på designbilden
  const dayLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun'];
  const currentData = [5000, 8000, 12000, 9000, 12000, 15000];
  const previousData = [3000, 6000, 9000, 7000, 10000, 12000];

  // Beräkna max-värde för visualiseringen
  const maxValue = Math.max(...currentData, ...previousData);
  
  return (
    <Card sx={{ 
      p: 0, 
      height: '100%', 
      boxShadow: 'sm',
      borderRadius: 'md',
      border: '1px solid',
      borderColor: '#e0e0e0',
      overflow: 'hidden',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        boxShadow: 'md',
        transform: 'translateY(-2px)'
      }
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        px: 2,
        py: 1.5
      }}>
        <Typography level="title-md" component="h3" sx={{ fontWeight: 'medium' }}>
          {title}
        </Typography>
        <Box sx={{ color: 'text.tertiary' }}>
          <MoreHorizIcon />
        </Box>
      </Box>
      
      <Box sx={{ px: 2, pt: 1, pb: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mb: 2 
        }}>
          <Box>
            <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
              Aktuell period
            </Typography>
            <Typography level="h3" sx={{ mt: 0.5, fontWeight: 'bold' }}>
              58,254 kr
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <Box 
                component="span" 
                sx={{ 
                  color: '#007934', 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Box component="span" sx={{ fontSize: 'sm' }}>↑</Box>
                <Box component="span">12.5%</Box>
              </Box>
              <Box component="span" sx={{ color: 'text.tertiary', ml: 1, fontSize: 'sm' }}>
                vs föregående period
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
              Föregående period
            </Typography>
            <Typography level="h3" sx={{ mt: 0.5, fontWeight: 'bold' }}>
              43,128 kr
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <Box sx={{ bgcolor: '#f8f8f8', px: 2, py: 2 }}>
        <Box sx={{ height: 200, position: 'relative' }}>
          {/* Horisontella linjer */}
          {[1, 2, 3, 4].map((_, index) => (
            <Box 
              key={index} 
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: index * 40,
                height: 1,
                bgcolor: '#e0e0e0',
                zIndex: 1
              }}
            />
          ))}
          
          {/* Vertikala staplar - aktuell period */}
          <Box sx={{ 
            display: 'flex', 
            height: '100%', 
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            justifyContent: 'space-around',
            alignItems: 'flex-end',
            zIndex: 2,
            px: 1
          }}>
            {currentData.map((value, index) => (
              <Box 
                key={`current-${index}`}
                sx={{
                  width: 20,
                  height: `${(value / maxValue) * 160}px`,
                  bgcolor: '#007934',
                  borderRadius: '3px 3px 0 0',
                  position: 'relative'
                }}
              />
            ))}
          </Box>
          
          {/* Vertikala staplar - föregående period */}
          <Box sx={{ 
            display: 'flex', 
            height: '100%', 
            position: 'absolute',
            bottom: 0,
            left: 8,
            right: 0,
            justifyContent: 'space-around',
            alignItems: 'flex-end',
            zIndex: 3,
            px: 1
          }}>
            {previousData.map((value, index) => (
              <Box 
                key={`previous-${index}`}
                sx={{
                  width: 20,
                  height: `${(value / maxValue) * 160}px`,
                  bgcolor: '#40a869',
                  borderRadius: '3px 3px 0 0',
                  opacity: 0.7
                }}
              />
            ))}
          </Box>
          
          {/* X-axel etiketter */}
          <Box sx={{ 
            display: 'flex', 
            position: 'absolute',
            bottom: -24,
            left: 0,
            right: 0,
            justifyContent: 'space-around',
            px: 1
          }}>
            {dayLabels.map((label, index) => (
              <Typography 
                key={index} 
                level="body-xs" 
                sx={{ color: 'text.tertiary' }}
              >
                {label}
              </Typography>
            ))}
          </Box>
        </Box>
        
        {/* Förklaring */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 3, 
          gap: 4 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                bgcolor: '#007934', 
                borderRadius: 'sm',
                mr: 1
              }} 
            />
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              Aktuell period
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                bgcolor: '#40a869', 
                borderRadius: 'sm',
                opacity: 0.7,
                mr: 1
              }} 
            />
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              Föregående period
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default ModernRevenueWidget;