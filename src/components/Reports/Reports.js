// src/components/Reports/Reports.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  FileDownload as DownloadIcon,
  Delete as DeleteIcon,
  DateRange as DateRangeIcon,
  FilterAlt as FilterIcon,
} from '@mui/icons-material';
import moment from 'moment';
import 'moment/locale/es';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { Print as PrintIcon } from '@mui/icons-material';

const Reports = () => {
  const [cuts, setCuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadCuts();
  }, [dateRange]);

  const loadCuts = async () => {
    try {
      const response = await api.get('/haircuts/', {
        params: {
          start_date: dateRange.startDate,
          end_date: dateRange.endDate,
        }
      });
      setCuts(response.data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los cortes'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = () => {
    Swal.fire({
      title: 'Eliminación de Registros',
      input: 'text',
      inputPlaceholder: 'Escribe: "Deseo borrar los registros"',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      preConfirm: (text) => {
        if (text !== 'Deseo borrar los registros') {
          Swal.showValidationMessage('Por favor escribe exactamente: "Deseo borrar los registros"')
          return false;
        }
        return true;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        deleteAllRecords();
      }
    });
  };

  const deleteAllRecords = async () => {
    try {
      const response = await api.delete('/haircuts/delete_all/');
      
      if (response.data.deleted_count === 0) {
        Swal.fire('Info', 'No hay registros para eliminar', 'info');
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Registros Eliminados',
          text: `Se eliminaron ${response.data.deleted_count} registros correctamente`
        });
      }
      
      loadCuts();  // Recargar la lista de cortes
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'No se pudieron eliminar los registros'
      });
    }
  };

  const handlePrintReport = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
  
      // Usar la misma baseURL que está configurada en api.js
      const baseUrl = api.defaults.baseURL.replace('/api', '');
      
      const url = `${baseUrl}/api/haircuts/report/?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      
      const reportWindow = window.open('', '_blank');
      reportWindow.document.write('<h3>Cargando reporte...</h3>');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/html',
          'Content-Type': 'text/html',
        },
        mode: 'cors',
        credentials: 'include'
      });
  
      if (!response.ok) {
        const text = await response.text();
        console.error('Error response:', text);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const html = await response.text();
      reportWindow.document.open();
      reportWindow.document.write(html);
      reportWindow.document.close();
      
    } catch (error) {
      console.error('Error printing report:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message === 'No hay token de autenticación' 
          ? 'Por favor inicie sesión nuevamente'
          : 'No se pudo generar el reporte. Por favor intente nuevamente.'
      });
    }
  };

  const calculateTotals = () => {
    return cuts.reduce((acc, cut) => {
      acc.total += Number(cut.amount);
      if (cut.payment_method === 'CASH') {
        acc.cash += Number(cut.amount);
      } else {
        acc.yape += Number(cut.amount);
      }
      return acc;
    }, { total: 0, cash: 0, yape: 0 });
  };

  const DateRangeDialog = () => (
    <Dialog open={showDatePicker} onClose={() => setShowDatePicker(false)}>
      <DialogTitle>Seleccionar Rango de Fechas</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Fecha Inicial"
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({...prev, startDate: e.target.value}))}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Fecha Final"
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({...prev, endDate: e.target.value}))}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowDatePicker(false)}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );

  const { total, cash, yape } = calculateTotals();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Reportes de Cortes
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DateRangeIcon />}
              onClick={() => setShowDatePicker(true)}
            >
              Rango de Fechas
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PrintIcon />}
              onClick={handlePrintReport}
            >
              Imprimir Reporte
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteAll}
            >
              Eliminar Registros
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h6">Total Recaudado</Typography>
              <Typography variant="h4">S/. {total.toFixed(2)}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.main', color: 'white' }}>
              <Typography variant="h6">Efectivo</Typography>
              <Typography variant="h4">S/. {cash.toFixed(2)}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.main', color: 'white' }}>
              <Typography variant="h6">Yape</Typography>
              <Typography variant="h4">S/. {yape.toFixed(2)}</Typography>
            </Paper>
          </Grid>
        </Grid>

        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Barbero</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Método de Pago</TableCell>
                <TableCell align="right">Monto</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">Cargando...</TableCell>
                </TableRow>
              ) : cuts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Alert severity="info">No hay registros para mostrar</Alert>
                  </TableCell>
                </TableRow>
              ) : (
                cuts.map((cut) => (
                  <TableRow key={cut.id} hover>
                    <TableCell>{moment(cut.created_at).format('DD/MM/YYYY HH:mm')}</TableCell>
                    <TableCell>{cut.barber_name}</TableCell>
                    <TableCell>{cut.client_name || 'Cliente anónimo'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={cut.payment_method === 'CASH' ? 'Efectivo' : 'Yape'}
                        color={cut.payment_method === 'CASH' ? 'success' : 'info'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">S/. {Number(cut.amount).toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <DateRangeDialog />
    </Container>
  );
};

export default Reports;