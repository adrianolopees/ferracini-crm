import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { StoreSettingsProvider } from '@/contexts/StoreSettingsContext';
import { RegisterCustomer, SearchCustomers, Dashboard, History } from '@/pages';
import { ProtectedRoute } from '@/components/routing';
import Login from '@/pages/Login';

function App() {
  return (
    <AuthProvider>
      <StoreSettingsProvider>
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
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />

          <Route path="/login" element={<Login />} />
        </Routes>
      </StoreSettingsProvider>
    </AuthProvider>
  );
}

export default App;
