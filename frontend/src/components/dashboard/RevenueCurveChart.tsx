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
interface RevenueCurveChartProps {
  title?: string;
}

const RevenueCurveChart: React.FC<RevenueCurveChartProps> = ({ title = 'INTÄKTER' }) => {
  // Enkel implementation utan externa diagram-bibliotek
  // Statisk data baserat på bilden
  const currentWeekTotal = 58254;
  const previousWeekTotal = 69524;
  const todaysEarning = 2562.30;
  
  // Format nummer med tusentalsavgränsare
  const formatNumber = (num: number) => {
    return "$" + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Data för kurvor som kommer visas som SVG
  const dayLabels = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];
  const currentWeekPoints = [9000, 18000, 16000, 27000, 18000, 27000, 24000];
  const previousWeekPoints = [0, 15000, 9000, 22000, 36000, 30000, 28000];

  return (
    <Card variant="outlined" sx={{ 
      height: '100%', 
      bgcolor: 'background.surface',
      boxShadow: 'none',
      borderRadius: 'md',
      border: '1px solid',
      borderColor: 'divider' 
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography level="title-md">{title}</Typography>
        <IconButton size="sm" variant="plain" color="neutral">
          <MoreVertIcon />
        </IconButton>
      </Box>
      
      <Box sx={{ py: 2, px: 3, bgcolor: '#f5f9f7', mt: 2, borderRadius: 'md' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              Aktuell vecka
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
              Föregående vecka
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
      
      <Box sx={{ mt: 3, px: 2 }}>
        <Typography level="title-sm" sx={{ fontWeight: 'bold' }}>
          Dagens intäkt: $2,562.30
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
          Visa rapporter
        </Button>
      </Box>
      
      {/* Manuellt ritat diagram med SVG istället för Recharts */}
      <Box sx={{ width: '100%', height: 220, mt: 1, position: 'relative', p: 2 }}>
        {/* Bakgrund och linjer */}
        <Box sx={{ 
          position: 'absolute', 
          top: 30, 
          left: 30, 
          right: 10,
          bottom: 20,
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          {[0, 1, 2, 3].map((i) => (
            <Box 
              key={i} 
              sx={{ 
                width: '100%', 
                borderTop: i === 0 ? 'none' : '1px dashed #e0e0e0',
                height: i === 0 ? 0 : 1 
              }} 
            />
          ))}
        </Box>
        
        {/* X-axel etiketter */}
        <Box sx={{ 
          position: 'absolute',
          bottom: 0,
          left: 30,
          right: 10,
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          {dayLabels.map((day, i) => (
            <Typography 
              key={i} 
              level="body-xs" 
              sx={{ 
                color: 'text.tertiary', 
                width: '14%', 
                textAlign: 'center' 
              }}
            >
              {day}
            </Typography>
          ))}
        </Box>
        
        {/* Y-axel etiketter */}
        <Box sx={{ 
          position: 'absolute',
          top: 20,
          left: 0,
          bottom: 20,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>36k</Typography>
          <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>27k</Typography>
          <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>18k</Typography>
          <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>9k</Typography>
          <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>0</Typography>
        </Box>
        
        {/* Linjen för aktuell vecka */}
        <svg 
          style={{ 
            position: 'absolute', 
            top: 30, 
            left: 30, 
            right: 10, 
            bottom: 20, 
            width: 'calc(100% - 40px)', 
            height: 'calc(100% - 50px)'
          }}
        >
          <polyline
            points="0,165 43,80 86,90 129,30 172,80 215,30 258,40"
            style={{
              fill: 'none',
              stroke: '#8884d8',
              strokeWidth: 2
            }}
          />
          {currentWeekPoints.map((point, i) => {
            const x = i * 43;
            const y = 165 - (point / 36000 * 165);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="#8884d8"
              />
            );
          })}
        </svg>
        
        {/* Linjen för föregående vecka */}
        <svg 
          style={{ 
            position: 'absolute', 
            top: 30, 
            left: 30, 
            right: 10, 
            bottom: 20, 
            width: 'calc(100% - 40px)', 
            height: 'calc(100% - 50px)'
          }}
        >
          <polyline
            points="0,165 43,100 86,140 129,60 172,10 215,20 258,25"
            style={{
              fill: 'none',
              stroke: '#00D397',
              strokeWidth: 2
            }}
          />
          {previousWeekPoints.map((point, i) => {
            const x = i * 43;
            const y = 165 - (point / 36000 * 165);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="#00D397"
              />
            );
          })}
        </svg>
      </Box>
    </Card>
  );
};

export default RevenueCurveChart;