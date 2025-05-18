import React from 'react';
import { Box, Typography, Card } from '@mui/joy';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SimplePieChartProps {
  title: string;
  data: { name: string; value: number; color?: string }[];
  height?: number | string;
  width?: string;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

// Förinställda färger
const COLORS = ['#007934', '#43a047', '#66bb6a', '#81c784', '#a5d6a7', '#4caf50'];

// Anpassad tooltip
const CustomTooltip = ({ active, payload }: any) => {
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
          {payload[0].name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box 
            component="span" 
            sx={{ 
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              backgroundColor: payload[0].color 
            }} 
          />
          <Typography level="body-sm" sx={{ fontWeight: 600 }}>
            {payload[0].value} ({payload[0].payload.percent}%)
          </Typography>
        </Box>
      </Card>
    );
  }
  return null;
};

// Formatera percent-värden
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return percent > 0.05 ? (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor="middle" 
      dominantBaseline="central"
      style={{ fontWeight: 'bold', fontSize: '0.75rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

const SimplePieChart: React.FC<SimplePieChartProps> = ({ 
  title, 
  data,
  height = 300,
  width = '100%',
  showLegend = true,
  innerRadius = 0,
  outerRadius = 80
}) => {
  // Beräkna procent för varje sektion
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercent = data.map((item) => ({
    ...item,
    percent: ((item.value / total) * 100).toFixed(1)
  }));

  return (
    <Card 
      sx={{
        height: '100%',
        width: width,
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
      
      <Box sx={{ flexGrow: 1, p: 2, minHeight: height, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flexGrow: 1, minHeight: showLegend ? `calc(${height}px - 50px)` : height }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithPercent}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={outerRadius}
                innerRadius={innerRadius}
                fill="#8884d8"
                dataKey="value"
              >
                {dataWithPercent.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {showLegend && (
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ paddingTop: 20 }}
                  formatter={(value, entry, index) => {
                    return (
                      <span style={{ color: '#616161', fontSize: '0.75rem', marginRight: 10 }}>
                        {value} ({dataWithPercent[index]?.percent}%)
                      </span>
                    );
                  }}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </Box>
        
        {!showLegend && (
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center', 
            gap: 1.5,
            mt: 2
          }}>
            {dataWithPercent.map((item, index) => (
              <Box 
                key={`legend-${index}`} 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <Box 
                  sx={{ 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%', 
                    backgroundColor: item.color || COLORS[index % COLORS.length]
                  }} 
                />
                <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                  {item.name} ({item.percent}%)
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default SimplePieChart;