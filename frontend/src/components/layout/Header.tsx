import React from 'react';
import { Box, Typography, IconButton } from '@mui/joy';
import MenuIcon from '@mui/icons-material/Menu';
import { useProject } from '../../contexts/ProjectContext';

interface HeaderProps {
  title: string;
  onToggleSidebar?: () => void;
}

export function Header({ title, onToggleSidebar }: HeaderProps) {
  const { currentProject } = useProject();

  return (
    <Box
      component="header"
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.surface'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {onToggleSidebar && (
          <IconButton 
            onClick={onToggleSidebar} 
            size="sm" 
            variant="plain"
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography level="h4">{title}</Typography>
      </Box>
      
      <Box>
        {currentProject && (
          <Typography level="body-sm">
            Projekt: <strong>{currentProject.name}</strong>
          </Typography>
        )}
      </Box>
    </Box>
  );
}