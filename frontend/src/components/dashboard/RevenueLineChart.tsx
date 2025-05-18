import React from 'react';
import { 
  Card, 
  Box, 
  Typography, 
  Button, 
  Stack, 
  Divider, 
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
  ResponsiveContainer,
  Area
} from 'recharts';

interface RevenueData {
  name: string;
  currentWeek: number;
  previousWeek: number;
}

interface RevenueLineChartProps {
  title?: string;
}

const RevenueLineChart: React.FC<RevenueLineChartProps> = ({ title = 'INTÄKTER' }) => {
  // Data för diagrammet
  const data: RevenueData[] = [
    { name: 'Mån', currentWeek: 9000, previousWeek: 0 },
    { name: 'Tis', currentWeek: 18000, previousWeek: 15000 },
    { name: 'Ons', currentWeek: 15000, previousWeek: 9000 },
    { name: 'Tor', currentWeek: 23000, previousWeek: 27000 },
    { name: 'Fre', currentWeek: 20000, previousWeek: 15000 },
    { name: 'Lör', currentWeek: 27000, previousWeek: 36000 },
    { name: 'Sön', currentWeek: 22000, previousWeek: 25000 },
  ];

  // Formatering av siffror till valuta
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('sv-SE', { 
      style: 'currency', 
      currency: 'SEK',
      maximumFractionDigits: 0 
    }).format(value);
  };

  const currentWeekTotal = data.reduce((sum, item) => sum + item.currentWeek, 0);
  const previousWeekTotal = data.reduce((sum, item) => sum + item.previousWeek, 0);
  
  // Custom tooltip som visas när man hovrar över diagrammet
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ 
          bgcolor: 'white', 
          p: 1.5, 
          border: '1px solid #e0e0e0',
          borderRadius: 'md',
          boxShadow: 'sm'
        }}>
          <Typography level="body-sm" fontWeight="bold">
            {label}
          </Typography>
          <Typography level="body-sm" sx={{ color: '#7367f0' }}>
            Denna vecka: {formatCurrency(payload[0].value)}
          </Typography>
          <Typography level="body-sm" sx={{ color: '#00e396' }}>
            Förra veckan: {formatCurrency(payload[1].value)}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card variant="outlined" sx={{ 
      height: '100%',
      p: 0,
      overflow: 'hidden'
    }}>
      {/* Kort huvud med titel och meny */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Typography level="title-md" fontWeight="bold">
          {title}
        </Typography>
        <IconButton variant="plain" size="sm">
          <MoreVertIcon />
        </IconButton>
      </Box>
      
      {/* Summeringsavsnitt */}
      <Box sx={{ 
        bgcolor: '#fafafa', 
        p: 2,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-around',
        gap: 2
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography level="body-sm" sx={{ mb: 1, color: 'text.secondary' }}>
            Aktuell vecka
          </Typography>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
            <Box sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              bgcolor: '#7367f0' 
            }} />
            <Typography level="h3" fontWeight="bold" sx={{ color: 'text.primary' }}>
              {formatCurrency(currentWeekTotal)}
            </Typography>
          </Stack>
        </Box>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography level="body-sm" sx={{ mb: 1, color: 'text.secondary' }}>
            Föregående vecka
          </Typography>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
            <Box sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              bgcolor: '#00e396' 
            }} />
            <Typography level="h3" fontWeight="bold" sx={{ color: 'text.primary' }}>
              {formatCurrency(previousWeekTotal)}
            </Typography>
          </Stack>
        </Box>
      </Box>
      
      {/* Dagens intäkter */}
      <Box sx={{ p: 2 }}>
        <Typography level="title-sm" fontWeight="bold" sx={{ mb: 1 }}>
          Dagens intäkter: {formatCurrency(2562.30)}
        </Typography>
        <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 2 }}>
          Sammanfattning av intäkter från projekt och timdebitering.
          Diagrammet visar jämförelse mellan denna vecka och föregående.
        </Typography>
        
        <Button 
          variant="outlined" 
          color="primary" 
          endDecorator={<ArrowForwardIcon />}
          size="sm"
          sx={{ mb: 2 }}
        >
          Visa rapporter
        </Button>
      </Box>
      
      {/* Linjediagram */}
      <Box sx={{ height: 250, width: '100%', mt: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tickFormatter={(value) => `${value/1000}k`}
              ticks={[0, 9000, 18000, 27000, 36000]}
              domain={[0, 'dataMax + 5000']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="currentWeek" 
              stroke="#7367f0" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="previousWeek" 
              stroke="#00e396" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
};

export default RevenueLineChart;