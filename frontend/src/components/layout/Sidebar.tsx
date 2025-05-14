import { Sheet, List, ListItem, ListItemButton, ListItemContent, Typography, Box } from '@mui/joy';
import { Link } from 'react-router-dom';

// Defines the sidebar menu items
const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: '📊' },
  { name: 'Projekt', path: '/projects', icon: '📁' },
  { name: 'Uppgifter', path: '/tasks', icon: '✓' },
  { name: 'Dokument', path: '/files', icon: '📄' },
  { name: 'Team', path: '/team', icon: '👥' },
  { name: 'Inställningar', path: '/settings', icon: '⚙️' },
];

interface SidebarProps {
  open?: boolean;
}

const Sidebar = ({ open = true }: SidebarProps) => {
  return (
    <Sheet
      sx={{
        width: open ? 240 : 70,
        transition: 'width 0.3s ease-in-out',
        height: '100vh',
        borderRight: '1px solid',
        borderColor: 'divider',
        p: 2,
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 3,
          mt: 1,
        }}
      >
        <Typography level="h4" component="div">
          {open ? 'ValvX' : 'V'}
        </Typography>
      </Box>

      <List size="sm" sx={{ '--ListItem-radius': '8px' }}>
        {menuItems.map((item) => (
          <ListItem key={item.path}>
            <ListItemButton component={Link} to={item.path}>
              <Box
                sx={{
                  minWidth: '30px',
                  display: 'flex',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                }}
              >
                {item.icon}
              </Box>
              {open && (
                <ListItemContent>
                  <Typography level="body-sm">{item.name}</Typography>
                </ListItemContent>
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Sheet>
  );
};

export default Sidebar;