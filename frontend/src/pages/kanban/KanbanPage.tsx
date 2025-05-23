import React, { useState } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Container from '@mui/joy/Container';
import Button from '@mui/joy/Button';
import Sheet from '@mui/joy/Sheet';
import { Add as AddIcon } from '@mui/icons-material';

const KanbanPage: React.FC = () => {
  const [showImage, setShowImage] = useState(true);
  
  return (
    <Box>
      <Container sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography level="h4" component="h1">
            Kanban-tavla
          </Typography>
          <Button 
            variant="solid" 
            color="primary" 
            startDecorator={<AddIcon />}
            onClick={() => setShowImage(!showImage)}
          >
            {showImage ? 'Visa interaktiv vy' : 'Visa exempel'}
          </Button>
        </Box>
        
        <Sheet sx={{ p: 2, width: '100%', minHeight: '80vh', overflowX: 'auto' }}>
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
                <Sheet 
                  key={index} 
                  sx={{ 
                    flex: 1, 
                    p: 2, 
                    bgcolor: index === 0 ? 'neutral.50' : 
                            index === 1 ? 'warning.50' : 
                            index === 2 ? 'info.50' : 
                            index === 3 ? 'warning.50' : 'success.50',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography 
                    level="title-md" 
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
                      <Sheet 
                        key={item} 
                        sx={{ 
                          p: 2, 
                          mb: 2, 
                          bgcolor: 'background.body', 
                          boxShadow: 'sm',
                          cursor: 'pointer'
                        }}
                      >
                        <Typography level="title-sm" sx={{ fontWeight: 'bold' }}>
                          {index === 0 ? `Uppdatera preliminär budget ${item}` :
                           index === 1 ? 'Identifiera funktionella krav' :
                           index === 2 ? 'Dokumentation, mappstruktur' :
                           index === 3 ? 'Utformning av ritningsmall' :
                           `Presentation för kunden ${item}`}
                        </Typography>
                        <Typography level="body-sm">
                          {index === 0 ? 'Samla all information för att uppdatera budget' :
                           index === 1 ? 'Identifiera funktionella krav, input, output, gränssnitt' :
                           index === 2 ? 'Skapa mappstruktur för projektet' :
                           index === 3 ? 'Rivningsmall enligt standard 10-12371-2016' :
                           'Presentation för kunden av slutresultat'}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography level="body-xs">
                            Klart 30 Maj
                          </Typography>
                          <Box sx={{ 
                            width: 20, 
                            height: 20, 
                            borderRadius: '50%',
                            bgcolor: 'neutral.200',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Typography level="body-xs">
                              
                            </Typography>
                          </Box>
                        </Box>
                      </Sheet>
                    ))}
                  </Box>
                  
                  <Button 
                    variant="plain" 
                    startDecorator={<AddIcon />} 
                    size="sm" 
                    sx={{ mt: 2, alignSelf: 'flex-start' }}
                  >
                    Lägg till kort
                  </Button>
                </Sheet>
              ))}
            </Box>
          )}
        </Sheet>
      </Container>
    </Box>
  );
};

export default KanbanPage;