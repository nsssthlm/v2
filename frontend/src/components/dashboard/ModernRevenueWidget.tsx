import React, { useState } from 'react';
import { Box, Typography, Card, Tabs, TabList, Tab, TabPanel, Select, Option } from '@mui/joy';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Data för intäkter och kostnader
const revenueData = [
  {
    month: 'Jan',
    intäkter: 42500,
    kostnader: 31200,
    vinst: 11300
  },
  {
    month: 'Feb',
    intäkter: 47800,
    kostnader: 32600,
    vinst: 15200
  },
  {
    month: 'Mar',
    intäkter: 54200,
    kostnader: 35800,
    vinst: 18400
  },
  {
    month: 'Apr',
    intäkter: 61500,
    kostnader: 41200,
    vinst: 20300
  },
  {
    month: 'Maj',
    intäkter: 59800,
    kostnader: 42500,
    vinst: 17300
  },
  {
    month: 'Jun',
    intäkter: 65300,
    kostnader: 45100,
    vinst: 20200
  },
  {
    month: 'Jul',
    intäkter: 68900,
    kostnader: 46300,
    vinst: 22600
  }
];

// Data för kostnadsfördelning
const costBreakdownData = [
  {
    month: 'Jan',
    personal: 18700,
    material: 8500,
    tjänster: 4000
  },
  {
    month: 'Feb',
    personal: 19200,
    material: 8900,
    tjänster: 4500
  },
  {
    month: 'Mar',
    personal: 21300,
    material: 9600,
    tjänster: 4900
  },
  {
    month: 'Apr',
    personal: 25000,
    material: 10200,
    tjänster: 6000
  },
  {
    month: 'Maj',
    personal: 25800,
    material: 10700,
    tjänster: 6000
  },
  {
    month: 'Jun',
    personal: 27100,
    material: 11800,
    tjänster: 6200
  },
  {
    month: 'Jul',
    personal: 27900,
    material: 12100,
    tjänster: 6300
  }
];

interface ModernRevenueWidgetProps {
  title: string;
}

const ModernRevenueWidget: React.FC<ModernRevenueWidgetProps> = ({ title }) => {
  // State för aktiv tab - intäkter/kostnader eller kostnadsfördelning
  const [activeTab, setActiveTab] = useState(0);
  
  // State för tidsperiod
  const [period, setPeriod] = useState('7m'); // 7 månader
  
  // Formatera pengar med valutasymbol och tusentalsavgränsare
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', { 
      style: 'currency', 
      currency: 'SEK',
      maximumFractionDigits: 0 
    }).format(amount);
  };
  
  // Anpassad tooltip för diagram
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
                {formatCurrency(entry.value)}
              </Typography>
            </Box>
          ))}
        </Card>
      );
    }
  
    return null;
  };

  return (
    <Card 
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
        transition: 'box-shadow 0.2s',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0, 121, 52, 0.08)',
          border: '1px solid rgba(0, 121, 52, 0.12)'
        }
      }}
    >
      {/* Header med flikar och filter */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'rgba(0, 0, 0, 0.04)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box 
              sx={{ 
                bgcolor: '#e8f5e9', 
                borderRadius: '50%', 
                width: 34, 
                height: 34, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 121, 52, 0.08)'
              }}
            >
              <TrendingUpIcon sx={{ color: '#007934', fontSize: '1.3rem' }} />
            </Box>
            <Typography level="title-lg" sx={{ fontWeight: 600, color: '#2e7d32' }}>
              {title}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DateRangeOutlinedIcon sx={{ color: 'text.secondary', fontSize: '1.1rem' }} />
            <Select 
              variant="soft" 
              size="sm"
              defaultValue={period}
              onChange={(_, value) => setPeriod(value as string)}
              sx={{ 
                minWidth: 100,
                bgcolor: '#f5f5f5',
                '& button': { py: 0.5 }
              }}
            >
              <Option value="3m">3 mån</Option>
              <Option value="7m">7 mån</Option>
              <Option value="12m">12 mån</Option>
              <Option value="ytd">YTD</Option>
            </Select>
          </Box>
        </Box>
        
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue as number)} 
          sx={{ 
            backgroundColor: '#f8faf9', 
            borderRadius: '8px', 
            '--Tab-indicatorColor': '#007934' 
          }}
        >
          <TabList sx={{ bgcolor: 'transparent' }}>
            <Tab
              variant={activeTab === 0 ? "soft" : "plain"}
              sx={{ 
                fontWeight: 600, 
                fontSize: '0.875rem',
                bgcolor: activeTab === 0 ? '#e8f5e9' : 'transparent',
                color: activeTab === 0 ? '#007934' : 'text.secondary',
                '&:hover': {
                  bgcolor: activeTab === 0 ? '#e8f5e9' : 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              Intäkter & Kostnader
            </Tab>
            <Tab
              variant={activeTab === 1 ? "soft" : "plain"}
              sx={{ 
                fontWeight: 600, 
                fontSize: '0.875rem',
                bgcolor: activeTab === 1 ? '#e8f5e9' : 'transparent',
                color: activeTab === 1 ? '#007934' : 'text.secondary',
                '&:hover': {
                  bgcolor: activeTab === 1 ? '#e8f5e9' : 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              Kostnadsfördelning
            </Tab>
          </TabList>
        </Tabs>
      </Box>
      
      {/* Diagraminnehåll */}
      <Box sx={{ flexGrow: 1, p: 2, overflow: 'hidden' }}>
        <TabPanel value={0} sx={{ p: 0, height: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Sammanfattande statistik */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mb: 3,
              gap: 2,
              flexWrap: 'wrap'
            }}>
              <Card
                variant="outlined"
                sx={{ 
                  p: 1.5, 
                  minWidth: 130,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: '#f8faf9',
                  border: '1px solid #e0f2e9',
                  boxShadow: 'none'
                }}
              >
                <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  Intäkter
                </Typography>
                <Typography level="h4" sx={{ fontWeight: 700, color: '#007934' }}>
                  {formatCurrency(revenueData[revenueData.length - 1].intäkter)}
                </Typography>
                <Typography level="body-xs" sx={{ color: '#4caf50', mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TrendingUpIcon sx={{ fontSize: '1rem' }} /> +5.3%
                </Typography>
              </Card>
              
              <Card
                variant="outlined"
                sx={{ 
                  p: 1.5, 
                  minWidth: 130,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: '#f8faf9',
                  border: '1px solid #e0f2e9',
                  boxShadow: 'none'
                }}
              >
                <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  Kostnader
                </Typography>
                <Typography level="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>
                  {formatCurrency(revenueData[revenueData.length - 1].kostnader)}
                </Typography>
                <Typography level="body-xs" sx={{ color: '#d32f2f', mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TrendingUpIcon sx={{ fontSize: '1rem' }} /> +2.7%
                </Typography>
              </Card>
              
              <Card
                variant="outlined"
                sx={{ 
                  p: 1.5, 
                  minWidth: 130,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: '#f8faf9',
                  border: '1px solid #e0f2e9',
                  boxShadow: 'none'
                }}
              >
                <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  Resultat
                </Typography>
                <Typography level="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
                  {formatCurrency(revenueData[revenueData.length - 1].vinst)}
                </Typography>
                <Typography level="body-xs" sx={{ color: '#1976d2', mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TrendingUpIcon sx={{ fontSize: '1rem' }} /> +11.4%
                </Typography>
              </Card>
            </Box>
            
            {/* Intäkter & kostnader diagram */}
            <Box sx={{ flexGrow: 1, minHeight: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueData}
                  margin={{
                    top: 5,
                    right: 20,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#757575' }} 
                    axisLine={{ stroke: '#e0e0e0' }}
                    tickLine={{ stroke: '#e0e0e0' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${value / 1000}k`}
                    tick={{ fill: '#757575' }} 
                    axisLine={{ stroke: '#e0e0e0' }}
                    tickLine={{ stroke: '#e0e0e0' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    formatter={(value) => {
                      return <span style={{ color: '#616161', fontSize: '0.875rem' }}>{value}</span>;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="intäkter"
                    name="Intäkter"
                    stroke="#007934"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="kostnader"
                    name="Kostnader"
                    stroke="#d32f2f"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="vinst"
                    name="Resultat"
                    stroke="#1976d2"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </TabPanel>
        
        <TabPanel value={1} sx={{ p: 0, height: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Sammanfattande statistik för kostnader */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mb: 3,
              gap: 2,
              flexWrap: 'wrap'
            }}>
              <Card
                variant="outlined"
                sx={{ 
                  p: 1.5, 
                  minWidth: 130,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: '#f8faf9',
                  border: '1px solid #e0f2e9',
                  boxShadow: 'none'
                }}
              >
                <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  Personal
                </Typography>
                <Typography level="h4" sx={{ fontWeight: 700, color: '#e91e63' }}>
                  {formatCurrency(costBreakdownData[costBreakdownData.length - 1].personal)}
                </Typography>
                <Typography level="body-xs" sx={{ color: '#e91e63', mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TrendingUpIcon sx={{ fontSize: '1rem' }} /> +3.0%
                </Typography>
              </Card>
              
              <Card
                variant="outlined"
                sx={{ 
                  p: 1.5, 
                  minWidth: 130,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: '#f8faf9',
                  border: '1px solid #e0f2e9',
                  boxShadow: 'none'
                }}
              >
                <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  Material
                </Typography>
                <Typography level="h4" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                  {formatCurrency(costBreakdownData[costBreakdownData.length - 1].material)}
                </Typography>
                <Typography level="body-xs" sx={{ color: '#9c27b0', mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TrendingUpIcon sx={{ fontSize: '1rem' }} /> +2.5%
                </Typography>
              </Card>
              
              <Card
                variant="outlined"
                sx={{ 
                  p: 1.5, 
                  minWidth: 130,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: '#f8faf9',
                  border: '1px solid #e0f2e9',
                  boxShadow: 'none'
                }}
              >
                <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  Tjänster
                </Typography>
                <Typography level="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                  {formatCurrency(costBreakdownData[costBreakdownData.length - 1].tjänster)}
                </Typography>
                <Typography level="body-xs" sx={{ color: '#ff9800', mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TrendingUpIcon sx={{ fontSize: '1rem' }} /> +1.6%
                </Typography>
              </Card>
            </Box>
            
            {/* Kostnadsfördelning diagram */}
            <Box sx={{ flexGrow: 1, minHeight: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={costBreakdownData}
                  margin={{
                    top: 5,
                    right: 20,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#757575' }} 
                    axisLine={{ stroke: '#e0e0e0' }}
                    tickLine={{ stroke: '#e0e0e0' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${value / 1000}k`}
                    tick={{ fill: '#757575' }} 
                    axisLine={{ stroke: '#e0e0e0' }}
                    tickLine={{ stroke: '#e0e0e0' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    formatter={(value) => {
                      return <span style={{ color: '#616161', fontSize: '0.875rem' }}>{value}</span>;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="personal"
                    name="Personal"
                    stroke="#e91e63"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="material"
                    name="Material"
                    stroke="#9c27b0"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tjänster"
                    name="Tjänster"
                    stroke="#ff9800"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </TabPanel>
      </Box>
    </Card>
  );
};

export default ModernRevenueWidget;