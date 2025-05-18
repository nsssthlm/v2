import { Box, Card, Typography } from '@mui/joy';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import PeopleIcon from '@mui/icons-material/People';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';

interface ProjectMetricsCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive?: boolean;
    text: string;
  };
  icon?: 'people' | 'orders' | 'revenue' | 'growth' | React.ReactNode;
  color?: string;
}

export const ProjectMetricsCard = ({ 
  title, 
  value, 
  trend, 
  icon,
  color = '#60cd18' // Default till vår gröna färg
}: ProjectMetricsCardProps) => {
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
          return <TrendingUpOutlinedIcon />;
        default:
          return null;
      }
    }
    return icon;
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend.isPositive) {
      return <TrendingUpIcon sx={{ color: '#60cd18', fontSize: '1rem' }} />;
    } else if (trend.isPositive === false) {
      return <TrendingDownIcon sx={{ color: '#f44336', fontSize: '1rem' }} />;
    } else {
      return <ArrowRightAltIcon sx={{ color: '#757575', fontSize: '1rem' }} />;
    }
  };

  return (
    <Card variant="plain" sx={{ 
      p: 2, 
      height: '100%', 
      bgcolor: 'background.surface', 
      boxShadow: 'none',
      borderRadius: 'lg',
      border: '1px solid',
      borderColor: 'divider'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Typography level="title-sm" color="neutral" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </Typography>
        {icon && (
          <Box sx={{ 
            bgcolor: `${color}20`, // Transparent bakgrund av huvudfärgen
            borderRadius: '50%', 
            width: 32, 
            height: 32, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: color
          }}>
            {getIcon()}
          </Box>
        )}
      </Box>
      
      <Typography 
        level="h2" 
        sx={{ 
          my: 1, 
          fontWeight: 'bold',
          color: '#60cd18',
          fontSize: '1.8rem'
        }}
      >
        {value}
      </Typography>
      
      {trend && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {getTrendIcon()}
          <Typography 
            level="body-sm" 
            sx={{ 
              color: trend.isPositive ? '#60cd18' : 
                    trend.isPositive === false ? '#f44336' : 
                    'text.secondary',
              fontWeight: 'bold'
            }}
          >
            {trend.value}%
          </Typography>
          <Typography level="body-sm" sx={{ color: 'text.secondary', ml: 0.5 }}>
            {trend.text}
          </Typography>
        </Box>
      )}
    </Card>
  );
};

export default ProjectMetricsCard;