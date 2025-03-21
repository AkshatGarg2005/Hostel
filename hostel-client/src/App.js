import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ServiceRequest from './pages/ServiceRequest';
import MyServices from './pages/MyServices';
import MessMenu from './pages/MessMenu';
import MessComplaint from './pages/MessComplaint';
import LeaveRequest from './pages/LeaveRequest';
import MyLeaves from './pages/MyLeaves';
import RoomSwapRequest from './pages/RoomSwapRequest';
import MySwaps from './pages/MySwaps';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
        <Route path="/service-request" element={
          <ProtectedRoute>
            <ServiceRequest />
          </ProtectedRoute>
        } />
        <Route path="/my-services" element={
          <ProtectedRoute>
            <MyServices />
          </ProtectedRoute>
        } />
        <Route path="/mess-menu" element={
          <ProtectedRoute>
            <MessMenu />
          </ProtectedRoute>
        } />
        <Route path="/mess-complaint" element={
          <ProtectedRoute>
            <MessComplaint />
          </ProtectedRoute>
        } />
        <Route path="/leave-request" element={
          <ProtectedRoute>
            <LeaveRequest />
          </ProtectedRoute>
        } />
        <Route path="/my-leaves" element={
          <ProtectedRoute>
            <MyLeaves />
          </ProtectedRoute>
        } />
        <Route path="/room-swap-request" element={
          <ProtectedRoute>
            <RoomSwapRequest />
          </ProtectedRoute>
        } />
        <Route path="/my-swaps" element={
          <ProtectedRoute>
            <MySwaps />
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