import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthLoadingScreen } from '../components/AuthLoadingScreen';
import type { ReactNode } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <AuthLoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
