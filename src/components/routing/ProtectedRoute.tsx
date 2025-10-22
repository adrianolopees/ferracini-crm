import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import type { ReactNode } from 'react';
import { Spinner } from '@/components/ui';

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;

  if (!user) return <Navigate to="/login" />;
  return children;
}

export default ProtectedRoute;
