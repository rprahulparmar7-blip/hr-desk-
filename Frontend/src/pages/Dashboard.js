import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function StatCard({ icon, value, label, color, delay = 0 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const target = parseInt(value) || 0;
    const step = Math.ceil(target / 30);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(current);
      if (current >= target) clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className={`stat-card ${color}`} style={{ animationDelay: `${delay}s` }}>
      <div className={`stat-icon ${color}`}><i className={icon}></i></div>
      <div className="stat-value">{count}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalEmployees: 0, totalHR: 0, totalAdmin: 0 });
  const [attendance, setAttendance] = useState({ present: 0, absent: 0, late: 0 });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const promises = [api.get('/leaves?status=pending')];
        if (user?.role !== 'employee') {
          promises.push(api.get('/users/stats/summary'));
          promises.push(api.get('/attendance/today/summary'));
        }
        const results = await Promise.allSettled(promises);
        if (results[0].status === 'fulfilled') setRecentLeaves(results[0].value.data.leaves?.slice(0, 5) || []);
        if (results[1]?.status === 'fulfilled') setStats(results[1].value.data.stats || {});
        if (results[2]?.status === 'fulfilled') setAttendance(results[2].value.data.summary || {});
      } catch (e) { /* silent */ }
      setLoading(false);
    };
    load();
  }, [user]);

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const roleColors = { admin: '#4F46E5', hr: '#06B6D4', employee: '#10B981' };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
        <p className="page-subtitle">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4F46E5, #7C3AED, #06B6D4)',
        borderRadius: 20, padding: '28px 32px', marginBottom: 28,
        position: 'relative', overflow: 'hidden',
        animation: 'fadeInUp 0.4s ease'
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', right: 80, bottom: -60, width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
        <div className="d-flex align-items-center gap-4" style={{ position: 'relative' }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: 'white' }}>
            {getInitials(user?.name)}
          </div>
          <div>
            <h2 style={{ color: 'white', fontWeight: 800, marginBottom: 4, fontSize: 22 }}>
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}! 👋
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0, fontSize: 14 }}>
              {user?.position || user?.role} — {user?.department || 'HR Desk Pro'}
            </p>
          </div>
          <div className="ms-auto d-none d-md-flex gap-2">
            {user?.role !== 'admin' && (
              <>
                <button onClick={() => navigate('/attendance')} className="btn btn-light btn-sm d-flex align-items-center gap-1" style={{ borderRadius: 10, fontWeight: 600, fontSize: 13 }}>
                  <i className="bi bi-clock"></i> Mark Attendance
                </button>
                <button onClick={() => navigate('/leaves')} className="btn btn-light btn-sm d-flex align-items-center gap-1" style={{ borderRadius: 10, fontWeight: 600, fontSize: 13 }}>
                  <i className="bi bi-calendar2-x"></i> Apply Leave
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      {user?.role !== 'employee' && (
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <StatCard icon="bi-people-fill" value={stats.totalEmployees} label="Total Employees" color="blue" delay={0.05} />
          </div>
          <div className="col-6 col-md-3">
            <StatCard icon="bi-person-badge-fill" value={stats.totalHR} label="HR Team" color="cyan" delay={0.1} />
          </div>
          <div className="col-6 col-md-3">
            <StatCard icon="bi-check-circle-fill" value={attendance.present} label="Present Today" color="green" delay={0.15} />
          </div>
          <div className="col-6 col-md-3">
            <StatCard icon="bi-clock-history" value={attendance.late} label="Late Today" color="amber" delay={0.2} />
          </div>
        </div>
      )}

      <div className="row g-3">
        {/* Pending Leaves */}
        <div className="col-12 col-lg-8">
          <div className="card-custom">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>
                <i className="bi bi-calendar2-x-fill me-2" style={{ color: 'var(--primary)' }}></i>
                {user?.role === 'employee' ? 'My Recent Leaves' : 'Pending Leave Requests'}
              </h5>
              <button onClick={() => navigate('/leaves')} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                View All →
              </button>
            </div>

            {loading ? (
              <div>{[1, 2, 3].map(i => (
                <div key={i} className="d-flex align-items-center gap-3 mb-3">
                  <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }}></div>
                  <div style={{ flex: 1 }}>
                    <div className="skeleton mb-1" style={{ height: 14, width: '60%' }}></div>
                    <div className="skeleton" style={{ height: 12, width: '40%' }}></div>
                  </div>
                </div>
              ))}</div>
            ) : recentLeaves.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-calendar-check d-block"></i>
                <h5>No pending leaves</h5>
                <p className="small">All leave requests are up to date.</p>
              </div>
            ) : (
              <div>
                {recentLeaves.map((leave, i) => (
                  <div key={leave._id} className="d-flex align-items-center gap-3 py-2" style={{ borderBottom: i < recentLeaves.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div className="avatar-circle sm">{getInitials(leave.user?.name || 'U')}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{leave.user?.name || 'Unknown'}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {leave.type} · {leave.days} days · {new Date(leave.startDate).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`badge-custom badge-${leave.status}`}>{leave.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats side */}
        <div className="col-12 col-lg-4">
          <div className="card-custom h-100">
            <h5 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>
              <i className="bi bi-lightning-charge-fill me-2" style={{ color: 'var(--accent)' }}></i>
              Quick Actions
            </h5>
            {[
              { label: 'My Profile', icon: 'bi-person-circle', path: '/profile', color: '#4F46E5' },
              { label: 'Attendance', icon: 'bi-clock', path: '/attendance', color: '#06B6D4' },
              { label: 'Apply Leave', icon: 'bi-calendar-plus', path: '/leaves', color: '#10B981' },
              { label: 'Calendar', icon: 'bi-calendar3', path: '/calendar', color: '#F59E0B' },
            ].map(action => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="w-100 d-flex align-items-center gap-3 mb-2"
                style={{
                  background: `${action.color}0D`, border: `1.5px solid ${action.color}22`,
                  borderRadius: 12, padding: '12px 16px', cursor: 'pointer',
                  transition: 'all 0.2s', textAlign: 'left'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${action.color}1A`; e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${action.color}0D`; e.currentTarget.style.transform = 'translateX(0)'; }}
              >
                <i className={`bi ${action.icon}`} style={{ color: action.color, fontSize: 18 }}></i>
                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--dark)' }}>{action.label}</span>
                <i className="bi bi-chevron-right ms-auto" style={{ color: 'var(--muted)', fontSize: 12 }}></i>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
