import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, IconButton, Button } from '@mui/joy';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';

interface CalendarWidgetProps {
  title?: string;
  height?: number | string;
  onDateClick?: (date: Date) => void;
  markedDates?: Date[];
}

// Hjälpfunktioner för datumhantering
const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay() || 7; // 0 (söndag) blir 7 för att få måndag som första dag
};

const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  title = 'Kalender',
  height = 'auto',
  onDateClick,
  markedDates = []
}) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Antal dagar i nuvarande månad
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  
  // Första veckodagen i månaden (0-6, där 0 är söndag)
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  
  // Antal dagar från föregående månad som visas i kalendern
  const daysFromPrevMonth = firstDayOfMonth - 1;
  
  // Dagar i föregående månad
  const prevMonthDays = getDaysInMonth(
    currentMonth === 0 ? currentYear - 1 : currentYear,
    currentMonth === 0 ? 11 : currentMonth - 1
  );
  
  // Dagar från föregående månad att visa
  const prevMonthDaysToShow = Array.from(
    { length: daysFromPrevMonth }, 
    (_, i) => prevMonthDays - daysFromPrevMonth + i + 1
  );
  
  // Dagar i nuvarande månad
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Beräkna hur många dagar som behövs från nästa månad för att fylla ut sista raden
  const totalDisplayedDays = daysFromPrevMonth + daysInMonth;
  const nextMonthDaysToShow = Array.from(
    { length: 42 - totalDisplayedDays }, 
    (_, i) => i + 1
  );
  
  // Veckodagsnamn
  const weekdayNames = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];
  
  // Månadsnamn
  const monthNames = [
    'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
    'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
  ];
  
  // Gå till föregående månad
  const goToPrevMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 0) {
        setCurrentYear(prevYear => prevYear - 1);
        return 11;
      }
      return prev - 1;
    });
  };
  
  // Gå till nästa månad
  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 11) {
        setCurrentYear(prevYear => prevYear + 1);
        return 0;
      }
      return prev + 1;
    });
  };
  
  // Hantera klick på datum
  const handleDateClick = (day: number, isCurrentMonth: boolean = true) => {
    let date;
    
    if (isCurrentMonth) {
      date = new Date(currentYear, currentMonth, day);
    } else if (day > 15) {
      // Föregående månad
      date = new Date(
        currentMonth === 0 ? currentYear - 1 : currentYear,
        currentMonth === 0 ? 11 : currentMonth - 1,
        day
      );
    } else {
      // Nästa månad
      date = new Date(
        currentMonth === 11 ? currentYear + 1 : currentYear,
        currentMonth === 11 ? 0 : currentMonth + 1,
        day
      );
    }
    
    setSelectedDate(date);
    if (onDateClick) {
      onDateClick(date);
    }
  };
  
  // Kontrollera om ett datum är markerat
  const isDateMarked = (day: number, isCurrentMonth: boolean = true): boolean => {
    let date;
    
    if (isCurrentMonth) {
      date = new Date(currentYear, currentMonth, day);
    } else if (day > 15) {
      // Föregående månad
      date = new Date(
        currentMonth === 0 ? currentYear - 1 : currentYear,
        currentMonth === 0 ? 11 : currentMonth - 1,
        day
      );
    } else {
      // Nästa månad
      date = new Date(
        currentMonth === 11 ? currentYear + 1 : currentYear,
        currentMonth === 11 ? 0 : currentMonth + 1,
        day
      );
    }
    
    return markedDates.some(markedDate => 
      markedDate.getDate() === date.getDate() &&
      markedDate.getMonth() === date.getMonth() &&
      markedDate.getFullYear() === date.getFullYear()
    );
  };
  
  // Kontrollera om ett datum är idag
  const isToday = (day: number): boolean => {
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };
  
  // Kontrollera om ett datum är valt
  const isSelected = (day: number, isCurrentMonth: boolean = true): boolean => {
    if (!selectedDate) return false;
    
    if (isCurrentMonth) {
      return (
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentMonth &&
        selectedDate.getFullYear() === currentYear
      );
    }
    
    if (day > 15) {
      // Föregående månad
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      return (
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === prevMonth &&
        selectedDate.getFullYear() === prevMonthYear
      );
    } else {
      // Nästa månad
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      
      return (
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === nextMonth &&
        selectedDate.getFullYear() === nextMonthYear
      );
    }
  };
  
  // Gå till dagens datum
  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(today);
  };
  
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
      
      <Box 
        sx={{ 
          flexGrow: 1,
          p: 2,
          minHeight: height !== 'auto' ? height : undefined,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Kalender header med navigeringsknappar */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2 
        }}>
          <IconButton
            onClick={goToPrevMonth}
            variant="soft"
            color="neutral"
            size="sm"
            sx={{ 
              borderRadius: '50%', 
              color: 'text.secondary',
              '&:hover': { bgcolor: '#e8f5e9' }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography 
              level="title-lg" 
              sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                mr: 1
              }}
            >
              {monthNames[currentMonth]} {currentYear}
            </Typography>
            
            <Button
              variant="outlined"
              color="neutral"
              size="sm"
              startDecorator={<TodayIcon />}
              onClick={goToToday}
              sx={{ 
                ml: 1, 
                borderRadius: '8px', 
                fontSize: '0.75rem',
                height: '28px',
                py: 0,
                px: 1,
                bgcolor: '#e8f5e9',
                color: '#007934',
                borderColor: 'transparent',
                '&:hover': {
                  bgcolor: '#d7eeda',
                  borderColor: '#007934'
                }
              }}
            >
              Idag
            </Button>
          </Box>
          
          <IconButton
            onClick={goToNextMonth}
            variant="soft"
            color="neutral"
            size="sm"
            sx={{ 
              borderRadius: '50%', 
              color: 'text.secondary',
              '&:hover': { bgcolor: '#e8f5e9' }
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
        
        {/* Veckodagar */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0.5,
          mb: 1
        }}>
          {weekdayNames.map((day, index) => (
            <Box 
              key={index} 
              sx={{ 
                textAlign: 'center',
                p: 1,
                fontWeight: 600,
                color: index >= 5 ? '#d32f2f' : 'text.primary', // Röd text för helger
                fontSize: '0.75rem'
              }}
            >
              {day}
            </Box>
          ))}
        </Box>
        
        {/* Kalenderdagar */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0.5,
          flexGrow: 1
        }}>
          {/* Föregående månads dagar */}
          {prevMonthDaysToShow.map((day) => (
            <Box 
              key={`prev-${day}`}
              onClick={() => handleDateClick(day, false)}
              sx={{ 
                textAlign: 'center',
                p: 1,
                borderRadius: '8px',
                color: 'text.tertiary',
                bgcolor: isSelected(day, false) ? '#e8f5e9' : 'transparent',
                cursor: 'pointer',
                position: 'relative',
                fontSize: '0.875rem',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: '#f5f5f5'
                }
              }}
            >
              {day}
              {isDateMarked(day, false) && (
                <Box sx={{ 
                  position: 'absolute',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  bgcolor: '#007934',
                  bottom: '4px',
                  left: '50%',
                  transform: 'translateX(-50%)'
                }} />
              )}
            </Box>
          ))}
          
          {/* Nuvarande månads dagar */}
          {currentMonthDays.map((day) => (
            <Box 
              key={`current-${day}`}
              onClick={() => handleDateClick(day)}
              sx={{ 
                textAlign: 'center',
                p: 1,
                borderRadius: '8px',
                color: isToday(day) ? '#fff' : 'text.primary',
                fontWeight: isToday(day) || isSelected(day) ? 600 : 400,
                bgcolor: isToday(day) 
                  ? '#007934' 
                  : isSelected(day) 
                    ? '#e8f5e9' 
                    : 'transparent',
                cursor: 'pointer',
                position: 'relative',
                fontSize: '0.875rem',
                transition: 'all 0.2s ease-in-out',
                boxShadow: isToday(day) ? '0 2px 6px rgba(0, 121, 52, 0.2)' : 'none',
                '&:hover': {
                  bgcolor: isToday(day) ? '#006228' : '#f5f5f5',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {day}
              {isDateMarked(day) && !isToday(day) && (
                <Box sx={{ 
                  position: 'absolute',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  bgcolor: isSelected(day) ? '#007934' : '#007934',
                  bottom: '4px',
                  left: '50%',
                  transform: 'translateX(-50%)'
                }} />
              )}
            </Box>
          ))}
          
          {/* Nästa månads dagar */}
          {nextMonthDaysToShow.map((day) => (
            <Box 
              key={`next-${day}`}
              onClick={() => handleDateClick(day, false)}
              sx={{ 
                textAlign: 'center',
                p: 1,
                borderRadius: '8px',
                color: 'text.tertiary',
                bgcolor: isSelected(day, false) ? '#e8f5e9' : 'transparent',
                cursor: 'pointer',
                position: 'relative',
                fontSize: '0.875rem',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: '#f5f5f5'
                }
              }}
            >
              {day}
              {isDateMarked(day, false) && (
                <Box sx={{ 
                  position: 'absolute',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  bgcolor: '#007934',
                  bottom: '4px',
                  left: '50%',
                  transform: 'translateX(-50%)'
                }} />
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Card>
  );
};

export default CalendarWidget;