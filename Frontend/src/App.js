import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'react-toastify/dist/ReactToastify.css';
import './styles/App.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import HRList from './pages/HRList';
import AttendancePage from './pages/AttendancePage';
import LeavesPage from './pages/LeavesPage';
import CalendarPage from './pages/CalendarPage';
import PerformancePage from './pages/PerformancePage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="fullscreen-loader"><div className="spinner-ring"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="employees" element={<ProtectedRoute roles={['admin', 'hr']}><EmployeeList /></ProtectedRoute>} />
        <Route path="hr-management" element={<ProtectedRoute roles={['admin']}><HRList /></ProtectedRoute>} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="leaves" element={<LeavesPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="performance" element={<PerformancePage />} />
        <Route path="reports" element={<ProtectedRoute roles={['admin', 'hr']}><ReportsPage /></ProtectedRoute>} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      </Router>
    </AuthProvider>
  );
}
