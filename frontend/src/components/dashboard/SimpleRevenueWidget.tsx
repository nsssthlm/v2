import React, { useState } from 'react';
import { Box, Typography, Card, Select, Option } from '@mui/joy';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Data för intäkter och kostnader
const revenueData = [
  {
    month: 'Jan',
    intäkter: 540000,
    kostnader: 400000,
    vinst: 140000
  },
  {
    month: 'Feb',
    intäkter: 565000,
    kostnader: 415000,
    vinst: 150000
  },
  {
    month: 'Mar',
    intäkter: 580000,
    kostnader: 425000,
    vinst: 155000
  },
  {
    month: 'Apr',
    intäkter: 610000,
    kostnader: 440000,
    vinst: 170000
  },
  {
    month: 'Maj',
    intäkter: 625000,
    kostnader: 445000,
    vinst: 180000
  },
  {
    month: 'Jun',
    intäkter: 650000,
    kostnader: 460000,
    vinst: 190000
  },
  {
    month: 'Jul',
    intäkter: 680000,
    kostnader: 470000,
    vinst: 210000
  }
];

interface SimpleRevenueWidgetProps {
  title: string;
}

export default function SimpleRevenueWidget({ title }: SimpleRevenueWidgetProps) {
  const [period, setPeriod] = useState('year');
  
  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
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
            fontSize: '0.875rem',
            mb: 1
          }}
        >
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUpIcon sx={{ color: '#007934', fontSize: '1.25rem', mr: 1 }} />
            <Typography level="title-lg" sx={{ fontWeight: 700 }}>
              Ekonomisk översikt
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DateRangeOutlinedIcon sx={{ color: 'text.secondary', mr: 1, fontSize: '1rem' }} />
            <Select 
              value={period} 
              onChange={(_, newValue) => setPeriod(newValue as string)}
              size="sm"
              variant="outlined"
              sx={{ 
                minWidth: 100,
                '--Select-decoratorChildHeight': '24px'
              }}
            >
              <Option value="month">Månad</Option>
              <Option value="quarter">Kvartal</Option>
              <Option value="year">År</Option>
              <Option value="all">Allt</Option>
            </Select>
          </Box>
        </Box>
      </Box>
      
      {/* Diagraminnehåll */}
      <Box sx={{ flexGrow: 1, p: 2, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Sammanfattande statistik */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mb: 3,
            gap: 2,
            flexWrap: 'wrap'
          }}>
            <Box sx={{ 
              bgcolor: '#f8faf9', 
              borderRadius: '8px', 
              p: 1.5, 
              minWidth: 150,
              flexGrow: 1,
              border: '1px solid #e0f2e9'
            }}>
              <Typography level="body-xs" sx={{ color: 'text.secondary', mb: 0.5 }}>
                Total intäkt
              </Typography>
              <Typography level="h5" sx={{ color: '#2e7d32', fontWeight: 700 }}>
                4.32 Mkr
              </Typography>
              <Typography level="body-xs" sx={{ color: '#007934', display: 'flex', alignItems: 'center' }}>
                +8.2%
              </Typography>
            </Box>
            
            <Box sx={{ 
              bgcolor: '#f8faf9', 
              borderRadius: '8px', 
              p: 1.5, 
              minWidth: 150,
              flexGrow: 1,
              border: '1px solid #e0f2e9'
            }}>
              <Typography level="body-xs" sx={{ color: 'text.secondary', mb: 0.5 }}>
                Total kostnad
              </Typography>
              <Typography level="h5" sx={{ color: '#d32f2f', fontWeight: 700 }}>
                3.18 Mkr
              </Typography>
              <Typography level="body-xs" sx={{ color: '#d32f2f', display: 'flex', alignItems: 'center' }}>
                +5.1%
              </Typography>
            </Box>
            
            <Box sx={{ 
              bgcolor: '#f8faf9', 
              borderRadius: '8px', 
              p: 1.5, 
              minWidth: 150,
              flexGrow: 1,
              border: '1px solid #e0f2e9'
            }}>
              <Typography level="body-xs" sx={{ color: 'text.secondary', mb: 0.5 }}>
                Vinst
              </Typography>
              <Typography level="h5" sx={{ color: '#2e7d32', fontWeight: 700 }}>
                1.14 Mkr
              </Typography>
              <Typography level="body-xs" sx={{ color: '#007934', display: 'flex', alignItems: 'center' }}>
                +12.4%
              </Typography>
            </Box>
          </Box>
          
          {/* Diagram */}
          <Box sx={{ flexGrow: 1, height: '100%' }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={revenueData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#666666', fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fill: '#666666', fontSize: 12 }} 
                  tickFormatter={(value) => `${value/1000}k`}
                />
                <Tooltip 
                  formatter={(value) => [`${value} kr`, undefined]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="intäkter"
                  name="Intäkter"
                  stroke="#4caf50"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="kostnader" 
                  name="Kostnader"
                  stroke="#f44336"
                  strokeWidth={2} 
                />
                <Line 
                  type="monotone" 
                  dataKey="vinst" 
                  name="Vinst"
                  stroke="#2196f3"
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}