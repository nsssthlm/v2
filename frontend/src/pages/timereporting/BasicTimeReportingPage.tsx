import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Card,
  Button,
  Grid,
  Stack,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Option
} from '@mui/joy';

const BasicTimeReportingPage = () => {
  const [hours, setHours] = useState('');
  const [activity, setActivity] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  
  // Simulera inlämning av tidsrapport
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Tidsrapport inlämnad:', { hours, activity, date, description });
    
    // Rensa formuläret
    setHours('');
    setActivity('');
    setDescription('');
    
    // Visa bekräftelse till användaren
    alert('Tidsrapport sparad!');
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography level="h1" component="h1" sx={{ mb: 4 }}>
        Tidsrapportering
      </Typography>
      
      <Grid container spacing={3}>
        <Grid xs={12} md={6}>
          <Card variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Typography level="h3" sx={{ mb: 3 }}>
              Registrera tid
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <FormControl required>
                  <FormLabel>Datum</FormLabel>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </FormControl>
                
                <FormControl required>
                  <FormLabel>Antal timmar</FormLabel>
                  <Input
                    type="number"
                    value={hours}
                    slotProps={{ input: { min: "0", max: "24", step: "0.5" } }}
                    onChange={(e) => setHours(e.target.value)}
                  />
                </FormControl>
                
                <FormControl required>
                  <FormLabel>Aktivitet</FormLabel>
                  <Select 
                    placeholder="Välj aktivitet" 
                    value={activity}
                    onChange={(_, newValue) => setActivity(newValue as string)}
                  >
                    <Option value="development">Utveckling</Option>
                    <Option value="meeting">Möte</Option>
                    <Option value="planning">Planering</Option>
                    <Option value="documentation">Dokumentation</Option>
                    <Option value="other">Övrigt</Option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Beskrivning</FormLabel>
                  <Textarea
                    minRows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Beskriv vad du har arbetat med"
                  />
                </FormControl>
                
                <Box sx={{ mt: 2 }}>
                  <Button type="submit" size="lg">
                    Spara tidsrapport
                  </Button>
                </Box>
              </Stack>
            </form>
          </Card>
        </Grid>
        
        <Grid xs={12} md={6}>
          <Card variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Typography level="h3" sx={{ mb: 3 }}>
              Senaste rapporteringarna
            </Typography>
            
            <Stack spacing={2} divider={<Divider />}>
              <Box>
                <Typography level="title-md">
                  Utveckling - 8 timmar
                </Typography>
                <Typography level="body-sm">
                  2025-05-19
                </Typography>
                <Typography level="body-sm" sx={{ mt: 1 }}>
                  Implementerat ny funktionalitet för tidsrapportering. Arbetat med React komponenter och API-integration.
                </Typography>
              </Box>
              
              <Box>
                <Typography level="title-md">
                  Möte - 2 timmar
                </Typography>
                <Typography level="body-sm">
                  2025-05-18
                </Typography>
                <Typography level="body-sm" sx={{ mt: 1 }}>
                  Projektmöte med teamet för att diskutera framsteg och planera kommande sprint.
                </Typography>
              </Box>
              
              <Box>
                <Typography level="title-md">
                  Dokumentation - 4 timmar
                </Typography>
                <Typography level="body-sm">
                  2025-05-17
                </Typography>
                <Typography level="body-sm" sx={{ mt: 1 }}>
                  Uppdaterat teknisk dokumentation för API:er och skrivit användarguide.
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BasicTimeReportingPage;