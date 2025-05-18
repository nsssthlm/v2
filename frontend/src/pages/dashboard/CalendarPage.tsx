import React from 'react';
import { Box, Typography, Card, Container } from '@mui/joy';
import CalendarWidget from '../../components/dashboard/CalendarWidget';
import { markedDates } from '../../components/dashboard/CalendarData';

const CalendarPage: React.FC = () => {
  // Funktion för att hantera klick på datum
  const handleDateClick = (date: Date) => {
    console.log('Datum valt:', date.toLocaleDateString('sv-SE'));
    // Här kan vi lägga till mer funktionalitet i framtiden
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      <Typography level="h2" sx={{ mb: 3, fontWeight: 600, color: '#2e7d32' }}>
        Projektkalender
      </Typography>
      
      <Card
        sx={{
          height: 'calc(100vh - 200px)',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 121, 52, 0.1)',
          overflow: 'hidden',
          p: 2
        }}
      >
        <Box sx={{ height: '100%', width: '100%' }}>
          <CalendarWidget
            title="Projektkalender"
            height="100%"
            onDateClick={handleDateClick}
            markedDates={markedDates}
          />
        </Box>
      </Card>
    </Container>
  );
};

export default CalendarPage;