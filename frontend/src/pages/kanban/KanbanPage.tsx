import React, { useState } from 'react';
import { Box, Typography, Container, Paper, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import MainLayout from '../../components/layout/MainLayout';

const KanbanPage: React.FC = () => {
  const [showImage, setShowImage] = useState(true);
  
  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Kanban-tavla
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => setShowImage(!showImage)}
          >
            {showImage ? 'Visa interaktiv vy' : 'Visa exempel'}
          </Button>
        </Box>
        
        <Paper sx={{ p: 2, width: '100%', minHeight: '80vh', overflowX: 'auto' }}>
          {showImage ? (
            // Visa exempelbilden
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
              <img 
                src="/images/kanban-example.png" 
                alt="Kanban exempel" 
                style={{ maxWidth: '100%', maxHeight: '75vh' }} 
              />
            </Box>
          ) : (
            // Här kommer den interaktiva Kanban-implementationen
            <Box sx={{ display: 'flex', justifyContent: 'space-between', height: '75vh', gap: 2 }}>
              {['Backlog', 'Att göra', 'Pågående', 'Testning', 'Klart'].map((column, index) => (
                <Paper 
                  key={index} 
                  sx={{ 
                    flex: 1, 
                    p: 2, 
                    bgcolor: index === 0 ? '#f0f0f0' : 
                            index === 1 ? '#fff8dc' : 
                            index === 2 ? '#e0f2ff' : 
                            index === 3 ? '#f2e6ff' : '#e0f7e0',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2, 
                      pb: 1, 
                      borderBottom: '1px solid rgba(0,0,0,0.1)',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    {column}
                    <span>{index === 0 || index === 4 ? '3' : '1'}</span>
                  </Typography>

                  <Box sx={{ flex: 1, overflow: 'auto' }}>
                    {/* Placeholder för uppgifter */}
                    {[1, 2, 3].filter(i => 
                      (index === 0 && i <= 3) || 
                      (index === 1 && i === 1) || 
                      (index === 2 && i === 1) || 
                      (index === 3 && i === 1) || 
                      (index === 4 && i <= 3)
                    ).map(item => (
                      <Paper 
                        key={item} 
                        sx={{ 
                          p: 2, 
                          mb: 2, 
                          bgcolor: 'white', 
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          cursor: 'pointer'
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {index === 0 ? `Uppdatera preliminär budget ${item}` :
                           index === 1 ? 'Identifiera funktionella krav' :
                           index === 2 ? 'Dokumentation, mappstruktur' :
                           index === 3 ? 'Utformning av ritningsmall' :
                           `Presentation för kunden ${item}`}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {index === 0 ? 'Samla all information för att uppdatera budget' :
                           index === 1 ? 'Identifiera funktionella krav, input, output, gränssnitt' :
                           index === 2 ? 'Skapa mappstruktur för projektet' :
                           index === 3 ? 'Rivningsmall enligt standard 10-12371-2016' :
                           'Presentation för kunden av slutresultat'}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption" color="textSecondary">
                            Klart 30 Maj
                          </Typography>
                          <Box sx={{ 
                            width: 20, 
                            height: 20, 
                            borderRadius: '50%',
                            bgcolor: '#e0e0e0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Typography variant="caption">
                              
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                  
                  <Button 
                    variant="text" 
                    startIcon={<AddIcon />} 
                    size="small" 
                    sx={{ mt: 2, alignSelf: 'flex-start' }}
                  >
                    Lägg till kort
                  </Button>
                </Paper>
              ))}
            </Box>
          )}
        </Paper>
      </Container>
    </MainLayout>
  );
};

export default KanbanPage;