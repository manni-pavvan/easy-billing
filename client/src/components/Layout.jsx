import { Outlet, NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/create-invoice', label: 'Create Invoice', icon: '📝' },
  { to: '/clients', label: 'Clients', icon: '👥' },
  { to: '/invoice-history', label: 'Invoice History', icon: '🕐' },
  { to: '/reports', label: 'Reports', icon: '📈' },
];

export default function Layout() {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">📄</div>
          <div className="logo-text">Easy Billing</div>
        </div>
        <div className="mode-badge">
          <div className="mode-title">👤 Admin Mode</div>
          <div className="mode-subtitle">Full access to all features</div>
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
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
