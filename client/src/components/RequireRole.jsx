import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireRole({ role, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  const currentRole = user.role === 'worker' ? 'worker' : 'admin';
  if (role && currentRole !== role) {
    return <Navigate to={currentRole === 'worker' ? '/worker/dashboard' : '/dashboard'} replace />;
  }

  return children;
}

