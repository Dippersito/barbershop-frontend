// src/services/api.js
import axios from 'axios';
import { getLicenseData } from '../utils/machineId';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://barbershop-management-production.up.railway.app/api'
  : 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor para agregar headers a todas las peticiones
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      const { machineId } = getLicenseData();
      
      const headers = {
        ...config.headers,
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      if (machineId) {
        headers['X-Machine-ID'] = machineId;
      }

      // Debug info en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log('Request URL:', config.url);
        console.log('Request Headers:', headers);
      }
      
      config.headers = headers;
      return config;
    } catch (error) {
      console.error('Error en interceptor de request:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('Error en request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    // Debug info en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('Response:', response.config.url, response.status);
    }
    return response;
  },
  (error) => {
    // Debug info en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.error('Response Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data
      });
    }

    // Manejar diferentes tipos de errores
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Token expirado o inválido
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          break;
        case 403:
          // Error de licencia
          if (error.response.data?.code === 'INVALID_LICENSE' ||
              error.response.data?.code === 'LICENSE_EXPIRED') {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/activate-license';
          }
          break;
        case 404:
          console.error('Recurso no encontrado:', error.config.url);
          break;
        case 500:
          console.error('Error del servidor:', error.response.data);
          break;
        default:
          console.error('Error de respuesta:', error.response.status, error.response.data);
      }
    } else if (error.request) {
      // Error de red o servidor no responde
      console.error('Error de red:', error.request);
    } else {
      console.error('Error de configuración:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;