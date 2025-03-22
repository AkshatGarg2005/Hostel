import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ServiceManager from './pages/ServiceManager';
import MessManager from './pages/MessManager';
import Warden from './pages/Warden';
import SecurityManager from './pages/SecurityManager'; // New page for security manager

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/service-manager" element={
          <ProtectedRoute allowedRoles={['admin', 'service_manager']}>
            <ServiceManager />
          </ProtectedRoute>
        } />
        <Route path="/mess-manager" element={
          <ProtectedRoute allowedRoles={['admin', 'mess_manager']}>
            <MessManager />
          </ProtectedRoute>
        } />
        <Route path="/warden" element={
          <ProtectedRoute allowedRoles={['admin', 'warden']}>
            <Warden />
          </ProtectedRoute>
        } />
        <Route path="/security-manager" element={
          <ProtectedRoute allowedRoles={['admin', 'security_manager']}>
            <SecurityManager />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;