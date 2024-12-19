// src/components/Reservations/CreateReservation.js
import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import moment from 'moment';
import 'moment/locale/es';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../services/api';

const CreateReservation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    date: moment(),
    time: moment().minutes(Math.floor(moment().minutes() / 30) * 30),
    details: '',
  });

  const handleTimeChange = (newTime) => {
    // Redondear a la media hora más cercana
    const minutes = newTime.minutes();
    const roundedMinutes = Math.floor(minutes / 30) * 30;
    setFormData(prev => ({
      ...prev,
      time: newTime.minutes(roundedMinutes).seconds(0)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const reservationData = {
        client_name: formData.client_name,
        date: formData.date.format('YYYY-MM-DD'),
        time: formData.time.format('HH:mm:ss'),
        details: formData.details,
      };

      await api.post('/reservations/', reservationData);

      Swal.fire({
        icon: 'success',
        title: '¡Reserva Creada!',
        text: 'La reserva se ha registrado exitosamente',
        timer: 1500,
      }).then(() => {
        navigate('/dashboard');
      });
    } catch (error) {
      console.error('Error al crear reserva:', error.response?.data);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'No se pudo crear la reserva'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="es">
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Nueva Reserva
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            Las reservas solo pueden hacerse cada 30 minutos.
          </Alert>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Nombre del Cliente"
                value={formData.client_name}
                onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                required
                fullWidth
              />

              <DatePicker
                label="Fecha"
                value={formData.date}
                onChange={(newDate) => setFormData(prev => ({ ...prev, date: newDate }))}
                disablePast
                slotProps={{
                  textField: {
                    required: true,
                    fullWidth: true,
                  }
                }}
              />

              <TimePicker
                label="Hora"
                value={formData.time}
                onChange={handleTimeChange}
                minutesStep={30}
                slotProps={{
                  textField: {
                    required: true,
                    fullWidth: true,
                  }
                }}
              />

              <TextField
                label="Detalles adicionales"
                value={formData.details}
                onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                multiline
                rows={4}
                fullWidth
              />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/dashboard')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Crear Reserva'}
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default CreateReservation;