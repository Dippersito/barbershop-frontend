// src/components/Login.js
import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  CircularProgress,
  useTheme 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LockOutlined } from '@mui/icons-material';
import Swal from 'sweetalert2';
import api from '../services/api';
import { getMachineId, getLicenseData } from '../utils/machineId';

const Login = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

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
      // Obtener machine_id
      const { machineId } = getLicenseData();
      if (!machineId) {
        console.error('No machine ID found');
        navigate('/activate-license');
        return;
      }

      console.log('Machine ID:', machineId);
      console.log('Login data:', formData);

      const response = await api.post('/auth/login/', formData, {
        headers: {
          'X-Machine-ID': machineId
        }
      });

      console.log('Login response:', response.data);
      
      const { access, refresh } = response.data;
      if (!access || !refresh) {
        throw new Error('No tokens received');
      }

      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      navigate('/dashboard');
    } catch (error) {
      console.error('Full error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 400) {
        Swal.fire({
          icon: 'error',
          title: 'Error de inicio de sesión',
          text: 'Por favor, asegúrese de activar una licencia antes de iniciar sesión',
          confirmButtonText: 'Activar Licencia',
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/activate-license');
          }
        });
      } else if (error.response?.status === 403) {
        Swal.fire({
          icon: 'error',
          title: 'Error de Licencia',
          text: error.response.data.error || 'Error con la licencia',
          footer: error.response.data.support_message,
          confirmButtonText: 'Activar Licencia',
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/activate-license');
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error de inicio de sesión',
          text: error.response?.data?.detail || error.message || 'Error al iniciar sesión',
          confirmButtonColor: theme.palette.primary.main
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <LockOutlined sx={{ color: 'white' }} />
          </Box>

          <Typography component="h1" variant="h5" gutterBottom>
            Iniciar Sesión
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Usuario"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Contraseña"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;