import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import RegisterCustomer from '@/pages/RegisterCustomer';
import SearchCustomers from '@/pages/SearchCustomers';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/register" replace />} />
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
      </Routes>
    </AuthProvider>
  );
}

export default App;
