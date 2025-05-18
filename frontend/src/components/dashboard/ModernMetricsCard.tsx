import React from 'react';
import { Box, Typography, Card } from '@mui/joy';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface ModernMetricsCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive?: boolean;
    text: string;
  };
  icon?: 'people' | 'orders' | 'revenue' | 'growth';
}

const ModernMetricsCard: React.FC<ModernMetricsCardProps> = ({
  title,
  value,
  trend,
  icon = 'people',
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'people':
        return <PeopleAltOutlinedIcon sx={{ fontSize: '1.8rem', color: '#007934' }} />;
      case 'orders':
        return <AssignmentOutlinedIcon sx={{ fontSize: '1.8rem', color: '#007934' }} />;
      case 'revenue':
        return <AccountBalanceWalletOutlinedIcon sx={{ fontSize: '1.8rem', color: '#007934' }} />;
      case 'growth':
        return <TrendingUpIcon sx={{ fontSize: '1.8rem', color: '#007934' }} />;
      default:
        return <PeopleAltOutlinedIcon sx={{ fontSize: '1.8rem', color: '#007934' }} />;
    }
  };

  return (
    <Card 
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        overflow: 'hidden',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0, 121, 52, 0.08)',
          border: '1px solid rgba(0, 121, 52, 0.12)'
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(to right, #4caf50, #81c784)',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
        },
        background: 'linear-gradient(135deg, #ffffff 0%, #f8faf9 100%)',
      }}
    >
      <Box 
        sx={{ 
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 1.5
          }}
        >
          <Typography 
            level="title-sm"
            sx={{ 
              color: 'text.secondary',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.75rem'
            }}
          >
            {title}
          </Typography>
          
          <Box 
            sx={{ 
              bgcolor: '#e8f5e9', 
              borderRadius: '50%', 
              width: 40, 
              height: 40, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 121, 52, 0.08)'
            }}
          >
            {getIcon()}
          </Box>
        </Box>
        
        <Typography 
          level="h2"
          sx={{ 
            fontWeight: 700,
            fontSize: { xs: '1.5rem', md: '1.75rem' },
            letterSpacing: '-0.02em',
            mb: 1,
            mt: 1.5
          }}
        >
          {value}
        </Typography>
        
        {trend && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mt: 'auto'
            }}
          >
            {trend.isPositive !== false ? (
              <>
                <TrendingUpIcon 
                  sx={{ 
                    color: '#007934', 
                    fontSize: '1.25rem',
                    filter: 'drop-shadow(0 2px 3px rgba(0,121,52,0.2))'
                  }} 
                />
                <Typography 
                  level="body-sm"
                  sx={{ 
                    color: '#007934', 
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}
                >
                  {trend.value}%
                </Typography>
              </>
            ) : (
              <>
                <TrendingDownIcon 
                  sx={{ 
                    color: '#d32f2f', 
                    fontSize: '1.25rem',
                    filter: 'drop-shadow(0 2px 3px rgba(211,47,47,0.2))'
                  }} 
                />
                <Typography 
                  level="body-sm"
                  sx={{ 
                    color: '#d32f2f', 
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}
                >
                  {trend.value}%
                </Typography>
              </>
            )}
            <Typography 
              level="body-sm"
              sx={{ 
                color: 'text.secondary', 
                ml: 0.5,
                fontSize: '0.75rem',
                fontWeight: 400
              }}
            >
              {trend.text}
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default ModernMetricsCard;