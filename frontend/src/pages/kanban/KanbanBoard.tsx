import { useState, useEffect, useMemo } from "react";
import { 
  Card, 
  CardContent, 
  Box, 
  Typography, 
  Button, 
  Sheet, 
  Divider, 
  Chip,
  CircularProgress,
  Modal,
  ModalDialog,
  ModalClose,
  DialogTitle,
  DialogContent,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Option
} from "@mui/joy";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import { DndContext, DragOverlay, closestCenter, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { useProject } from '../../contexts/ProjectContext';

// Komponenter för DnD
const DroppableColumn = ({ 
  id, 
  children, 
  className,
  ...props 
}: { 
  id: string; 
  children: React.ReactNode; 
  className?: string;
  [key: string]: any;
}) => {
  return (
    <Sheet
      id={`column-${id}`}
      className={className}
      {...props}
    >
      {children}
    </Sheet>
  );
};

// Typer för Kanban items
interface KanbanTask {
  id: number | string;
  title: string;
  description: string | null;
  status: string;
  priority: 'low' | 'medium' | 'high' | null;
  assignee: string | null;
  dueDate: string | null;
  projectId: number;
}

interface KanbanColumn {
  id: string;
  title: string;
  tasks: KanbanTask[];
  color: string;
}

interface KanbanBoardProps {
  projectId?: number;
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { currentProject } = useProject();
  
  // Standardkolumner
  const [columns, setColumns] = useState<KanbanColumn[]>([
    {
      id: 'backlog',
      title: 'Backlog',
      tasks: [],
      color: 'neutral'
    },
    {
      id: 'todo',
      title: 'Att göra',
      tasks: [],
      color: 'warning'
    },
    {
      id: 'in_progress',
      title: 'Pågående',
      tasks: [],
      color: 'primary'
    },
    {
      id: 'review',
      title: 'Granskning',
      tasks: [],
      color: 'info'
    },
    {
      id: 'done',
      title: 'Klart',
      tasks: [],
      color: 'success'
    }
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee: '',
    dueDate: ''
  });

  // För drag-n-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px rörelse innan drag startar
      },
    })
  );

  // Hämta uppgifter
  useEffect(() => {
    if (!projectId) return;
    
    setIsLoading(true);
    
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/tasks?projectId=${projectId}`);
        const tasksData = response.data || [];
        
        // Fördela uppgifter i kolumner
        const updatedColumns = [...columns];
        
        // Nollställ nuvarande uppgifter
        updatedColumns.forEach(column => {
          column.tasks = [];
        });
        
        // Lägg till uppgifter i respektive kolumn
        tasksData.forEach((task: any) => {
          const columnIndex = updatedColumns.findIndex(col => col.id === task.status);
          if (columnIndex !== -1) {
            updatedColumns[columnIndex].tasks.push({
              id: task.id,
              title: task.title,
              description: task.description,
              status: task.status,
              priority: task.priority,
              assignee: task.assignee ? task.assignee.username : null,
              dueDate: task.dueDate,
              projectId: task.projectId
            });
          }
        });
        
        setColumns(updatedColumns);
      } catch (error) {
        console.error('Fel vid hämtning av uppgifter:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTasks();
  }, [projectId]);

  // Hantera drag start
  const handleDragStart = (event: any) => {
    const { active } = event;
    setActiveId(active.id);
    
    // Hitta uppgiften som dras
    for (const column of columns) {
      const task = column.tasks.find(t => t.id.toString() === active.id);
      if (task) {
        setActiveTask(task);
        break;
      }
    }
  };

  // Hantera drag slut
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      setActiveTask(null);
      return;
    }
    
    // Extrahera kolumn-ID från over.id
    let targetColumnId: string = '';
    
    if (over.id.toString().includes('-')) {
      targetColumnId = over.id.toString().split('-')[1];
    } else {
      setActiveId(null);
      setActiveTask(null);
      return;
    }
    
    if (!targetColumnId) {
      setActiveId(null);
      setActiveTask(null);
      return;
    }
    
    // Hitta uppgiften som flyttas
    let sourceColumnId: string | null = null;
    let taskToMove: KanbanTask | null = null;
    
    const newColumns = [...columns];
    
    for (const column of newColumns) {
      const taskIndex = column.tasks.findIndex(t => t.id.toString() === active.id);
      if (taskIndex !== -1) {
        sourceColumnId = column.id;
        taskToMove = { ...column.tasks[taskIndex] };
        column.tasks.splice(taskIndex, 1);
        break;
      }
    }
    
    if (sourceColumnId && taskToMove && targetColumnId !== sourceColumnId) {
      // Uppdatera uppgiftens status i databasen
      try {
        await axios.patch(`${API_BASE_URL}/api/tasks/${taskToMove.id}`, {
          status: targetColumnId
        });
        
        // Lägg till uppgiften i målkolumnen med uppdaterad status
        const targetColumnIndex = newColumns.findIndex(col => col.id === targetColumnId);
        if (targetColumnIndex !== -1) {
          taskToMove.status = targetColumnId;
          newColumns[targetColumnIndex].tasks.push(taskToMove);
        }
        
        setColumns(newColumns);
      } catch (error) {
        console.error('Fel vid uppdatering av uppgift:', error);
        
        // Återställ om det inte fungerade
        const fetchTasks = async () => {
          try {
            const response = await axios.get(`${API_BASE_URL}/api/tasks?projectId=${projectId}`);
            // ... uppdatera kolumner som i useEffect
          } catch (err) {
            console.error('Kunde inte återställa uppgifter:', err);
          }
        };
        
        fetchTasks();
      }
    } else if (sourceColumnId && taskToMove) {
      // Om samma kolumn, lägg bara tillbaka uppgiften
      const sourceColumnIndex = newColumns.findIndex(col => col.id === sourceColumnId);
      if (sourceColumnIndex !== -1) {
        newColumns[sourceColumnIndex].tasks.push(taskToMove);
      }
      
      setColumns(newColumns);
    }
    
    setActiveId(null);
    setActiveTask(null);
  };

  // Hantera öppna modalen för ny uppgift
  const handleOpenNewTaskModal = (columnId: string) => {
    setIsCreatingNew(true);
    setFormData({
      title: '',
      description: '',
      status: columnId,
      priority: 'medium',
      assignee: '',
      dueDate: ''
    });
    setIsTaskModalOpen(true);
  };

  // Hantera öppna modalen för redigering
  const handleOpenEditTaskModal = (task: KanbanTask) => {
    setIsCreatingNew(false);
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority || 'medium',
      assignee: task.assignee || '',
      dueDate: task.dueDate || ''
    });
    setIsTaskModalOpen(true);
  };

  // Hantera formulärändringar
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Hantera select-ändringar
  const handleSelectChange = (name: string, value: string | null) => {
    setFormData(prev => ({
      ...prev,
      [name]: value || ''
    }));
  };

  // Spara uppgift
  const handleSaveTask = async () => {
    try {
      if (isCreatingNew) {
        // Skapa ny uppgift
        const response = await axios.post(`${API_BASE_URL}/api/tasks`, {
          ...formData,
          projectId: projectId
        });
        
        // Uppdatera UI
        const newTask = response.data;
        const updatedColumns = [...columns];
        const targetColumnIndex = updatedColumns.findIndex(col => col.id === formData.status);
        
        if (targetColumnIndex !== -1) {
          updatedColumns[targetColumnIndex].tasks.push({
            id: newTask.id,
            title: newTask.title,
            description: newTask.description,
            status: newTask.status,
            priority: newTask.priority,
            assignee: newTask.assignee ? newTask.assignee.username : null,
            dueDate: newTask.dueDate,
            projectId: newTask.projectId
          });
          
          setColumns(updatedColumns);
        }
      } else if (selectedTask) {
        // Uppdatera befintlig uppgift
        const response = await axios.patch(`${API_BASE_URL}/api/tasks/${selectedTask.id}`, formData);
        
        // Uppdatera UI
        const updatedTask = response.data;
        const updatedColumns = [...columns];
        
        // Hitta och ta bort den gamla uppgiften
        let found = false;
        for (const column of updatedColumns) {
          const taskIndex = column.tasks.findIndex(t => t.id === selectedTask.id);
          if (taskIndex !== -1) {
            column.tasks.splice(taskIndex, 1);
            found = true;
            break;
          }
        }
        
        // Lägg till uppdaterad uppgift i rätt kolumn
        if (found) {
          const targetColumnIndex = updatedColumns.findIndex(col => col.id === updatedTask.status);
          if (targetColumnIndex !== -1) {
            updatedColumns[targetColumnIndex].tasks.push({
              id: updatedTask.id,
              title: updatedTask.title,
              description: updatedTask.description,
              status: updatedTask.status,
              priority: updatedTask.priority,
              assignee: updatedTask.assignee ? updatedTask.assignee.username : null,
              dueDate: updatedTask.dueDate,
              projectId: updatedTask.projectId
            });
          }
          
          setColumns(updatedColumns);
        }
      }
      
      // Stäng modalen
      setIsTaskModalOpen(false);
      setSelectedTask(null);
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assignee: '',
        dueDate: ''
      });
    } catch (error) {
      console.error('Fel vid sparande av uppgift:', error);
    }
  };

  // Radera uppgift
  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/api/tasks/${selectedTask.id}`);
      
      // Uppdatera UI
      const updatedColumns = [...columns];
      for (const column of updatedColumns) {
        const taskIndex = column.tasks.findIndex(t => t.id === selectedTask.id);
        if (taskIndex !== -1) {
          column.tasks.splice(taskIndex, 1);
          break;
        }
      }
      
      setColumns(updatedColumns);
      setIsTaskModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Fel vid radering av uppgift:', error);
    }
  };

  // Hjälpfunktion för att få prioritetsfärg
  const getPriorityColor = (priority: string | null) => {
    switch(priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'neutral';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: 2,
            height: '100%',
            pb: 4
          }}
        >
          {columns.map((column) => (
            <DroppableColumn 
              key={column.id}
              id={column.id}
              variant="outlined"
              sx={{ 
                p: 2, 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: `${column.color}.50`
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2,
                pb: 1,
                borderBottom: '1px solid',
                borderColor: `${column.color}.200`
              }}>
                <Typography level="title-md" color={column.color}>
                  {column.title} ({column.tasks.length})
                </Typography>
                <Button 
                  variant="plain" 
                  color={column.color} 
                  size="sm"
                  startDecorator={<AddIcon />}
                  onClick={() => handleOpenNewTaskModal(column.id)}
                >
                  Lägg till
                </Button>
              </Box>
              
              <Box sx={{ 
                flex: 1, 
                overflowY: 'auto', 
                minHeight: 0,
                display: 'flex', 
                flexDirection: 'column', 
                gap: 1.5
              }}>
                <SortableContext 
                  items={column.tasks.map(task => task.id.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  {column.tasks.map((task) => (
                    <Card
                      key={task.id}
                      id={task.id.toString()}
                      variant="outlined"
                      sx={{ 
                        mb: 1,
                        cursor: 'pointer',
                        '&:hover': { 
                          boxShadow: 'sm',
                          borderColor: `${column.color}.300`
                        }
                      }}
                      onClick={() => handleOpenEditTaskModal(task)}
                    >
                      <CardContent>
                        <Typography level="title-sm" sx={{ mb: 1 }}>
                          {task.title}
                        </Typography>
                        
                        {task.description && (
                          <Typography 
                            level="body-sm" 
                            sx={{ 
                              mb: 1.5,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {task.description}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                          {task.priority && (
                            <Chip
                              size="sm"
                              variant="soft"
                              color={getPriorityColor(task.priority)}
                              startDecorator={<PriorityHighIcon fontSize="small" />}
                            >
                              {task.priority}
                            </Chip>
                          )}
                          
                          {task.assignee && (
                            <Chip
                              size="sm"
                              variant="soft"
                              startDecorator={<PersonIcon fontSize="small" />}
                            >
                              {task.assignee}
                            </Chip>
                          )}
                          
                          {task.dueDate && (
                            <Chip
                              size="sm"
                              variant="soft"
                              startDecorator={<AccessTimeIcon fontSize="small" />}
                            >
                              {new Date(task.dueDate).toLocaleDateString()}
                            </Chip>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {column.tasks.length === 0 && (
                    <Box 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center', 
                        color: 'text.secondary',
                        border: '1px dashed',
                        borderColor: 'divider',
                        borderRadius: 'sm'
                      }}
                    >
                      <Typography level="body-sm">
                        Inga uppgifter
                      </Typography>
                    </Box>
                  )}
                </SortableContext>
              </Box>
            </DroppableColumn>
          ))}
        </Box>
        
        <DragOverlay>
          {activeId && activeTask && (
            <Card
              variant="outlined"
              sx={{ 
                width: '250px',
                opacity: 0.8,
                boxShadow: 'lg'
              }}
            >
              <CardContent>
                <Typography level="title-sm">
                  {activeTask.title}
                </Typography>
                {activeTask.description && (
                  <Typography level="body-sm">
                    {activeTask.description}
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}
        </DragOverlay>
      </DndContext>
      
      {/* Modal för att skapa/redigera uppgift */}
      <Modal open={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)}>
        <ModalDialog 
          variant="outlined" 
          sx={{ 
            maxWidth: 500,
            borderRadius: 'md',
            p: 3
          }}
        >
          <ModalClose />
          <DialogTitle>
            {isCreatingNew ? 'Skapa ny uppgift' : 'Redigera uppgift'}
          </DialogTitle>
          <Divider />
          <DialogContent>
            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Titel</FormLabel>
              <Input
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="Uppgiftens titel"
              />
            </FormControl>
            
            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Beskrivning</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                minRows={3}
                placeholder="Beskriv uppgiften"
              />
            </FormControl>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <FormLabel>Status</FormLabel>
                <Select 
                  value={formData.status}
                  onChange={(_, value) => handleSelectChange('status', value)}
                >
                  {columns.map(column => (
                    <Option key={column.id} value={column.id}>{column.title}</Option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl sx={{ flex: 1 }}>
                <FormLabel>Prioritet</FormLabel>
                <Select 
                  value={formData.priority}
                  onChange={(_, value) => handleSelectChange('priority', value)}
                >
                  <Option value="low">Låg</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">Hög</Option>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <FormLabel>Ansvarig</FormLabel>
                <Input
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleFormChange}
                  placeholder="Tilldela ansvarig"
                />
              </FormControl>
              
              <FormControl sx={{ flex: 1 }}>
                <FormLabel>Deadline</FormLabel>
                <Input
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleFormChange}
                />
              </FormControl>
            </Box>
          </DialogContent>
          
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            {!isCreatingNew && (
              <Button 
                variant="soft" 
                color="danger" 
                startDecorator={<DeleteIcon />}
                onClick={handleDeleteTask}
              >
                Ta bort
              </Button>
            )}
            <Button 
              variant="solid" 
              color="primary"
              onClick={handleSaveTask}
            >
              {isCreatingNew ? 'Skapa' : 'Spara'}
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </>
  );
}