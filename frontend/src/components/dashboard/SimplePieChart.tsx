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
    <Card sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography level="title-md">{title}</Typography>
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
          overflow: 'hidden'
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
                  clipPath: `conic-gradient(from ${startAngle}deg at 50% 50%, ${item.color} 0deg, ${item.color} ${endAngle - startAngle}deg, transparent ${endAngle - startAngle}deg, transparent 360deg)`
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
            flexDirection: 'column'
          }}>
            <Typography level="h3" sx={{ fontWeight: 'bold' }}>
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
          <ListItem key={index}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: item.color,
                  mr: 1.5,
                }}
              />
              <Typography level="body-sm" sx={{ flexGrow: 1 }}>
                {item.name}
              </Typography>
              <Typography level="body-sm" sx={{ fontWeight: 'bold' }}>
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