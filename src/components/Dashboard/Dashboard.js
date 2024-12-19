// src/components/Dashboard/Dashboard.js
import React from 'react';
import { Container, Grid, Box, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { 
  ContentCut, 
  People, 
  EventAvailable, 
  List, 
  Assessment, 
  AccountBalance,
  Logout 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const MenuButton = ({ icon, text, onClick, color = "primary" }) => (
  <Box
    onClick={onClick}
    sx={{
      p: 3,
      bgcolor: 'background.paper',
      borderRadius: 2,
      boxShadow: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: 6,
      }
    }}
  >
    <Box
      sx={{
        bgcolor: `${color}.main`,
        borderRadius: '50%',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {icon}
    </Box>
    <Typography variant="h6" align="center">
      {text}
    </Typography>
  </Box>
);

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: "¿Estás seguro que deseas salir?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        navigate('/login');
      }
    });
  };

  const menuItems = [
    {
      icon: <ContentCut sx={{ fontSize: 40, color: 'white' }} />,
      text: 'Registrar Corte',
      onClick: () => navigate('/cuts/register'),
      color: 'primary'
    },
    {
      icon: <People sx={{ fontSize: 40, color: 'white' }} />,
      text: 'Administrar Barberos',
      onClick: () => navigate('/barbers'),
      color: 'secondary'
    },
    {
      icon: <EventAvailable sx={{ fontSize: 40, color: 'white' }} />,
      text: 'Reservar Corte',
      onClick: () => navigate('/reservations/new'),
      color: 'success'
    },
    {
      icon: <List sx={{ fontSize: 40, color: 'white' }} />,
      text: 'Lista de Reservas',
      onClick: () => navigate('/reservations'),
      color: 'info'
    },
    {
      icon: <Assessment sx={{ fontSize: 40, color: 'white' }} />,
      text: 'Reportes',
      onClick: () => navigate('/reports'),
      color: 'warning'
    },
    {
      icon: <AccountBalance sx={{ fontSize: 40, color: 'white' }} />,
      text: 'Balance',
      onClick: () => navigate('/balance'),
      color: 'error'
    }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Sistema de Gestión de Barbería
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          {menuItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <MenuButton {...item} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;