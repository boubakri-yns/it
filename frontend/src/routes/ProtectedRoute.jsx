import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ roles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
