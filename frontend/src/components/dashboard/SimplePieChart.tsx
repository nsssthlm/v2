import React from 'react';
import { Box, Card, Typography, IconButton, List, ListItem } from '@mui/joy';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface PieChartProps {
  title: string;
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const SimplePieChart = ({ title, data }: PieChartProps) => {
  // Beräkna total summa
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <Card variant="plain" sx={{ 
      p: 2, 
      height: '100%',
      bgcolor: 'background.surface', 
      boxShadow: 'none',
      borderRadius: 'lg',
      border: '1px solid',
      borderColor: 'divider'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography level="title-sm" sx={{ 
          textTransform: 'uppercase', 
          letterSpacing: '0.5px',
          color: 'text.secondary',
          fontWeight: 'medium'
        }}>
          {title}
        </Typography>
        <IconButton variant="plain" color="neutral" size="sm">
          <MoreVertIcon />
        </IconButton>
      </Box>
      
      <Box sx={{ height: 230, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ 
          position: 'relative', 
          width: 160, 
          height: 160,
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          {data.map((item, index, arr) => {
            // Beräkna startposition för varje cirkelsektor
            const prevSectorsSum = arr
              .slice(0, index)
              .reduce((sum, prevItem) => sum + prevItem.value, 0);
            
            const startAngle = (prevSectorsSum / total) * 360;
            const endAngle = ((prevSectorsSum + item.value) / total) * 360;
            
            // För små sektorer (< 10%) visa endast visuellt, etiketten visas bara i listan
            return (
              <Box 
                key={index}
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: item.color,
                  clipPath: `conic-gradient(from ${startAngle}deg at 50% 50%, ${item.color} 0deg, ${item.color} ${endAngle - startAngle}deg, transparent ${endAngle - startAngle}deg, transparent 360deg)`,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    opacity: 0.9,
                    transform: 'scale(1.02)'
                  }
                }}
              />
            );
          })}
          
          {/* Inre cirkel för cirkeldiagrameffekt */}
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            width: '60%', 
            height: '60%', 
            borderRadius: '50%', 
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            boxShadow: '0 0 8px rgba(0,0,0,0.05)'
          }}>
            <Typography level="h3" sx={{ fontWeight: 'bold', color: '#60cd18' }}>
              {total}
            </Typography>
            <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
              Totalt
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <List sx={{ '--ListItem-paddingY': '0.5rem' }}>
        {data.map((item, index) => (
          <ListItem key={index} sx={{ py: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '2px',
                  bgcolor: item.color,
                  mr: 1.5,
                }}
              />
              <Typography level="body-sm" sx={{ flexGrow: 1, color: 'text.secondary' }}>
                {item.name}
              </Typography>
              <Typography level="body-sm" sx={{ fontWeight: 'bold', color: item.name === 'Nybyggnation' ? '#60cd18' : 'text.primary' }}>
                {item.value} ({Math.round((item.value / total) * 100)}%)
              </Typography>
            </Box>
          </ListItem>
        ))}
      </List>
    </Card>
  );
};

export default SimplePieChart;