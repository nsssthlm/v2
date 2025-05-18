import React from 'react';
import { 
  Card, 
  Box, 
  Typography, 
  Divider, 
  Button,
  IconButton
} from '@mui/joy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

interface RevenueData {
  name: string;
  currentWeek: number;
  previousWeek: number;
}

interface ModernRevenueChartProps {
  title?: string;
}

const ModernRevenueChart: React.FC<ModernRevenueChartProps> = ({ title = 'INTÄKTER' }) => {
  // Data för diagrammet som matchar bilden
  const data: RevenueData[] = [
    { name: 'Mån', currentWeek: 9000, previousWeek: 0 },
    { name: 'Tis', currentWeek: 18000, previousWeek: 15000 },
    { name: 'Ons', currentWeek: 16000, previousWeek: 9000 },
    { name: 'Tor', currentWeek: 27000, previousWeek: 22000 },
    { name: 'Fre', currentWeek: 18000, previousWeek: 36000 },
    { name: 'Lör', currentWeek: 27000, previousWeek: 30000 },
    { name: 'Sön', currentWeek: 24000, previousWeek: 28000 },
  ];

  // Format nummer med tusentalsavgränsare
  const formatCurrency = (num: number) => {
    return "$" + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Custom tooltip för diagram
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: '#fff',
            p: 1.5,
            border: '1px solid #ddd',
            borderRadius: 'sm',
            boxShadow: 'sm',
          }}
        >
          <Typography level="title-sm">{label}</Typography>
          <Box sx={{ mt: 1 }}>
            <Typography level="body-sm" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Box
                component="span"
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: '#8884d8',
                  display: 'inline-block',
                  mr: 1,
                }}
              />
              Current Week: {formatCurrency(payload[0].value)}
            </Typography>
            <Typography level="body-sm" sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                component="span"
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: '#00D397',
                  display: 'inline-block',
                  mr: 1,
                }}
              />
              Previous Week: {formatCurrency(payload[1].value)}
            </Typography>
          </Box>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card variant="outlined" sx={{ 
      height: '100%', 
      bgcolor: 'background.surface',
      boxShadow: 'none',
      borderRadius: 'lg',
      border: '1px solid',
      borderColor: 'divider' 
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography level="title-md">{title}</Typography>
        <IconButton size="sm" variant="plain" color="neutral">
          <MoreVertIcon />
        </IconButton>
      </Box>
      
      <Box sx={{ p: 2, bgcolor: '#f5f9f7', mt: 2, borderRadius: 'md' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              Current Week
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: '#8884d8' 
                }} 
              />
              <Typography level="h4" sx={{ fontWeight: 'bold' }}>
                $58,254
              </Typography>
            </Box>
          </Box>
          
          <Box>
            <Typography level="body-sm" sx={{ color: 'text.secondary', textAlign: 'right' }}>
              Previous Week
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
              <Box 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: '#00D397' 
                }} 
              />
              <Typography level="h4" sx={{ fontWeight: 'bold' }}>
                $69,524
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      
      <Box sx={{ mt: 3, mb: 2 }}>
        <Typography level="title-sm" sx={{ fontWeight: 'bold' }}>
          Today's Earning: $2,562.30
        </Typography>
        <Typography level="body-sm" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus...
        </Typography>
        
        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          endDecorator={<ArrowForwardIcon />}
          sx={{ mt: 2 }}
        >
          View Statements
        </Button>
      </Box>
      
      <Box sx={{ width: '100%', height: 250, mt: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 5,
              left: 5,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#777', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#777', fontSize: 12 }}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="currentWeek"
              stroke="#8884d8"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="previousWeek"
              stroke="#00D397"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
};

export default ModernRevenueChart;