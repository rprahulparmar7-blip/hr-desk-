import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const emptyForm = { name: '', email: '', password: '', phone: '', department: '', position: '', address: '' };

export default function EmployeeList() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/users?role=employee');
      setEmployees(res.data.users);
    } catch (e) { toast.error('Failed to load employees'); }
    setLoading(false);
  };

  useEffect(() => { fetchEmployees(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (emp) => { setEditing(emp._id); setForm({ name: emp.name, email: emp.email, password: '', phone: emp.phone || '', department: emp.department || '', position: emp.position || '', address: emp.address || '' }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/users/${editing}`, form);
        toast.success('Employee updated');
      } else {
        await api.post('/users', { ...form, role: 'employee' });
        toast.success('Employee added');
      }
      setShowModal(false);
      fetchEmployees();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('Employee removed');
      fetchEmployees();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const toggleStatus = async (id, isActive) => {
    try {
      await api.put(`/users/${id}`, { isActive: !isActive });
      toast.success(isActive ? 'Employee deactivated' : 'Employee activated');
      fetchEmployees();
    } catch (err) { toast.error('Error updating status'); }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'E';

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    (e.department || '').toLowerCase().includes(search.toLowerCase())
  );

  const depts = [...new Set(employees.map(e => e.department).filter(Boolean))];

  return (
    <div>
      <div className="page-header d-flex align-items-center justify-content-between">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">{employees.length} total employees</p>
        </div>
        <button className="btn-primary-custom d-flex align-items-center gap-2" onClick={openAdd}>
          <i className="bi bi-person-plus-fill"></i> Add Employee
        </button>
      </div>

      <div className="card-custom">
        {/* Filters */}
        <div className="row g-2 mb-4">
          <div className="col-12 col-md-6">
            <div className="search-bar">
              <i className="bi bi-search"></i>
              <input className="form-control-custom" placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="col-12 col-md-3">
            <select className="form-control-custom" onChange={e => setSearch(e.target.value)} defaultValue="">
              <option value="">All Departments</option>
              {depts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="col-12 col-md-3 d-flex justify-content-end">
            <span style={{ background: 'var(--light)', borderRadius: 8, padding: '8px 14px', fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
              <i className="bi bi-people me-2"></i>{filtered.length} shown
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4"><div className="spinner-border" style={{ color: 'var(--primary)' }}></div></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><i className="bi bi-people d-block"></i><h5>No employees found</h5></div>
        ) : (
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(emp => (
                  <tr key={emp._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="avatar-circle sm">{getInitials(emp.name)}</div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{emp.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontSize: 13 }}>{emp.department || '—'}</span></td>
                    <td><span style={{ fontSize: 13 }}>{emp.position || '—'}</span></td>
                    <td><span style={{ fontSize: 13 }}>{emp.phone || '—'}</span></td>
                    <td>
                      <span className={`badge-custom ${emp.isActive ? 'badge-present' : 'badge-absent'}`}>
                        {emp.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--muted)' }}>{new Date(emp.joinDate || emp.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="btn-icon primary" title="Edit" onClick={() => openEdit(emp)}><i className="bi bi-pencil"></i></button>
                        {user?.role === 'admin' && (
                          <>
                            <button className="btn-icon" title={emp.isActive ? 'Deactivate' : 'Activate'} onClick={() => toggleStatus(emp._id, emp.isActive)}>
                              <i className={`bi ${emp.isActive ? 'bi-toggle-on' : 'bi-toggle-off'}`}></i>
                            </button>
                            <button className="btn-icon danger" title="Delete" onClick={() => handleDelete(emp._id, emp.name)}><i className="bi bi-trash"></i></button>
                          </>
                        )}
                        {user?.role === 'hr' && (
                          <button className="btn-icon danger" title="Delete" onClick={() => handleDelete(emp._id, emp.name)}><i className="bi bi-trash"></i></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block modal-custom" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ fontWeight: 700 }}>
                  {editing ? <><i className="bi bi-pencil-square me-2"></i>Edit Employee</> : <><i className="bi bi-person-plus-fill me-2"></i>Add New Employee</>}
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
                      { key: 'address', label: 'Address', type: 'text', icon: 'bi-geo-alt', col: 12 },
                    ].map(f => (
                      <div key={f.key} className={`col-${f.col}`}>
                        <label className="form-label-custom">{f.label}</label>
                        <div style={{ position: 'relative' }}>
                          <i className={`bi ${f.icon}`} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}></i>
                          <input
                            type={f.type}
                            className="form-control-custom"
                            style={{ paddingLeft: 36 }}
                            value={form[f.key]}
                            onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                            required={f.required}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" style={{ borderRadius: 10 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary-custom d-flex align-items-center gap-2" disabled={saving}>
                    {saving ? <><div className="spinner-border spinner-border-sm text-white"></div> Saving...</> : <><i className="bi bi-check-circle"></i> {editing ? 'Update' : 'Add Employee'}</>}
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
