import { Box, Container, Typography, Paper } from "@mui/material";
import { useState, useEffect } from "react";

const KanbanPage = () => {
  const [loading, setLoading] = useState(true);

  // Simulera laddningstid
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Container maxWidth={false} sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Kanban-tavla
      </Typography>
      
      <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
        <Typography variant="body1">
          Hantera dina uppgifter visuellt med hjälp av Kanban-tavlan. Dra uppgifter mellan kolumner för att uppdatera deras status.
        </Typography>
      </Paper>

      <Box 
        component="img" 
        src="/assets/kanban-board.png"
        alt="Kanban Board"
        sx={{
          width: '100%',
          maxWidth: '1200px',
          height: 'auto',
          display: 'block',
          margin: '0 auto',
          borderRadius: 2,
          boxShadow: 3
        }}
      />
    </Container>
  );
};

export default KanbanPage;