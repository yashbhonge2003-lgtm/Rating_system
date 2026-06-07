import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = {
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/admin/users', label: 'Users', icon: '👥' },
    { to: '/admin/stores', label: 'Stores', icon: '🏪' },
    { to: '/admin/add-user', label: 'Add User', icon: '➕' },
    { to: '/admin/add-store', label: 'Add Store', icon: '🏗️' },
  ],
  user: [
    { to: '/user/stores', label: 'Stores', icon: '🏪' },
    { to: '/user/password', label: 'Password', icon: '🔑' },
  ],
  store_owner: [
    { to: '/owner/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/owner/password', label: 'Password', icon: '🔑' },
  ],
};

const roleLabels = {
  admin: 'Admin',
  user: 'User',
  store_owner: 'Store Owner',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const links = navLinks[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="brand-icon">⭐</span>
        <span className="brand-text">StoreRate</span>
      </div>
      <div className="nav-links">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
          >
            <span className="nav-icon">{link.icon}</span>
            <span className="nav-label">{link.label}</span>
          </Link>
        ))}
      </div>
      <div className="nav-user">
        <div className="user-info">
          <span className="user-name">{user.name}</span>
          <span className="user-role">{roleLabels[user.role]}</span>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
    </nav>
  );
}
