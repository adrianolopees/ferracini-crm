import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { RegisterCustomer, SearchCustomers, Dashboard, History } from '@/pages';
import { ProtectedRoute } from '@/components/routing';
import Login from '@/pages/Login';
// import { MigrateWorkspace } from '@/pages'; // ← Comentado: migração já foi executada

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
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        {/* Rota de migração - comentada após uso */}
        {/* <Route
          path="/migrate"
          element={
            <ProtectedRoute>
              <MigrateWorkspace />
            </ProtectedRoute>
          }
        /> */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
