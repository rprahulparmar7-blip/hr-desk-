import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '', phone: user?.phone || '',
    department: user?.department || '', position: user?.position || '',
    address: user?.address || ''
  });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', profileForm);
      updateUser(res.data.user);
      toast.success('Profile updated successfully!');
    } catch (err) { toast.error(err.response?.data?.message || 'Error updating profile'); }
    setSavingProfile(false);
  };

  const handlePassChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (passForm.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setSavingPass(true);
    try {
      await api.put('/auth/change-password', { currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password changed successfully!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Error changing password'); }
    setSavingPass(false);
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const roleColors = { admin: '#4F46E5', hr: '#06B6D4', employee: '#10B981' };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account settings</p>
      </div>

      <div className="row g-3">
        {/* Profile Card */}
        <div className="col-12 col-md-4">
          <div className="card-custom text-center" style={{ padding: 32 }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
              <div className="avatar-circle xl mx-auto" style={{ background: `linear-gradient(135deg, ${roleColors[user?.role]}, ${roleColors[user?.role]}AA)` }}>
                {getInitials(user?.name)}
              </div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderRadius: '50%', background: '#10B981', border: '3px solid white' }}></div>
            </div>

            <h4 style={{ fontWeight: 800, marginBottom: 4 }}>{user?.name}</h4>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}>{user?.email}</p>
            <span className={`badge-custom badge-${user?.role}`} style={{ padding: '6px 16px', borderRadius: 20, textTransform: 'capitalize', fontSize: 12 }}>
              {user?.role}
            </span>

            <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
              {[
                { icon: 'bi-building', label: 'Department', value: user?.department || 'Not set' },
                { icon: 'bi-briefcase', label: 'Position', value: user?.position || 'Not set' },
                { icon: 'bi-phone', label: 'Phone', value: user?.phone || 'Not set' },
                { icon: 'bi-calendar-check', label: 'Joined', value: user?.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A' },
              ].map(info => (
                <div key={info.label} className="d-flex align-items-center gap-3 mb-3 text-start">
                  <div style={{ width: 32, height: 32, background: 'var(--light)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                    <i className={`bi ${info.icon}`}></i>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)' }}>{info.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{info.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="col-12 col-md-8">
          {/* Tab Buttons */}
          <div className="d-flex gap-2 mb-3">
            {[
              { id: 'profile', label: 'Edit Profile', icon: 'bi-person-fill' },
              { id: 'password', label: 'Change Password', icon: 'bi-lock-fill' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '9px 20px', borderRadius: 12, border: '1.5px solid',
                  borderColor: activeTab === tab.id ? 'var(--primary)' : 'var(--border)',
                  background: activeTab === tab.id ? 'var(--primary)' : 'white',
                  color: activeTab === tab.id ? 'white' : 'var(--muted)',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                <i className={`bi ${tab.icon}`}></i>{tab.label}
              </button>
            ))}
          </div>

          {/* Edit Profile */}
          {activeTab === 'profile' && (
            <div className="card-custom">
              <h5 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>
                <i className="bi bi-person-gear me-2" style={{ color: 'var(--primary)' }}></i>Personal Information
              </h5>
              <form onSubmit={handleProfileSave}>
                <div className="row g-3">
                  {[
                    { key: 'name', label: 'Full Name', type: 'text', icon: 'bi-person', col: 6 },
                    { key: 'phone', label: 'Phone Number', type: 'text', icon: 'bi-phone', col: 6 },
                    { key: 'department', label: 'Department', type: 'text', icon: 'bi-building', col: 6 },
                    { key: 'position', label: 'Position/Title', type: 'text', icon: 'bi-briefcase', col: 6 },
                    { key: 'address', label: 'Address', type: 'text', icon: 'bi-geo-alt', col: 12 },
                  ].map(f => (
                    <div key={f.key} className={`col-${f.col}`}>
                      <label className="form-label-custom">{f.label}</label>
                      <div style={{ position: 'relative' }}>
                        <i className={`bi ${f.icon}`} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}></i>
                        <input type={f.type} className="form-control-custom" style={{ paddingLeft: 36 }}
                          value={profileForm[f.key]} onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <button type="submit" className="btn-primary-custom d-flex align-items-center gap-2" disabled={savingProfile}>
                    {savingProfile ? <><div className="spinner-border spinner-border-sm text-white"></div>Saving...</> : <><i className="bi bi-check-circle"></i> Save Changes</>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Change Password */}
          {activeTab === 'password' && (
            <div className="card-custom">
              <h5 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>
                <i className="bi bi-shield-lock me-2" style={{ color: 'var(--primary)' }}></i>Change Password
              </h5>
              <form onSubmit={handlePassChange}>
                <div className="row g-3">
                  {[
                    { key: 'currentPassword', label: 'Current Password' },
                    { key: 'newPassword', label: 'New Password' },
                    { key: 'confirmPassword', label: 'Confirm New Password' },
                  ].map(f => (
                    <div key={f.key} className="col-12">
                      <label className="form-label-custom">{f.label}</label>
                      <div style={{ position: 'relative' }}>
                        <i className="bi bi-lock" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}></i>
                        <input type="password" className="form-control-custom" style={{ paddingLeft: 36 }}
                          value={passForm[f.key]} onChange={e => setPassForm(p => ({ ...p, [f.key]: e.target.value }))} required />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'rgba(79,70,229,0.05)', border: '1px solid rgba(79,70,229,0.15)', borderRadius: 12, padding: '12px 16px', marginTop: 16, fontSize: 13, color: 'var(--muted)' }}>
                  <i className="bi bi-info-circle me-2" style={{ color: 'var(--primary)' }}></i>
                  Password must be at least 6 characters long.
                </div>

                <div className="mt-4">
                  <button type="submit" className="btn-primary-custom d-flex align-items-center gap-2" disabled={savingPass}>
                    {savingPass ? <><div className="spinner-border spinner-border-sm text-white"></div>Updating...</> : <><i className="bi bi-shield-check"></i> Update Password</>}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
