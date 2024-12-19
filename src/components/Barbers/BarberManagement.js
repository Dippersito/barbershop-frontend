// src/components/Barbers/BarberManagement.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import BarberDialog from './BarberDialog';
import api from '../../services/api';
import Swal from 'sweetalert2';

const BarberManagement = () => {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState(null);

  useEffect(() => {
    loadBarbers();
  }, []);

  const loadBarbers = async () => {
    try {
      const response = await api.get('/barbers/');
      setBarbers(response.data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los barberos'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (barber) => {
    Swal.fire({
      title: '¿Eliminar barbero?',
      text: `¿Estás seguro de eliminar a ${barber.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/barbers/${barber.id}/`);
          await loadBarbers();
          Swal.fire('Eliminado', 'El barbero ha sido eliminado', 'success');
        } catch (error) {
          Swal.fire('Error', 'No se pudo eliminar el barbero', 'error');
        }
      }
    });
  };

  const handleDialogSuccess = () => {
    loadBarbers();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            Gestión de Barberos
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedBarber(null);
              setDialogOpen(true);
            }}
          >
            Nuevo Barbero
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : barbers.length === 0 ? (
          <Alert severity="info">
            No hay barberos registrados. ¡Agrega uno nuevo!
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fecha de Registro</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {barbers.map((barber) => (
                  <TableRow key={barber.id}>
                    <TableCell>{barber.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={barber.is_active ? "Activo" : "Inactivo"}
                        color={barber.is_active ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(barber.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setSelectedBarber(barber);
                          setDialogOpen(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(barber)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <BarberDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        barber={selectedBarber}
        onSuccess={handleDialogSuccess}
      />
    </Container>
  );
};

export default BarberManagement;