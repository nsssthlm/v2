import React, { useState } from "react";
import { Typography, Box, Button, CircularProgress, Sheet } from "@mui/joy";
import { useProject } from "../../contexts/ProjectContext";
import { Header } from "../../components/layout/Header";
import { KanbanBoard } from "./KanbanBoard";

export default function KanbanPage() {
  const { currentProject } = useProject();
  const [loading, setLoading] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header title="Kanban" />
      
      <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3
          }}
        >
          <Typography level="h2">Kanban Board</Typography>
          <Box>
            {currentProject && (
              <Typography level="body-sm">
                Projekt: <strong>{currentProject.name}</strong>
              </Typography>
            )}
          </Box>
        </Box>

        {!currentProject ? (
          <Sheet 
            variant="outlined" 
            sx={{ 
              p: 4, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '300px'
            }}
          >
            <Typography level="h4" sx={{ mb: 2 }}>
              Inget projekt valt
            </Typography>
            <Typography sx={{ mb: 2, textAlign: 'center', maxWidth: '500px' }}>
              Välj ett projekt i projektväljaren för att se dess Kanban-tavla
            </Typography>
          </Sheet>
        ) : loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <KanbanBoard projectId={parseInt(currentProject.id)} />
        )}
      </Box>
    </Box>
  );
}