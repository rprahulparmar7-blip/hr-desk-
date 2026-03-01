import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const emptyForm = { name: '', email: '', password: '', phone: '', department: 'Human Resources', position: 'HR Manager', address: '' };

export default function HRList() {
  const [hrUsers, setHRUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchHR = async () => {
    try {
      const res = await api.get('/users?role=hr');
      setHRUsers(res.data.users);
    } catch (e) { toast.error('Failed to load HR users'); }
    setLoading(false);
  };

  useEffect(() => { fetchHR(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (hr) => {
    setEditing(hr._id);
    setForm({ name: hr.name, email: hr.email, password: '', phone: hr.phone || '', department: hr.department || '', position: hr.position || '', address: hr.address || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/users/${editing}`, form);
        toast.success('HR updated successfully');
      } else {
        await api.post('/users', { ...form, role: 'hr' });
        toast.success('HR user created');
      }
      setShowModal(false);
      fetchHR();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name} from HR?`)) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('HR user removed');
      fetchHR();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'H';
  const filtered = hrUsers.filter(h => h.name.toLowerCase().includes(search.toLowerCase()) || h.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header d-flex align-items-center justify-content-between">
        <div>
          <h1 className="page-title">HR Management</h1>
          <p className="page-subtitle">{hrUsers.length} HR team members</p>
        </div>
        <button className="btn-primary-custom d-flex align-items-center gap-2" onClick={openAdd}>
          <i className="bi bi-person-badge-fill"></i> Add HR User
        </button>
      </div>

      <div className="card-custom">
        <div className="row g-2 mb-4">
          <div className="col-md-6">
            <div className="search-bar">
              <i className="bi bi-search"></i>
              <input className="form-control-custom" placeholder="Search HR team..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4"><div className="spinner-border" style={{ color: 'var(--primary)' }}></div></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><i className="bi bi-person-badge d-block"></i><h5>No HR users found</h5></div>
        ) : (
          <div className="row g-3">
            {filtered.map(hr => (
              <div key={hr._id} className="col-12 col-md-6 col-lg-4">
                <div style={{
                  background: 'var(--lighter)', borderRadius: 16, border: '1.5px solid var(--border)',
                  padding: 20, transition: 'all 0.2s', animation: 'fadeInUp 0.3s ease'
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="avatar-circle" style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)', color: 'white', fontSize: 18, width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      {getInitials(hr.name)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{hr.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{hr.email}</div>
                    </div>
                  </div>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span style={{ background: 'rgba(6,182,212,0.1)', color: '#0891B2', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                      <i className="bi bi-building me-1"></i>{hr.department || 'HR'}
                    </span>
                    <span style={{ background: 'rgba(79,70,229,0.1)', color: 'var(--primary)', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                      {hr.position || 'HR Manager'}
                    </span>
                    <span className={`badge-custom ${hr.isActive ? 'badge-approved' : 'badge-rejected'}`}>
                      {hr.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {hr.phone && (
                    <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
                      <i className="bi bi-phone me-1"></i>{hr.phone}
                    </div>
                  )}
                  <div className="d-flex gap-2">
                    <button onClick={() => openEdit(hr)} className="btn-primary-custom flex-1 d-flex align-items-center justify-content-center gap-1" style={{ flex: 1, padding: '8px' }}>
                      <i className="bi bi-pencil"></i> Edit
                    </button>
                    <button onClick={() => handleDelete(hr._id, hr.name)} className="btn-icon danger" style={{ width: 36, height: 36 }}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal show d-block modal-custom" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ fontWeight: 700 }}>
                  <i className="bi bi-person-badge-fill me-2" style={{ color: 'var(--secondary)' }}></i>
                  {editing ? 'Edit HR User' : 'Add HR User'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row g-3">
                    {[
                      { key: 'name', label: 'Full Name', type: 'text', required: true, icon: 'bi-person', col: 6 },
                      { key: 'email', label: 'Email', type: 'email', required: true, icon: 'bi-envelope', col: 6 },
                      { key: 'password', label: editing ? 'New Password (optional)' : 'Password', type: 'password', required: !editing, icon: 'bi-lock', col: 6 },
                      { key: 'phone', label: 'Phone', type: 'text', icon: 'bi-phone', col: 6 },
                      { key: 'department', label: 'Department', type: 'text', icon: 'bi-building', col: 6 },
                      { key: 'position', label: 'Position', type: 'text', icon: 'bi-briefcase', col: 6 },
                    ].map(f => (
                      <div key={f.key} className={`col-${f.col}`}>
                        <label className="form-label-custom">{f.label}</label>
                        <div style={{ position: 'relative' }}>
                          <i className={`bi ${f.icon}`} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}></i>
                          <input type={f.type} className="form-control-custom" style={{ paddingLeft: 36 }}
                            value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required={f.required} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" style={{ borderRadius: 10 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary-custom d-flex align-items-center gap-2" disabled={saving}>
                    {saving ? <><div className="spinner-border spinner-border-sm text-white"></div> Saving...</> : <><i className="bi bi-check-circle"></i> {editing ? 'Update' : 'Add HR'}</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
