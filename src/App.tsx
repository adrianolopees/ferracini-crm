import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import RegisterCustomer from '@/pages/RegisterCustomer';
import SearchCustomers from '@/pages/SearchCustomers';
import Dashboard from '@/pages/Dashboard';
import ContactedCustomers from '@/pages/ContactedCustomers';
import { ProtectedRoute } from '@/components/routing';
import Login from '@/pages/Login';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/register"
          element={
            <ProtectedRoute>
              <RegisterCustomer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchCustomers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="historico"
          element={
            <ProtectedRoute>
              <ContactedCustomers />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
