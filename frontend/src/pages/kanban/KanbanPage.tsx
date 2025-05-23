import { Box, Container, Typography, Paper } from "@mui/material";
import { useState, useEffect } from "react";

const KanbanPage = () => {
  const [loading, setLoading] = useState(true);

  // Simulera laddningstid
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
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

      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '500px',
          bgcolor: '#f9f9f9',
          borderRadius: 2
        }}>
          <Typography>Laddar Kanban-tavla...</Typography>
        </Box>
      ) : (
        <Box sx={{ 
          width: '100%', 
          display: 'flex',
          justifyContent: 'center',
          overflow: 'hidden',
          borderRadius: 2,
          boxShadow: 3
        }}>
          <img 
            src="/assets/kanban-board.png" 
            alt="Kanban Board" 
            style={{ 
              width: '100%', 
              height: 'auto', 
              maxWidth: '1200px'
            }} 
          />
        </Box>
      )}
    </Container>
  );
};

export default KanbanPage;