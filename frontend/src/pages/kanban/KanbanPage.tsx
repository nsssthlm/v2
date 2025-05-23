import React, { useState } from "react";
import { Typography, Box, Card, Sheet, Stack, Button, Divider } from "@mui/joy";
import { useProject } from "../../contexts/ProjectContext";

// Enkel Kanban-vy utan DnD-funktionalitet (den mer avancerade kommer senare)
export default function KanbanPage() {
  const { currentProject } = useProject();

  // Statiska uppgifter för demo
  const columns = [
    {
      id: 'todo',
      title: 'Att göra',
      color: '#FFEFD5', // Ljus persika
      tasks: [
        { id: 1, title: 'Planera möte', description: 'Boka mötesrum och skicka inbjudningar' },
        { id: 2, title: 'Uppdatera dokumentation', description: 'Lägg till nya krav i dokumentationen' }
      ]
    },
    {
      id: 'in_progress',
      title: 'Pågående',
      color: '#E0F7FA', // Ljusblå
      tasks: [
        { id: 3, title: 'Kanban-funktion', description: 'Implementera Kanban-vy i systemet' },
        { id: 4, title: 'Prototyp för dashboard', description: 'Skapa mockups för nya dashboard' }
      ]
    },
    {
      id: 'done',
      title: 'Klart',
      color: '#E8F5E9', // Ljusgrön
      tasks: [
        { id: 5, title: 'Projektplanering', description: 'Skapa initial projektplan' },
        { id: 6, title: 'Kravspecifikation', description: 'Definiera kravspecifikation för v1.0' }
      ]
    }
  ];

  return (
    <Box sx={{ p: 3, height: '100vh', overflow: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography level="h2" sx={{ mb: 1 }}>Kanban Board</Typography>
        
        {currentProject && (
          <Typography level="body-md">
            Projekt: <strong>{currentProject.name}</strong>
          </Typography>
        )}
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
      ) : (
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 3
          }}
        >
          {columns.map(column => (
            <Card key={column.id} variant="outlined" sx={{ 
              backgroundColor: column.color,
              height: 'fit-content'
            }}>
              <Typography level="title-lg" sx={{ mb: 1, p: 1 }}>
                {column.title} ({column.tasks.length})
              </Typography>
              <Divider />
              <Stack spacing={2} sx={{ p: 1, mt: 1 }}>
                {column.tasks.map(task => (
                  <Card key={task.id} variant="soft" sx={{ mb: 1 }}>
                    <Typography level="title-sm">{task.title}</Typography>
                    <Typography level="body-sm">{task.description}</Typography>
                  </Card>
                ))}
                <Button 
                  variant="soft" 
                  size="sm" 
                  sx={{ alignSelf: 'flex-start' }}
                >
                  + Lägg till uppgift
                </Button>
              </Stack>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}