import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function PerformancePage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ userId: '', period: '', rating: 3, comments: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRecords();
    if (user?.role !== 'employee') {
      api.get('/users?role=employee').then(r => setEmployees(r.data.users)).catch(() => {});
    }
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await api.get('/performance');
      setRecords(res.data.records);
    } catch (e) { toast.error('Error loading performance records'); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/performance', form);
      toast.success('Performance review added');
      setShowModal(false);
      fetchRecords();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const ratingColors = { 1: '#EF4444', 2: '#F97316', 3: '#F59E0B', 4: '#10B981', 5: '#4F46E5' };
  const ratingLabels = { 1: 'Poor', 2: 'Below Average', 3: 'Average', 4: 'Good', 5: 'Excellent' };

  return (
    <div>
      <div className="page-header d-flex align-items-center justify-content-between">
        <div>
          <h1 className="page-title">Performance</h1>
          <p className="page-subtitle">Employee performance reviews</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'hr') && (
          <button className="btn-primary-custom d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
            <i className="bi bi-graph-up-arrow"></i> Add Review
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-4"><div className="spinner-border" style={{ color: 'var(--primary)' }}></div></div>
      ) : records.length === 0 ? (
        <div className="card-custom empty-state"><i className="bi bi-graph-up d-block"></i><h5>No performance reviews yet</h5></div>
      ) : (
        <div className="row g-3">
          {records.map(r => (
            <div key={r._id} className="col-12 col-md-6">
              <div className="card-custom" style={{ padding: 22 }}>
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="avatar-circle">{getInitials(r.user?.name)}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{r.user?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.user?.department} · {r.period}</div>
                  </div>
                  <div className="ms-auto text-center">
                    <div style={{ fontSize: 30, fontWeight: 900, color: ratingColors[r.rating] || '#10B981' }}>{r.rating}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: ratingColors[r.rating], textTransform: 'uppercase', letterSpacing: 0.5 }}>{ratingLabels[r.rating]}</div>
                  </div>
                </div>

                {/* Star Rating */}
                <div className="d-flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map(s => (
                    <i key={s} className={`bi bi-star${s <= r.rating ? '-fill' : ''}`}
                      style={{ color: s <= r.rating ? '#F59E0B' : 'var(--border)', fontSize: 16 }}></i>
                  ))}
                </div>

                {/* Rating Bar */}
                <div className="mb-3">
                  <div className="progress-custom">
                    <div className="progress-fill" style={{ width: `${(r.rating / 5) * 100}%`, background: ratingColors[r.rating] }}></div>
                  </div>
                </div>

                {r.comments && (
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
                    <i className="bi bi-quote me-1" style={{ color: 'var(--primary)' }}></i>{r.comments}
                  </p>
                )}

                <div style={{ marginTop: 12, fontSize: 11, color: 'var(--muted)' }}>
                  Reviewed by <strong>{r.reviewedBy?.name}</strong> · {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal show d-block modal-custom" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ fontWeight: 700 }}><i className="bi bi-graph-up me-2"></i>Add Performance Review</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label-custom">Employee</label>
                      <select className="form-control-custom" value={form.userId} onChange={e => setForm(p => ({ ...p, userId: e.target.value }))} required>
                        <option value="">Select Employee</option>
                        {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label-custom">Review Period</label>
                      <input type="text" className="form-control-custom" placeholder="e.g. Q1 2024" value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value }))} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label-custom">Rating: {form.rating}/5 — {ratingLabels[form.rating]}</label>
                      <div className="d-flex gap-2 mt-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <button key={s} type="button" onClick={() => setForm(p => ({ ...p, rating: s }))}
                            style={{
                              flex: 1, padding: '10px 0', borderRadius: 10, border: '2px solid',
                              borderColor: form.rating >= s ? ratingColors[s] : 'var(--border)',
                              background: form.rating >= s ? `${ratingColors[s]}15` : 'white',
                              cursor: 'pointer', fontWeight: 700, color: form.rating >= s ? ratingColors[s] : 'var(--muted)',
                              transition: 'all 0.15s'
                            }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label-custom">Comments</label>
                      <textarea className="form-control-custom" rows={3} value={form.comments} onChange={e => setForm(p => ({ ...p, comments: e.target.value }))} style={{ resize: 'none' }}></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" style={{ borderRadius: 10 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary-custom d-flex align-items-center gap-2" disabled={saving}>
                    {saving ? 'Saving...' : <><i className="bi bi-check-circle"></i> Save Review</>}
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
