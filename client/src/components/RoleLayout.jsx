import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/create-invoice', label: 'Create Invoice', icon: '📝' },
  { to: '/items', label: 'Items & Services', icon: '📦' },
  { to: '/clients', label: 'Clients', icon: '👥' },
  { to: '/invoice-history', label: 'Invoice History', icon: '🕐' },
  { to: '/reports', label: 'Reports', icon: '📈' },
];

const workerNavItems = [
  { to: '/worker/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/worker/create-invoice', label: 'Create Invoice', icon: '📝' },
  { to: '/worker/my-invoices', label: 'My Invoices', icon: '🕐' },
];

export default function RoleLayout() {
  const { user, logout } = useAuth();
  const role = user?.role === 'worker' ? 'worker' : 'admin';
  const navItems = role === 'worker' ? workerNavItems : adminNavItems;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">📄</div>
          <div className="logo-text">Easy Billing</div>
        </div>

        <div className={`mode-badge ${role === 'worker' ? 'worker-mode-badge' : ''}`}>
          <div className="mode-title">{role === 'worker' ? '🧑‍🔧 Worker Mode' : '👤 Admin Mode'}</div>
          <div className="mode-subtitle">
            {role === 'worker' ? 'Limited access' : 'Full access to all features'}
          </div>
        </div>

        <ul className="nav-menu">
          {navItems.map(({ to, label, icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                {icon} {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="user-profile">
          <div className="user-avatar">{(user?.username || user?.email || 'U').slice(0, 1).toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{user?.username || 'User'}</div>
            <div className="user-email">{user?.email || ''}</div>
          </div>
          <button className="btn-secondary-action" onClick={logout} style={{ padding: '0.5rem 0.75rem' }}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

