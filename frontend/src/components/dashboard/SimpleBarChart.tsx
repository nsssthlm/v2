import React from 'react';
import { Box, Card, Typography, IconButton } from '@mui/joy';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface SimpleBarChartProps {
  title: string;
  data: Array<{
    name: string;
    projected: number;
    actual: number;
  }>;
}

const SimpleBarChart = ({ title, data }: SimpleBarChartProps) => {
  // Eftersom Recharts har kompatibilitetsproblem så ersätter vi med en enkel representation
  const maxValue = Math.max(...data.flatMap(d => [d.projected, d.actual]));

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

      <Box sx={{ height: '300px', overflowX: 'auto', overflowY: 'hidden', mb: 1 }}>
        <Box sx={{ display: 'flex', height: '100%', minWidth: data.length * 70, gap: 2 }}>
          {data.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', flexDirection: 'column', flex: 1, px: 0.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'flex-end' }}>
                <Box 
                  sx={{ 
                    height: `${(item.projected / maxValue) * 100}%`, 
                    bgcolor: '#e0e0e0',
                    width: '100%',
                    mb: 0.5,
                    borderRadius: '4px 4px 0 0',
                    position: 'relative',
                    '&:hover': {
                      opacity: 0.9
                    }
                  }} 
                />
                <Box 
                  sx={{ 
                    height: `${(item.actual / maxValue) * 100}%`, 
                    bgcolor: '#60cd18',
                    width: '100%',
                    borderRadius: '4px 4px 0 0',
                    position: 'relative',
                    '&:hover': {
                      opacity: 0.9
                    }
                  }} 
                />
              </Box>
              <Typography level="body-xs" textAlign="center" sx={{ mt: 1, color: 'text.secondary' }}>
                {item.name}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', mt: 3, justifyContent: 'center', gap: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 12, height: 12, bgcolor: '#e0e0e0', mr: 1, borderRadius: '2px' }} />
          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Planerade timmar</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 12, height: 12, bgcolor: '#60cd18', mr: 1, borderRadius: '2px' }} />
          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Faktiska timmar</Typography>
        </Box>
      </Box>
    </Card>
  );
};

export default SimpleBarChart;