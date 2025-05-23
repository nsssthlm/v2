import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const KanbanDisplay = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Kanban-tavla
      </Typography>
      
      <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
        <Typography variant="body1">
          Hantera dina uppgifter visuellt med hjälp av Kanban-tavlan. Dra uppgifter mellan kolumner för att uppdatera deras status.
        </Typography>
      </Paper>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          textAlign: 'center',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <img 
          src="/assets/kanban-board.png" 
          alt="Kanban Board" 
          style={{ 
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
            margin: '0 auto' 
          }} 
        />
      </Paper>
    </Box>
  );
};

export default KanbanDisplay;