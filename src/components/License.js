import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../services/api';
import { getMachineId, saveLicenseData, getLicenseData } from '../utils/machineId';

const License = () => {
  const navigate = useNavigate();
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkExistingLicense();
  }, []);

  const checkExistingLicense = async () => {
    const { licenseKey: storedLicense, machineId } = getLicenseData();
    
    if (storedLicense && machineId) {
      try {
        await api.post('/license/activate/', {
          license_key: storedLicense,
          machine_id: machineId
        });
        navigate('/login');
      } catch (error) {
        // Si hay error, permitir nueva activación
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const handleActivate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const machineId = getMachineId();
      await api.post('/license/activate/', {
        license_key: licenseKey,
        machine_id: machineId
      });

      // Guardar datos de licencia
      saveLicenseData(licenseKey);

      Swal.fire({
        icon: 'success',
        title: 'Licencia Activada',
        text: 'La licencia se ha activado correctamente',
        showConfirmButton: true,
      }).then(() => {
        navigate('/login');
      });
    } catch (error) {
      const errorCode = error.response?.data?.code;
      let errorMessage = '';

      switch (errorCode) {
        case 'LICENSE_IN_USE':
          errorMessage = 'Esta licencia ya está siendo utilizada en otra máquina';
          break;
        case 'ACTIVE_LICENSE_EXISTS':
          errorMessage = `Esta barbería ya tiene una licencia válida activa que vence el ${
            new Date(error.response.data.expires_at).toLocaleDateString()
          }`;
          break;
        case 'LICENSE_NOT_FOUND':
          errorMessage = 'La licencia ingresada no es válida';
          break;
        default:
          errorMessage = 'Ocurrió un error al activar la licencia. Por favor, intente nuevamente';
      }

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonText: 'Entendido'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            Activación de Licencia
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Ingrese su clave de licencia para activar el sistema
          </Alert>

          <form onSubmit={handleActivate}>
            <TextField
              fullWidth
              label="Clave de Licencia"
              variant="outlined"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              required
              disabled={loading}
            />
            
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Activar Licencia'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default License;