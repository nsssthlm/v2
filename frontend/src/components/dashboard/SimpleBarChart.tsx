import React from 'react';
import { Box, Typography, Card } from '@mui/joy';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SimpleBarChartProps {
  title: string;
  data: any[];
  height?: number | string;
}

// Anpassad tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Card variant="outlined" sx={{ 
        p: 1.5, 
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(0, 121, 52, 0.12)',
        backdropFilter: 'blur(8px)',
        background: 'rgba(255, 255, 255, 0.95)'
      }}>
        <Typography level="title-sm" sx={{ mb: 0.5, fontWeight: 600 }}>
          {label}
        </Typography>
        {payload.map((entry: any, index: number) => (
          <Box key={`tooltip-item-${index}`} sx={{ 
            display: 'flex', 
            alignItems: 'center',
            mb: index === payload.length - 1 ? 0 : 0.5,
            gap: 1
          }}>
            <Box 
              component="span" 
              sx={{ 
                width: 10, 
                height: 10, 
                borderRadius: '50%', 
                backgroundColor: entry.color 
              }} 
            />
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              {entry.name}:
            </Typography>
            <Typography level="body-sm" sx={{ fontWeight: 600 }}>
              {entry.value}
            </Typography>
          </Box>
        ))}
      </Card>
    );
  }

  return null;
};

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ 
  title, 
  data,
  height = 300
}) => {
  return (
    <Card 
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        transition: 'box-shadow 0.2s',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0, 121, 52, 0.08)',
          border: '1px solid rgba(0, 121, 52, 0.12)'
        }
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'rgba(0, 0, 0, 0.04)' }}>
        <Typography 
          level="title-md" 
          sx={{ 
            fontWeight: 600, 
            color: '#2e7d32',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: '0.875rem'
          }}
        >
          {title}
        </Typography>
      </Box>
      
      <Box sx={{ flexGrow: 1, p: 2, minHeight: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#757575' }} 
              axisLine={{ stroke: '#e0e0e0' }}
              tickLine={{ stroke: '#e0e0e0' }}
            />
            <YAxis 
              tick={{ fill: '#757575' }} 
              axisLine={{ stroke: '#e0e0e0' }}
              tickLine={{ stroke: '#e0e0e0' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: 10 }}
              formatter={(value) => {
                return <span style={{ color: '#616161', fontSize: '0.875rem' }}>{value}</span>;
              }}
            />
            <Bar 
              dataKey="planerat" 
              name="Planerade timmar" 
              fill="#007934" 
              radius={[4, 4, 0, 0]}
              barSize={25}
            />
            <Bar 
              dataKey="faktiskt" 
              name="Faktiska timmar" 
              fill="#81c784" 
              radius={[4, 4, 0, 0]}
              barSize={25}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
};

export default SimpleBarChart;