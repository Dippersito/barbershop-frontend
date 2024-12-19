// src/components/Layout/Layout.js
import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ContentCut,
  People,
  EventAvailable,
  List as ListIcon,
  Assessment,
  AccountBalance,
  Logout,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

const drawerWidth = 280;

const menuItems = [
  { title: 'Registrar Corte', path: '/cuts/register', icon: <ContentCut /> },
  { title: 'Administrar Barberos', path: '/barbers', icon: <People /> },
  { title: 'Reservar Corte', path: '/reservations/new', icon: <EventAvailable /> },
  { title: 'Lista de Reservas', path: '/reservations', icon: <ListIcon /> },
  { title: 'Reportes', path: '/reports', icon: <Assessment /> },
  { title: 'Balance', path: '/balance', icon: <AccountBalance /> },
];

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro que deseas salir?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: theme.palette.primary.main,
      cancelButtonColor: theme.palette.error.main,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        navigate('/login');
      }
    });
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.main',
          color: 'white',
        }}
      >
        <Typography variant="h6" component="h1">
          Sistema de Barbería
        </Typography>
      </Box>
      <Divider />
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              mb: 1,
              mx: 1,
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover',
              },
              '&.Mui-selected': {
                bgcolor: 'primary.light',
                '&:hover': {
                  bgcolor: 'primary.light',
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: location.pathname === item.path ? 'primary.main' : 'inherit',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.title}
              sx={{
                '& .MuiTypography-root': {
                  fontWeight: location.pathname === item.path ? 600 : 400,
                },
              }}
            />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem
          onClick={handleLogout}
          sx={{
            cursor: 'pointer',
            color: 'error.main',
            '&:hover': {
              bgcolor: 'error.light',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Cerrar Sesión" />
        </ListItem>
      </List>
    </Box>
  );

  const isDashboard = location.pathname === '/dashboard';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          {!isDashboard && (
            <IconButton 
              color="inherit" 
              onClick={() => navigate('/dashboard')}
              sx={{ mr: 1 }}
            >
              <ArrowBack />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div">
            {menuItems.find(item => item.path === location.pathname)?.title || 'Dashboard'}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: 'background.default',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: 'background.default',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          pt: { xs: 8, sm: 9 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;