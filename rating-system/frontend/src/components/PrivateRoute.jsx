import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleRedirects = {
  admin: '/admin/dashboard',
  user: '/user/stores',
  store_owner: '/owner/dashboard',
};

export default function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={roleRedirects[user.role] || '/login'} replace />;
  }

  return children;
}
