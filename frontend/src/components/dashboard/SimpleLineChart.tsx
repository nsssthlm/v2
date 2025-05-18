import React from 'react';
import { Card, Box, Typography, Divider } from '@mui/joy';

interface SimpleLineChartProps {
  title: string;
}

const SimpleLineChart: React.FC<SimpleLineChartProps> = ({ title }) => {
  return (
    <Card variant="outlined" sx={{ 
      height: '100%', 
      bgcolor: 'background.surface',
      boxShadow: 'none',
      borderRadius: 'lg',
      border: '1px solid',
      borderColor: 'divider' 
    }}>
      <Typography level="title-md" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Divider />
      
      <Box sx={{ p: 2, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              Aktuell vecka
            </Typography>
            <Typography level="h3" sx={{ color: '#007934', fontWeight: 'bold' }}>
              58 254 kr
            </Typography>
          </Box>
          
          <Box>
            <Typography level="body-sm" sx={{ color: 'text.secondary', textAlign: 'right' }}>
              Föregående vecka
            </Typography>
            <Typography level="h3" sx={{ color: '#007934', fontWeight: 'bold' }}>
              69 524 kr
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ bgcolor: '#f9f9f9', p: 2, borderRadius: 'md' }}>
          <Typography level="body-sm" sx={{ mb: 1, fontWeight: 'bold' }}>
            Dagens intäkter: 2 562,30 kr
          </Typography>
          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
            Sammanfattning av intäkter från projekt och timdebitering.
            Diagrammet visar jämförelse mellan denna vecka och föregående.
          </Typography>
        </Box>
        
        {/* Placeholder för diagram */}
        <Box 
          sx={{ 
            height: '200px', 
            bgcolor: '#e0f2e9', 
            mt: 2,
            borderRadius: 'md',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Vågformer för att simulera linjer */}
          <Box sx={{ 
            position: 'absolute',
            width: '100%',
            height: '100px',
            bottom: '30px',
            background: 'linear-gradient(90deg, #007934 0%, #007934 100%)',
            opacity: 0.2,
            borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
          }} />
          
          <Box sx={{ 
            position: 'absolute',
            width: '100%',
            height: '80px',
            bottom: '40px',
            background: 'linear-gradient(90deg, #00a86b 0%, #00a86b 100%)',
            opacity: 0.3,
            borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
            transform: 'scaleX(1.1)'
          }} />
          
          <Typography level="body-md" sx={{ color: '#007934', fontWeight: 'bold', zIndex: 1 }}>
            Intäktsdiagram
          </Typography>
        </Box>
        
        {/* Dagar i veckan */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mt: 1,
          px: 1
        }}>
          {['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'].map(day => (
            <Typography key={day} level="body-xs" sx={{ color: 'text.secondary' }}>
              {day}
            </Typography>
          ))}
        </Box>
      </Box>
    </Card>
  );
};

export default SimpleLineChart;