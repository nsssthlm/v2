import React from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  IconButton, 
  Table, 
  Sheet, 
  Button
} from '@mui/joy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DownloadIcon from '@mui/icons-material/Download';

interface Project {
  id: number;
  name: string;
  date: string;
  quantity: number;
  price: string;
  amount: string;
}

interface TopProjectsTableProps {
  title: string;
  projects: Project[];
}

const TopProjectsTable = ({ title, projects }: TopProjectsTableProps) => {
  return (
    <Card variant="plain" sx={{ 
      p: 2, 
      height: '100%',
      bgcolor: 'background.surface', 
      boxShadow: 'none',
      borderRadius: 'lg',
      border: '1px solid',
      borderColor: 'divider'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography level="title-sm" sx={{ 
          textTransform: 'uppercase', 
          letterSpacing: '0.5px',
          color: 'text.secondary',
          fontWeight: 'medium'
        }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            size="sm" 
            variant="outlined" 
            startDecorator={<DownloadIcon />}
            sx={{ 
              color: '#e0f2e9',
              borderColor: '#e0f2e9',
              '&:hover': {
                borderColor: '#e0f2e9',
                bgcolor: '#e0f2e9'
              }
            }}
          >
            Export
          </Button>
          <IconButton variant="plain" color="neutral" size="sm">
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Box sx={{ overflow: 'auto' }}>
        <Table 
          hoverRow 
          size="sm"
          sx={{ 
            '--TableCell-paddingY': '0.75rem',
            '& thead th': { 
              bgcolor: 'transparent',
              fontWeight: 'medium',
              color: 'text.secondary',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              borderBottom: '1px solid',
              borderColor: 'divider'
            },
            '& tbody tr:hover': {
              boxShadow: 'none',
              backgroundColor: '#e0f2e9'
            },
            '& tbody td': {
              borderBottom: '1px solid',
              borderColor: 'rgba(0,0,0,0.05)'
            }
          }}
        >
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Projekt</th>
              <th>Datum</th>
              <th>Timmar</th>
              <th>Timpris</th>
              <th>Belopp</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td>
                  <Typography level="body-sm" sx={{ fontWeight: 'medium', color: '#e0f2e9' }}>
                    {project.name}
                  </Typography>
                  <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                    {`ID: ${project.id}`}
                  </Typography>
                </td>
                <td>
                  <Typography level="body-sm">{project.date}</Typography>
                </td>
                <td>
                  <Typography level="body-sm">{project.quantity}</Typography>
                </td>
                <td>
                  <Typography level="body-sm">{project.price}</Typography>
                </td>
                <td>
                  <Typography level="body-sm" sx={{ fontWeight: 'bold' }}>
                    {project.amount}
                  </Typography>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Box>
    </Card>
  );
};

export default TopProjectsTable;