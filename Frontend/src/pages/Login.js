import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: 'admin@hrdesk.com', password: 'Admin@1234' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoLogins = [
    { label: 'Admin', email: 'admin@hrdesk.com', password: 'Admin@1234', color: '#4F46E5' },
    { label: 'HR', email: 'hr@hrdesk.com', password: 'Hr@1234', color: '#06B6D4' },
    { label: 'Employee', email: 'john@hrdesk.com', password: 'Emp@1234', color: '#10B981' },
  ];

  return (
    <div className="login-page align-items-center justify-content-center">
      <div className="login-bg-shapes"><span /><span /><span /></div>

      <div className="login-card">
        <div className="login-logo">
          <i className="bi bi-building-fill-check"></i>
        </div>

        <h2 className="text-center mb-1" style={{ fontSize: 26, fontWeight: 800 }}>HR Desk Pro</h2>
        <p className="text-center text-muted mb-4" style={{ fontSize: 14 }}>Sign in to your workspace</p>

        {/* Demo Login Chips */}
        <div className="mb-4">
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#94A3B8', marginBottom: 8 }}>Quick Demo</p>
          <div className="d-flex gap-2 flex-wrap">
            {demoLogins.map(d => (
              <button
                key={d.label}
                type="button"
                onClick={() => setForm({ email: d.email, password: d.password })}
                style={{
                  padding: '5px 14px', borderRadius: 20, border: `1.5px solid ${d.color}22`,
                  background: `${d.color}11`, color: d.color, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label-custom">Email Address</label>
            <div style={{ position: 'relative' }}>
              <i className="bi bi-envelope" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}></i>
              <input
                type="email"
                className="form-control-custom"
                style={{ paddingLeft: 40 }}
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@company.com"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label-custom">Password</label>
            <div style={{ position: 'relative' }}>
              <i className="bi bi-lock" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}></i>
              <input
                type={showPass ? 'text' : 'password'}
                className="form-control-custom"
                style={{ paddingLeft: 40, paddingRight: 44 }}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary-custom w-100 d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
            style={{ height: 46, fontSize: 15 }}
          >
            {loading ? (
              <><div className="spinner-border spinner-border-sm text-white" /><span>Signing in...</span></>
            ) : (
              <><i className="bi bi-shield-check"></i><span>Sign In</span></>
            )}
          </button>
        </form>

        <p className="text-center mt-4" style={{ fontSize: 12, color: '#CBD5E1' }}>
          © 2024 HR Desk Pro. All rights reserved.
        </p>
      </div>
    </div>
  );
}
