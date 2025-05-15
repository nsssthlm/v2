import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Sheet, 
  Grid, 
  Card, 
  CardContent, 
  IconButton,
  Button,
  Chip,
  Divider
} from '@mui/joy';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { sv } from 'date-fns/locale';

interface Event {
  id: number;
  title: string;
  date: Date;
  type: 'meeting' | 'deadline' | 'reminder';
  project?: string;
}

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Sample events
  const [events] = useState<Event[]>([
    {
      id: 1,
      title: 'Projektmöte: Office Building A',
      date: addDays(new Date(), 2),
      type: 'meeting',
      project: 'Office Building A'
    },
    {
      id: 2,
      title: 'Deadline: Inlämning av ritningar',
      date: addDays(new Date(), 5),
      type: 'deadline',
      project: 'Hospital Renovation C'
    },
    {
      id: 3,
      title: 'Påminnelse: Beställ material',
      date: addDays(new Date(), -2),
      type: 'reminder',
      project: 'Residential Complex B'
    },
    {
      id: 4,
      title: 'Teammöte: Planering',
      date: addDays(new Date(), 3),
      type: 'meeting',
      project: 'Residential Complex B'
    }
  ]);

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const renderHeader = () => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <IconButton onClick={prevMonth} variant="plain">
          <ChevronLeftIcon />
        </IconButton>
        <Typography level="h3">
          {format(currentDate, 'MMMM yyyy', { locale: sv })}
        </Typography>
        <IconButton onClick={nextMonth} variant="plain">
          <ChevronRightIcon />
        </IconButton>
      </Box>
    );
  };

  const renderDays = () => {
    const days = [];
    const weekStartDate = startOfWeek(currentDate, { weekStartsOn: 1 });

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStartDate, i);
      days.push(
        <Box key={i} sx={{ flex: '1 0 14.28%', textAlign: 'center', fontWeight: 'bold' }}>
          {format(day, 'EEEE', { locale: sv })}
        </Box>
      );
    }

    return <Box sx={{ display: 'flex', mb: 1 }}>{days}</Box>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const eventsOnThisDay = events.filter(event => isSameDay(event.date, cloneDay));

        days.push(
          <Box
            key={format(day, 'T')}
            sx={{
              height: 120,
              flex: '0 0 14.28%',
              padding: 0.5,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: !isSameMonth(day, monthStart) 
                ? 'background.level1' 
                : isSameDay(day, new Date()) 
                  ? 'primary.softBg' 
                  : 'background.surface',
            }}
          >
            <Typography
              level="body-xs"
              sx={{
                textAlign: 'right',
                mb: 1,
                color: !isSameMonth(day, monthStart) ? 'text.tertiary' : 'text.primary'
              }}
            >
              {format(day, 'd')}
            </Typography>
            
            <Box sx={{ overflow: 'auto', maxHeight: 80 }}>
              {eventsOnThisDay.map(event => (
                <Chip
                  key={event.id}
                  size="sm"
                  variant="soft"
                  color={
                    event.type === 'meeting' 
                      ? 'primary' 
                      : event.type === 'deadline' 
                        ? 'danger' 
                        : 'warning'
                  }
                  sx={{ 
                    mb: 0.5, 
                    maxWidth: '100%',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    cursor: 'pointer'
                  }}
                >
                  {event.title}
                </Chip>
              ))}
            </Box>
          </Box>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <Box key={day.toString()} sx={{ display: 'flex', flex: 1 }}>
          {days}
        </Box>
      );
      days = [];
    }

    return <Box>{rows}</Box>;
  };

  const upcomingEvents = events
    .filter(event => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  return (
    <Grid container spacing={2}>
      <Grid xs={12} md={9}>
        <Box sx={{ p: 1 }}>
          <Typography level="h1" sx={{ mb: 2 }}>Kalender</Typography>
          <Card variant="outlined">
            <CardContent>
              {renderHeader()}
              {renderDays()}
              {renderCells()}
            </CardContent>
          </Card>
        </Box>
      </Grid>
      
      <Grid xs={12} md={3}>
        <Box sx={{ p: 1, mt: { xs: 0, md: 9.5 } }}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <EventIcon />
                <Typography level="title-lg">Kommande händelser</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => (
                  <Box key={event.id} sx={{ mb: 2 }}>
                    <Typography level="title-sm">{event.title}</Typography>
                    <Typography level="body-sm">
                      {format(event.date, 'EEEE d MMMM', { locale: sv })}
                    </Typography>
                    {event.project && (
                      <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                        Projekt: {event.project}
                      </Typography>
                    )}
                    <Divider sx={{ my: 1 }} />
                  </Box>
                ))
              ) : (
                <Typography level="body-sm">Inga kommande händelser</Typography>
              )}

              <Button 
                variant="outlined" 
                size="sm" 
                sx={{ mt: 1 }}
                fullWidth
              >
                Skapa ny händelse
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Calendar;