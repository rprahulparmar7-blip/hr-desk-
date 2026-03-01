import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const emptyForm = { type: 'sick', startDate: '', endDate: '', reason: '', userId: '' };

export default function LeavesPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [statusForm, setStatusForm] = useState({ status: 'approved', comments: '' });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');
  const [employees, setEmployees] = useState([]);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await api.get(`/leaves${params}`);
      setLeaves(res.data.leaves);
    } catch (e) { toast.error('Failed to load leaves'); }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaves();
    if (user?.role !== 'employee') {
      api.get('/users?role=employee').then(r => setEmployees(r.data.users)).catch(() => {});
    }
  }, [filter]);

  const handleApply = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (user?.role === 'employee') delete payload.userId;
      await api.post('/leaves', payload);
      toast.success('Leave applied successfully!');
      setShowModal(false);
      setForm(emptyForm);
      fetchLeaves();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const handleStatusUpdate = async () => {
    setSaving(true);
    try {
      await api.put(`/leaves/${showStatusModal._id}/status`, statusForm);
      toast.success(`Leave ${statusForm.status}`);
      setShowStatusModal(null);
      fetchLeaves();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this leave request?')) return;
    try {
      await api.delete(`/leaves/${id}`);
      toast.success('Leave request cancelled');
      fetchLeaves();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const getDays = (start, end) => {
    if (!start || !end) return 0;
    return Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const typeColors = { sick: '#EF4444', casual: '#F59E0B', annual: '#4F46E5', maternity: '#EC4899', other: '#6B7280' };
  const typeIcons = { sick: 'bi-hospital', casual: 'bi-sun', annual: 'bi-palm', maternity: 'bi-heart', other: 'bi-three-dots' };

  return (
    <div>
      <div className="page-header d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h1 className="page-title">Leave Management</h1>
          <p className="page-subtitle">{leaves.length} total records</p>
        </div>
        <button className="btn-primary-custom d-flex align-items-center gap-2" onClick={() => { setForm(emptyForm); setShowModal(true); }}>
          <i className="bi bi-calendar-plus"></i> Apply Leave
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: '7px 18px', borderRadius: 20, border: '1.5px solid',
              borderColor: filter === f ? 'var(--primary)' : 'var(--border)',
              background: filter === f ? 'var(--primary)' : 'white',
              color: filter === f ? 'white' : 'var(--muted)',
              fontWeight: 600, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize',
              transition: 'all 0.2s'
            }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span style={{ marginLeft: 6, background: filter === f ? 'rgba(255,255,255,0.25)' : 'var(--light)', borderRadius: 10, padding: '1px 8px', fontSize: 11 }}>
              {f === 'all' ? leaves.length : leaves.filter(l => l.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Leave Cards */}
      {loading ? (
        <div className="text-center py-4"><div className="spinner-border" style={{ color: 'var(--primary)' }}></div></div>
      ) : leaves.length === 0 ? (
        <div className="card-custom empty-state"><i className="bi bi-calendar2-x d-block"></i><h5>No leave requests</h5></div>
      ) : (
        <div className="row g-3">
          {leaves.map(leave => (
            <div key={leave._id} className="col-12 col-md-6 col-lg-4">
              <div className="card-custom" style={{ padding: 20 }}>
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div style={{
                      width: 44, height: 44, borderRadius: 14,
                      background: `${typeColors[leave.type]}15`,
                      color: typeColors[leave.type],
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
                    }}>
                      <i className={`bi ${typeIcons[leave.type] || 'bi-calendar'}`}></i>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, textTransform: 'capitalize' }}>{leave.type} Leave</div>
                      {user?.role !== 'employee' && (
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{leave.user?.name}</div>
                      )}
                    </div>
                  </div>
                  <span className={`badge-custom badge-${leave.status}`}>{leave.status}</span>
                </div>

                <div style={{ background: 'var(--lighter)', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>FROM</div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <div style={{ fontSize: 10, color: 'var(--muted)' }}>{leave.days} days</div>
                      <div style={{ height: 1, width: 40, background: 'var(--border)' }}></div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>TO</div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.5 }}>{leave.reason}</p>
                {leave.comments && <p style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 12 }}>💬 {leave.comments}</p>}

                <div className="d-flex gap-2">
                  {(user?.role === 'admin' || user?.role === 'hr') && leave.status === 'pending' && (
                    <button className="btn-primary-custom flex-1" style={{ padding: '8px', fontSize: 13 }}
                      onClick={() => { setShowStatusModal(leave); setStatusForm({ status: 'approved', comments: '' }); }}>
                      <i className="bi bi-check-circle me-1"></i>Review
                    </button>
                  )}
                  {user?.role === 'employee' && leave.status === 'pending' && (
                    <button onClick={() => handleCancel(leave._id)}
                      style={{ flex: 1, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: 'var(--danger)', padding: '8px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                      <i className="bi bi-x-circle me-1"></i>Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      {showModal && (
        <div className="modal show d-block modal-custom" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ fontWeight: 700 }}><i className="bi bi-calendar-plus me-2"></i>Apply Leave</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleApply}>
                <div className="modal-body">
                  <div className="row g-3">
                    {(user?.role === 'hr' || user?.role === 'admin') && (
                      <div className="col-12">
                        <label className="form-label-custom">Employee (leave blank for yourself)</label>
                        <select className="form-control-custom" value={form.userId} onChange={e => setForm(p => ({ ...p, userId: e.target.value }))}>
                          <option value="">— Myself —</option>
                          {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                        </select>
                      </div>
                    )}
                    <div className="col-12">
                      <label className="form-label-custom">Leave Type</label>
                      <select className="form-control-custom" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                        {['sick', 'casual', 'annual', 'maternity', 'other'].map(t => (
                          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)} Leave</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label-custom">Start Date</label>
                      <input type="date" className="form-control-custom" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label-custom">End Date</label>
                      <input type="date" className="form-control-custom" value={form.endDate} min={form.startDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} required />
                    </div>
                    {form.startDate && form.endDate && (
                      <div className="col-12">
                        <div style={{ background: 'rgba(79,70,229,0.08)', borderRadius: 10, padding: '10px 16px', fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>
                          📅 {getDays(form.startDate, form.endDate)} day(s) requested
                        </div>
                      </div>
                    )}
                    <div className="col-12">
                      <label className="form-label-custom">Reason</label>
                      <textarea className="form-control-custom" rows={3} value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} required style={{ resize: 'none' }}></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" style={{ borderRadius: 10 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary-custom d-flex align-items-center gap-2" disabled={saving}>
                    {saving ? 'Submitting...' : <><i className="bi bi-send"></i> Submit Request</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal (HR/Admin) */}
      {showStatusModal && (
        <div className="modal show d-block modal-custom" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ fontWeight: 700 }}>Review Leave Request</h5>
                <button className="btn-close" onClick={() => setShowStatusModal(null)}></button>
              </div>
              <div className="modal-body">
                <div style={{ background: 'var(--lighter)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontWeight: 700 }}>{showStatusModal.user?.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                    {showStatusModal.type} leave · {showStatusModal.days} days ·
                    {new Date(showStatusModal.startDate).toLocaleDateString()} – {new Date(showStatusModal.endDate).toLocaleDateString()}
                  </div>
                  <p style={{ marginTop: 8, fontSize: 14 }}>{showStatusModal.reason}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label-custom">Decision</label>
                  <div className="d-flex gap-2">
                    {['approved', 'rejected'].map(s => (
                      <button key={s} type="button"
                        onClick={() => setStatusForm(p => ({ ...p, status: s }))}
                        style={{
                          flex: 1, padding: '10px', borderRadius: 10, border: '2px solid',
                          borderColor: statusForm.status === s ? (s === 'approved' ? 'var(--success)' : 'var(--danger)') : 'var(--border)',
                          background: statusForm.status === s ? (s === 'approved' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)') : 'white',
                          color: statusForm.status === s ? (s === 'approved' ? 'var(--success)' : 'var(--danger)') : 'var(--muted)',
                          cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize', transition: 'all 0.2s'
                        }}>
                        <i className={`bi ${s === 'approved' ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>{s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="form-label-custom">Comments (optional)</label>
                  <textarea className="form-control-custom" rows={2} value={statusForm.comments} onChange={e => setStatusForm(p => ({ ...p, comments: e.target.value }))} style={{ resize: 'none' }}></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" style={{ borderRadius: 10 }} onClick={() => setShowStatusModal(null)}>Cancel</button>
                <button className="btn-primary-custom d-flex align-items-center gap-2" onClick={handleStatusUpdate} disabled={saving}>
                  {saving ? 'Saving...' : <><i className="bi bi-check-lg"></i> Confirm Decision</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
