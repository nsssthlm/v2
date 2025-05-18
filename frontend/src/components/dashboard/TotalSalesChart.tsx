import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { Box, Card, Typography, IconButton, List, ListItem } from '@mui/joy';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface TotalSalesChartProps {
  title: string;
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const TotalSalesChart = ({ title, data }: TotalSalesChartProps) => {
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
      
      <Box sx={{ height: 230, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value} timmar`, '']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
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
                {item.value.toLocaleString()} kr
              </Typography>
            </Box>
          </ListItem>
        ))}
        
        <ListItem sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 1, pt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Typography level="body-sm" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              Totalt
            </Typography>
            <Typography level="body-sm" sx={{ fontWeight: 'bold' }}>
              {total.toLocaleString()} kr
            </Typography>
          </Box>
        </ListItem>
      </List>
    </Card>
  );
};

export default TotalSalesChart;