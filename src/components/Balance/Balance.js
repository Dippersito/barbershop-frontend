// src/components/Balance/Balance.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { AttachMoney, People, Assessment } from '@mui/icons-material';
import api from '../../services/api';
import Swal from 'sweetalert2';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const StatCard = ({ title, value, icon, color = 'primary' }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            bgcolor: `${color}.light`,
            p: 1,
            borderRadius: '50%',
            mr: 2,
            display: 'flex',
          }}
        >
          {icon}
        </Box>
        <Typography color="textSecondary" variant="h6">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div">
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const Balance = () => {
  const [period, setPeriod] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    dailyStats: {
      totalIncome: 0,
      totalCuts: 0,
      cashTotal: 0,
      yapeTotal: 0
    },
    monthlyStats: {
      totalIncome: 0,
      totalCuts: 0,
      cashTotal: 0,
      yapeTotal: 0
    },
    barberPerformance: [],
    salesTrend: [],
    paymentMethods: []
  });

  useEffect(() => {
    loadBalanceData();
  }, [period]);

  const loadBalanceData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/haircuts/balance/', {
        params: { period }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error loading balance:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la información del balance'
      });
    } finally {
      setLoading(false);
    }
  };

  const currentStats = stats[`${period}Stats`] || {
    totalIncome: 0,
    totalCuts: 0,
    cashTotal: 0,
    yapeTotal: 0
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Balance {period === 'daily' ? 'Diario' : 'Mensual'}
          </Typography>
          <Tabs
            value={period}
            onChange={(_, newValue) => setPeriod(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab value="daily" label="Balance Diario" />
            <Tab value="monthly" label="Balance Mensual" />
          </Tabs>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Recaudado"
              value={`S/. ${currentStats.totalIncome?.toFixed(2) || '0.00'}`}
              icon={<AttachMoney sx={{ color: 'primary.main' }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Cortes"
              value={currentStats.totalCuts || 0}
              icon={<People sx={{ color: 'secondary.main' }} />}
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Efectivo"
              value={`S/. ${currentStats.cashTotal?.toFixed(2) || '0.00'}`}
              icon={<AttachMoney sx={{ color: 'success.main' }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Yape"
              value={`S/. ${currentStats.yapeTotal?.toFixed(2) || '0.00'}`}
              icon={<AttachMoney sx={{ color: 'info.main' }} />}
              color="info"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Tendencia de Ventas
              </Typography>
              <ResponsiveContainer>
                <LineChart data={stats.salesTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#8884d8" 
                    name="Ventas" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Métodos de Pago
              </Typography>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={stats.paymentMethods || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {(stats.paymentMethods || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Balance;