// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import License from './components/License';
import Login from './components/Login';
import Dashboard from './components/Dashboard/Dashboard';
import RegisterCut from './components/Cuts/RegisterCut';
import BarberManagement from './components/Barbers/BarberManagement';
import CreateReservation from './components/Reservations/CreateReservation';
import ReservationList from './components/Reservations/ReservationList';
import Reports from './components/Reports/Reports';
import Balance from './components/Balance/Balance';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/activate-license" element={<License />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        <Route path="/cuts/register" element={
          <PrivateRoute>
            <RegisterCut />
          </PrivateRoute>
        } />
        
        <Route path="/barbers" element={
          <PrivateRoute>
            <BarberManagement />
          </PrivateRoute>
        } />
        
        <Route path="/reservations/new" element={
          <PrivateRoute>
            <CreateReservation />
          </PrivateRoute>
        } />
        
        <Route path="/reservations" element={
          <PrivateRoute>
            <ReservationList />
          </PrivateRoute>
        } />
        
        <Route path="/reports" element={
          <PrivateRoute>
            <Reports />
          </PrivateRoute>
        } />
        
        <Route path="/balance" element={
          <PrivateRoute>
            <Balance />
          </PrivateRoute>
        } />

        {/* Redirecciones */}
        <Route path="/" element={<Navigate to="/activate-license" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;