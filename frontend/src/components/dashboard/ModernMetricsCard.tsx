import React from 'react';
import { Box, Card, Typography } from '@mui/joy';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShowChartIcon from '@mui/icons-material/ShowChart';

interface ModernMetricsCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive?: boolean;
    text: string;
  };
  icon?: 'people' | 'orders' | 'revenue' | 'growth' | React.ReactNode;
}

const ModernMetricsCard: React.FC<ModernMetricsCardProps> = ({ 
  title, 
  value, 
  trend, 
  icon
}) => {
  const getIcon = () => {
    if (typeof icon === 'string') {
      switch (icon) {
        case 'people':
          return <PeopleIcon />;
        case 'orders':
          return <BusinessCenterIcon />;
        case 'revenue':
          return <AttachMoneyIcon />;
        case 'growth':
          return <ShowChartIcon />;
        default:
          return null;
      }
    }
    return icon;
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend.isPositive) {
      return <TrendingUpIcon sx={{ fontSize: '0.875rem' }} />;
    } else {
      return <TrendingDownIcon sx={{ fontSize: '0.875rem' }} />;
    }
  };

  return (
    <Card
      sx={{
        p: 2,
        height: '100%',
        bgcolor: '#ffffff',
        boxShadow: 'sm',
        border: '1px solid #e0e0e0',
        borderRadius: 'md',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: 'md',
          transform: 'translateY(-2px)',
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography level="title-sm" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </Typography>
        
        {icon && (
          <Box
            sx={{
              bgcolor: '#e8f5e9',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#007934',
            }}
          >
            {getIcon()}
          </Box>
        )}
      </Box>
      
      <Typography level="h2" sx={{ mb: 1, fontWeight: 'bold', color: '#007934' }}>
        {value}
      </Typography>
      
      {trend && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: trend.isPositive ? '#007934' : '#f44336',
              mr: 0.5,
              fontWeight: 'bold',
            }}
          >
            {getTrendIcon()}
            <Typography level="body-sm" sx={{ fontWeight: 'bold' }}>
              {trend.value}%
            </Typography>
          </Box>
          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
            {trend.text}
          </Typography>
        </Box>
      )}
    </Card>
  );
};

export default ModernMetricsCard;