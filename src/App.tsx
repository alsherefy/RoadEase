import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AppProvider } from './contexts/AppContext';
import { useAuth } from './contexts/AuthContext';

import Login from './pages/Login';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import ServiceOrders from './pages/ServiceOrders';
import Inventory from './pages/Inventory';
import Invoices from './pages/Invoices';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Employees from './pages/Employees';
import Payroll from './pages/Payroll';
import Forecast from './pages/Forecast';
import Settings from './pages/Settings';
import Layout from './components/Layout/Layout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  // Check if initial setup is needed
  const existingUsers = JSON.parse(localStorage.getItem('roadease_users') || '[]');
  if (existingUsers.length === 0) {
    return <Navigate to="/setup" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/setup" element={<Setup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/customers" element={
        <ProtectedRoute>
          <Customers />
        </ProtectedRoute>
      } />
      <Route path="/service-orders" element={
        <ProtectedRoute>
          <ServiceOrders />
        </ProtectedRoute>
      } />
      <Route path="/inventory" element={
        <ProtectedRoute>
          <Inventory />
        </ProtectedRoute>
      } />
      <Route path="/invoices" element={
        <ProtectedRoute>
          <Invoices />
        </ProtectedRoute>
      } />
      <Route path="/expenses" element={
        <ProtectedRoute>
          <Expenses />
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      } />
      <Route path="/employees" element={
        <ProtectedRoute>
          <Employees />
        </ProtectedRoute>
      } />
      <Route path="/payroll" element={
        <ProtectedRoute>
          <Payroll />
        </ProtectedRoute>
      } />
      <Route path="/forecast" element={
        <ProtectedRoute>
          <Forecast />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AppProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;