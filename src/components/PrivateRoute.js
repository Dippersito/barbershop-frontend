// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import Layout from './Layout/Layout';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

export default PrivateRoute;