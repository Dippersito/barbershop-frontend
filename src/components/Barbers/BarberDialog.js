// src/components/Barbers/BarberDialog.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress
} from '@mui/material';
import Swal from 'sweetalert2';
import api from '../../services/api';

const BarberDialog = ({ open, onClose, barber, onSuccess }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (barber) {
      setName(barber.name);
    } else {
      setName('');
    }
  }, [barber]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = { name };
      let response;

      if (barber) {
        response = await api.put(`/barbers/${barber.id}/`, data);
      } else {
        response = await api.post('/barbers/', data);
      }

      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: `Barbero ${barber ? 'actualizado' : 'creado'} correctamente`
      });

      onSuccess(response.data);
      onClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Ocurrió un error al procesar la solicitud'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {barber ? 'Editar Barbero' : 'Nuevo Barbero'}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              autoFocus
              fullWidth
              label="Nombre del Barbero"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button 
            onClick={onClose} 
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
              <CircularProgress size={24} color="inherit" />
            ) : barber ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BarberDialog;