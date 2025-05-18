import React from 'react';
import { Card, Typography, Box } from '@mui/joy';
import { format } from 'date-fns';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface ModernRevenueWidgetProps {
  title?: string;
}

// Realistisk data för revenue
const revenueData = [
  { month: 'Jan', intäkter: 24000, kostnader: 19000 },
  { month: 'Feb', intäkter: 26000, kostnader: 20000 },
  { month: 'Mar', intäkter: 25000, kostnader: 18000 },
  { month: 'Apr', intäkter: 28000, kostnader: 19000 },
  { month: 'Maj', intäkter: 29000, kostnader: 21000 },
  { month: 'Jun', intäkter: 32000, kostnader: 22000 },
  { month: 'Jul', intäkter: 30000, kostnader: 21000 },
  { month: 'Aug', intäkter: 31000, kostnader: 22000 },
  { month: 'Sep', intäkter: 35000, kostnader: 23000 },
  { month: 'Okt', intäkter: 37000, kostnader: 24000 },
  { month: 'Nov', intäkter: 38000, kostnader: 25000 },
  { month: 'Dec', intäkter: 40000, kostnader: 26000 },
];

// Beräkna värdefull statistik
const totalRevenue = revenueData.reduce((sum, item) => sum + item.intäkter, 0);
const previousPeriodRevenue = revenueData.slice(0, 6).reduce((sum, item) => sum + item.intäkter, 0);
const currentPeriodRevenue = revenueData.slice(6).reduce((sum, item) => sum + item.intäkter, 0);
const changePercentage = ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100;

// Anpassad tooltip för diagrammet
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: '#fff',
          border: '1px solid #e0e0e0',
          p: 1.5,
          borderRadius: 'md',
          boxShadow: 'sm',
          minWidth: 180,
        }}
      >
        <Typography level="title-sm" sx={{ mb: 1 }}>
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              backgroundColor: '#007934',
              mr: 1,
              borderRadius: '50%',
            }}
          />
          <Typography level="body-sm" sx={{ color: 'text.secondary', mr: 0.5 }}>
            Intäkter:
          </Typography>
          <Typography level="body-sm" sx={{ fontWeight: 'bold' }}>
            {payload[0].value.toLocaleString()} kr
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              backgroundColor: '#90CAF9',
              mr: 1,
              borderRadius: '50%',
            }}
          />
          <Typography level="body-sm" sx={{ color: 'text.secondary', mr: 0.5 }}>
            Kostnader:
          </Typography>
          <Typography level="body-sm" sx={{ fontWeight: 'bold' }}>
            {payload[1].value.toLocaleString()} kr
          </Typography>
        </Box>
      </Box>
    );
  }
  return null;
};

const ModernRevenueWidget: React.FC<ModernRevenueWidgetProps> = ({ title = 'Intäkter & Kostnader' }) => {
  const currentDate = new Date();
  
  return (
    <Card
      sx={{
        p: 2,
        height: '100%',
        bgcolor: '#ffffff',
        boxShadow: 'sm', 
        border: '1px solid #e0e0e0',
        borderRadius: 'md',
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: 'md',
          transform: 'translateY(-2px)',
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Box>
          <Typography level="title-sm" sx={{ color: 'text.secondary', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {title}
          </Typography>
          <Typography level="h3" sx={{ color: 'text.primary', fontWeight: 'bold', mb: 0.5 }}>
            {totalRevenue.toLocaleString()} kr
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                color: changePercentage >= 0 ? '#007934' : '#f44336',
                fontWeight: 'bold',
                mr: 1,
              }}
            >
              {changePercentage >= 0 ? '↑' : '↓'} {Math.abs(changePercentage).toFixed(1)}%
            </Box>
            <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
              sedan förra perioden
            </Typography>
          </Box>
        </Box>
        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
          Uppdaterad: {format(currentDate, 'yyyy-MM-dd')}
        </Typography>
      </Box>
      
      <Box sx={{ height: 260, mt: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={revenueData}
            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#9e9e9e', fontSize: 12 }}
              axisLine={{ stroke: '#e0e0e0' }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: '#9e9e9e', fontSize: 12 }}
              axisLine={{ stroke: '#e0e0e0' }}
              tickLine={false}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="intäkter"
              stroke="#007934"
              strokeWidth={3}
              dot={{ fill: '#007934', strokeWidth: 2, r: 4 }}
              activeDot={{ fill: '#007934', strokeWidth: 2, r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="kostnader"
              stroke="#90CAF9"
              strokeWidth={2}
              dot={{ fill: '#90CAF9', strokeWidth: 2, r: 3 }}
              activeDot={{ fill: '#90CAF9', strokeWidth: 2, r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ 
            width: 12, 
            height: 12, 
            backgroundColor: '#007934', 
            borderRadius: '50%', 
            mr: 1 
          }} />
          <Typography level="body-xs">Intäkter</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ 
            width: 12, 
            height: 12, 
            backgroundColor: '#90CAF9', 
            borderRadius: '50%', 
            mr: 1 
          }} />
          <Typography level="body-xs">Kostnader</Typography>
        </Box>
      </Box>
    </Card>
  );
};

export default ModernRevenueWidget;