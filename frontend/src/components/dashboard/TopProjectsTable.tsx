import React from 'react';
import { Box, Typography, Card, Table, Sheet, LinearProgress } from '@mui/joy';
import FolderIcon from '@mui/icons-material/Folder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import WarningIcon from '@mui/icons-material/Warning';

interface Project {
  id: number;
  name: string;
  progress: number;
  status: string;
  budget: string;
}

interface TopProjectsTableProps {
  title: string;
  projects: Project[];
  height?: number | string;
  maxRows?: number;
}

// Hjälpfunktion för att visa statusikon
const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'slutförd':
    case 'slutfas':
      return <CheckCircleIcon sx={{ color: '#4caf50', fontSize: '1.2rem' }} />;
    case 'försenad':
      return <WarningIcon sx={{ color: '#f44336', fontSize: '1.2rem' }} />;
    case 'pågående':
      return <MoreTimeIcon sx={{ color: '#2196f3', fontSize: '1.2rem' }} />;
    default:
      return <FolderIcon sx={{ color: '#757575', fontSize: '1.2rem' }} />;
  }
};

// Hjälpfunktion för att få rätt färg på progress bar
const getProgressColor = (progress: number, status: string) => {
  if (status.toLowerCase() === 'slutförd' || status.toLowerCase() === 'slutfas') {
    return '#4caf50';
  }
  if (status.toLowerCase() === 'försenad') {
    return '#f44336';
  }
  if (progress < 30) {
    return '#ff9800';
  }
  if (progress < 70) {
    return '#2196f3';
  }
  return '#4caf50';
};

const TopProjectsTable: React.FC<TopProjectsTableProps> = ({ 
  title, 
  projects,
  height = 'auto',
  maxRows = 5
}) => {
  // Begränsa antalet projekt som visas
  const displayedProjects = projects.slice(0, maxRows);
  
  return (
    <Card 
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        transition: 'box-shadow 0.2s',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0, 121, 52, 0.08)',
          border: '1px solid rgba(0, 121, 52, 0.12)'
        }
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'rgba(0, 0, 0, 0.04)' }}>
        <Typography 
          level="title-md" 
          sx={{ 
            fontWeight: 600, 
            color: '#2e7d32',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: '0.875rem'
          }}
        >
          {title}
        </Typography>
      </Box>
      
      <Box 
        sx={{ 
          flexGrow: 1,
          overflowY: 'auto',
          height: height !== 'auto' ? height : undefined,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#e0e0e0',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          }
        }}
      >
        <Table 
          sx={{ 
            '& th': { 
              fontWeight: 600, 
              color: 'text.secondary',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              py: 1.5,
              bgcolor: '#f5f5f5'
            } 
          }}
        >
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Projektnamn</th>
              <th style={{ width: '30%' }}>Status</th>
              <th style={{ width: '15%' }}>Framsteg</th>
              <th style={{ width: '15%' }}>Budget</th>
            </tr>
          </thead>
          <tbody>
            {displayedProjects.map((project) => (
              <tr key={project.id}>
                <td>
                  <Typography 
                    level="body-sm" 
                    sx={{ 
                      fontWeight: 600,
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {project.name}
                  </Typography>
                </td>
                <td>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(project.status)}
                    <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                      {project.status}
                    </Typography>
                  </Box>
                </td>
                <td>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography 
                      level="body-xs" 
                      sx={{ 
                        color: 'text.secondary',
                        textAlign: 'right',
                        pr: 1,
                        fontWeight: 600
                      }}
                    >
                      {project.progress}%
                    </Typography>
                    <LinearProgress 
                      determinate 
                      value={project.progress} 
                      size="sm"
                      sx={{ 
                        '--LinearProgress-radius': '4px',
                        '--LinearProgress-progressThickness': '6px',
                        '--LinearProgress-thickness': '6px',
                        '--LinearProgress-progressBg': getProgressColor(project.progress, project.status),
                      }}
                    />
                  </Box>
                </td>
                <td>
                  <Typography level="body-sm" sx={{ fontWeight: 600, color: '#007934' }}>
                    {project.budget}
                  </Typography>
                </td>
              </tr>
            ))}
            {displayedProjects.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                    Inga projekt tillgängliga
                  </Typography>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Box>
    </Card>
  );
};

export default TopProjectsTable;