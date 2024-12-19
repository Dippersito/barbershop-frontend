// src/components/Reservations/ReservationList.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  IconButton,
  Divider,
  Alert,
  Button,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  EventBusy as EventBusyIcon,
} from '@mui/icons-material';
import moment from 'moment';
import 'moment/locale/es';
import api from '../../services/api';
import Swal from 'sweetalert2';

const ReservationCard = ({ reservation, onDelete }) => {
  const isExpired = moment(`${reservation.date} ${reservation.time}`).isBefore(moment());

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mb: 2,
        borderRadius: 2,
        opacity: isExpired ? 0.7 : 1,
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: 6,
        },
      }}
    >
      {isExpired && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: -35,
            transform: 'rotate(45deg)',
            bgcolor: 'error.main',
            color: 'white',
            py: 0.5,
            px: 4,
            zIndex: 1,
          }}
        >
          Expirado
        </Box>
      )}

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon color="primary" />
            <Typography variant="h6">
              {reservation.client_name}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={6} md={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventIcon color="secondary" />
            <Typography>
              {moment(reservation.date).format('LL')}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={6} md={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimeIcon color="info" />
            <Typography>
              {moment(reservation.time, 'HH:mm').format('hh:mm A')}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton 
            color="error" 
            onClick={() => onDelete(reservation.id)}
            disabled={isExpired}
          >
            <DeleteIcon />
          </IconButton>
        </Grid>

        {reservation.details && (
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography color="text.secondary" variant="body2">
              {reservation.details}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

const ReservationList = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservations();
    // Actualizar la lista cada minuto
    const interval = setInterval(loadReservations, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadReservations = async () => {
    try {
      const response = await api.get('/reservations/');
      setReservations(response.data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las reservas'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (reservationId) => {
    Swal.fire({
      title: '¿Eliminar reserva?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/reservations/${reservationId}/`);
          loadReservations();
          Swal.fire('Eliminado', 'La reserva ha sido eliminada', 'success');
        } catch (error) {
          Swal.fire('Error', 'No se pudo eliminar la reserva', 'error');
        }
      }
    });
  };

  // Agrupar reservaciones por fecha
  const groupedReservations = reservations.reduce((groups, reservation) => {
    const date = reservation.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(reservation);
    return groups;
  }, {});

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Lista de Reservas
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography>Cargando reservas...</Typography>
        </Box>
      ) : reservations.length === 0 ? (
        <Alert 
          severity="info" 
          icon={<EventBusyIcon />}
          sx={{ 
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            py: 2
          }}
        >
          No hay reservas programadas
        </Alert>
      ) : (
        Object.entries(groupedReservations).map(([date, dateReservations]) => (
          <Box key={date} sx={{ mb: 4 }}>
            <Chip
              label={moment(date).format('LL')}
              color="primary"
              sx={{ mb: 2 }}
            />
            {dateReservations
              .sort((a, b) => moment(a.time, 'HH:mm').diff(moment(b.time, 'HH:mm')))
              .map(reservation => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onDelete={handleDelete}
                />
              ))
            }
          </Box>
        ))
      )}
    </Container>
  );
};

export default ReservationList;