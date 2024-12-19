// src/components/Cuts/RegisterCut.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../services/api';

const RegisterCut = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [barbers, setBarbers] = useState([]);
  const [formData, setFormData] = useState({
    barber: '',
    client_name: '',
    payment_method: '',
    amount: '',
  });

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
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/haircuts/', {
        barber: formData.barber,
        client_name: formData.client_name,
        payment_method: formData.payment_method,
        amount: parseFloat(formData.amount)
      });

      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Corte registrado correctamente',
        timer: 1500
      }).then(() => {
        navigate('/dashboard');
      });
    } catch (error) {
      console.error('Error al registrar corte:', error.response?.data);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'No se pudo registrar el corte'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Registrar Nuevo Corte
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
            <FormControl required>
              <InputLabel>Barbero</InputLabel>
              <Select
                name="barber"
                value={formData.barber}
                label="Barbero *"
                onChange={handleChange}
              >
                {barbers.map((barber) => (
                  <MenuItem key={barber.id} value={barber.id}>
                    {barber.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Nombre del Cliente"
              name="client_name"
              value={formData.client_name}
              onChange={handleChange}
            />

            <FormControl required>
              <InputLabel>Método de Pago</InputLabel>
              <Select
                name="payment_method"
                value={formData.payment_method}
                label="Método de Pago *"
                onChange={handleChange}
              >
                <MenuItem value="CASH">Efectivo</MenuItem>
                <MenuItem value="YAPE">Yape</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Monto"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: 'S/.',
              }}
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
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  'Registrar Corte'
                )}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default RegisterCut;