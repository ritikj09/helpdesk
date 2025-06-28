import React from 'react';
import Register from './pages/Register';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoutes';
import UserComplaints from './pages/UserComplaints';
import AdminDashboard from './pages/AdminDashboard';
import PersonnelDashboard from './pages/PersonnelDashboard';
import Navbar from './pages/Navbar';
import { Routes, Route } from 'react-router-dom';
import ForgotPassword from './pages/ForgotPassword';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute requiredRole="user">
              <UserComplaints />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/personnel/dashboard"
          element={
            <ProtectedRoute requiredRole="worker">
              <PersonnelDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
