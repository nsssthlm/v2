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
    <Card sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography level="title-md">{title}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            size="sm" 
            variant="outlined" 
            color="neutral" 
            startDecorator={<DownloadIcon />}
            sx={{ bgcolor: 'background.surface' }}
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
            '& thead th': { 
              bgcolor: 'background.level1',
              fontWeight: 'bold',
              color: 'text.secondary'
            },
            '& tbody tr:hover': {
              boxShadow: 'none'
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
                  <Typography level="body-sm">{project.name}</Typography>
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
                  <Typography level="body-sm" sx={{ fontWeight: 'md' }}>
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