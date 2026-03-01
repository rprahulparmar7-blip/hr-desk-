import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', icon: 'bi-grid-1x2-fill', label: 'Dashboard', roles: ['admin', 'hr', 'employee'] },
  { label: 'People', type: 'section', roles: ['admin', 'hr'] },
  { path: '/employees', icon: 'bi-people-fill', label: 'Employees', roles: ['admin', 'hr'] },
  { path: '/hr-management', icon: 'bi-person-badge-fill', label: 'HR Management', roles: ['admin'] },
  { label: 'Work', type: 'section', roles: ['admin', 'hr', 'employee'] },
  { path: '/attendance', icon: 'bi-clock-fill', label: 'Attendance', roles: ['admin', 'hr', 'employee'] },
  { path: '/leaves', icon: 'bi-calendar2-x-fill', label: 'Leaves', roles: ['admin', 'hr', 'employee'] },
  { path: '/calendar', icon: 'bi-calendar3', label: 'Calendar', roles: ['admin', 'hr', 'employee'] },
  { label: 'Insights', type: 'section', roles: ['admin', 'hr'] },
  { path: '/performance', icon: 'bi-graph-up-arrow', label: 'Performance', roles: ['admin', 'hr', 'employee'] },
  { path: '/reports', icon: 'bi-file-earmark-bar-graph-fill', label: 'Reports', roles: ['admin', 'hr'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand d-flex align-items-center gap-3">
          <div className="brand-logo"><i className="bi bi-building-fill-check"></i></div>
          <div>
            <div className="brand-text">HR Desk</div>
            <div className="brand-subtitle">Pro Suite</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, idx) => {
            if (!item.roles.includes(user?.role)) return null;
            if (item.type === 'section') {
              return <div key={idx} className="nav-section-label">{item.label}</div>;
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <i className={`bi ${item.icon}`}></i>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info-sidebar" onClick={() => navigate('/profile')}>
            <div className="avatar-circle sm">{getInitials(user?.name)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 600, truncate: true, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
            <i className="bi bi-chevron-right" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}></i>
          </div>
          <button
            onClick={logout}
            className="w-100 mt-2 d-flex align-items-center gap-2"
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,100,100,0.7)', padding: '8px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,100,100,0.7)'}
          >
            <i className="bi bi-box-arrow-left"></i> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-layout">
        <header className="topbar">
          <div className="d-flex align-items-center gap-3">
            <button
              className="d-md-none btn-icon"
              style={{ border: 'none', background: 'transparent' }}
              onClick={() => setSidebarOpen(true)}
            >
              <i className="bi bi-list" style={{ fontSize: 22 }}></i>
            </button>
            <div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>Welcome back,</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{user?.name} 👋</div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
            <span className={`badge-custom badge-${user?.role}`} style={{ padding: '5px 12px', borderRadius: 20 }}>
              {user?.role?.toUpperCase()}
            </span>
            <div
              className="avatar-circle sm"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/profile')}
              title="Profile"
            >
              {getInitials(user?.name)}
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
