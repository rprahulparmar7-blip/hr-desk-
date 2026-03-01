import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function AttendancePage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    userId: '', date: new Date().toISOString().split('T')[0],
    checkIn: '', checkOut: '', status: 'present', notes: ''
  });
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      const res = await api.get(`/attendance?${params}`);
      setRecords(res.data.records);
      if (user?.role !== 'employee') {
        const emp = await api.get('/users?role=employee');
        setEmployees(emp.data.users);
      }
    } catch (e) { toast.error('Failed to load attendance'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const todayRecord = records.find(r => {
    const d = new Date(r.date);
    const today = new Date();
    return d.toDateString() === today.toDateString() && (user?.role === 'employee' ? r.user?._id === user._id : true);
  });

  const handleMarkAttendance = async () => {
    setMarking(true);
    try {
      await api.post('/attendance', {
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        checkIn: new Date().toISOString()
      });
      toast.success('Attendance marked successfully!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error marking attendance');
    }
    setMarking(false);
  };

  const handleCheckOut = async (id) => {
    try {
      await api.put(`/attendance/${id}`, { checkOut: new Date().toISOString() });
      toast.success('Checkout recorded!');
      fetchData();
    } catch (err) { toast.error('Error checking out'); }
  };

  const handleAddModal = async (e) => {
    e.preventDefault();
    setMarking(true);
    try {
      await api.post('/attendance', form);
      toast.success('Attendance recorded');
      setShowModal(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setMarking(false);
  };

  const statusColors = { present: 'badge-present', absent: 'badge-absent', late: 'badge-late', 'half-day': 'badge-half-day' };
  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div>
      <div className="page-header d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">Track and manage attendance records</p>
        </div>
        {(user?.role === 'hr' || user?.role === 'admin') && (
          <button className="btn-primary-custom d-flex align-items-center gap-2" onClick={() => { setForm({ userId: '', date: new Date().toISOString().split('T')[0], checkIn: '', checkOut: '', status: 'present', notes: '' }); setShowModal(true); }}>
            <i className="bi bi-plus-circle"></i> Add Record
          </button>
        )}
      </div>

      {/* Today's quick actions (Employee & HR) */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div style={{
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            borderRadius: 18, padding: 24, color: 'white',
            animation: 'fadeInUp 0.4s ease'
          }}>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 8 }}>
              <i className="bi bi-calendar3 me-2"></i>Today
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
            {todayRecord ? (
              <div>
                <div style={{ marginBottom: 8, fontSize: 13, opacity: 0.8 }}>
                  ✅ Checked in at {todayRecord.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                </div>
                {!todayRecord.checkOut && user?.role === 'employee' && (
                  <button onClick={() => handleCheckOut(todayRecord._id)}
                    style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, color: 'white', padding: '8px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                    <i className="bi bi-door-open me-1"></i> Check Out
                  </button>
                )}
                {todayRecord.checkOut && (
                  <div style={{ fontSize: 13, opacity: 0.8 }}>🏃 Checked out at {new Date(todayRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                )}
              </div>
            ) : (
              <button onClick={handleMarkAttendance} disabled={marking}
                style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, color: 'white', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>
                {marking ? 'Marking...' : <><i className="bi bi-clock-fill me-2"></i>Mark Attendance</>}
              </button>
            )}
          </div>
        </div>

        {user?.role !== 'employee' && (
          <>
            {[
              { label: 'Present', val: records.filter(r => r.status === 'present').length, color: '#10B981' },
              { label: 'Absent', val: records.filter(r => r.status === 'absent').length, color: '#EF4444' },
              { label: 'Late', val: records.filter(r => r.status === 'late').length, color: '#F59E0B' },
            ].map(s => (
              <div key={s.label} className="col-4 col-md-2">
                <div className="card-custom text-center" style={{ padding: 16 }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Records Table */}
      <div className="card-custom">
        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
          <h5 style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>Attendance Records</h5>
          <div className="d-flex gap-2 flex-wrap">
            <input type="date" className="form-control-custom" style={{ width: 160 }} value={filters.startDate} onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))} />
            <input type="date" className="form-control-custom" style={{ width: 160 }} value={filters.endDate} onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))} />
            <button className="btn-primary-custom" onClick={fetchData} style={{ padding: '9px 18px' }}>
              <i className="bi bi-search"></i>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4"><div className="spinner-border" style={{ color: 'var(--primary)' }}></div></div>
        ) : records.length === 0 ? (
          <div className="empty-state"><i className="bi bi-clock d-block"></i><h5>No attendance records</h5></div>
        ) : (
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  {user?.role !== 'employee' && <th>Employee</th>}
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Hours</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => {
                  const hours = r.checkIn && r.checkOut
                    ? ((new Date(r.checkOut) - new Date(r.checkIn)) / 3600000).toFixed(1)
                    : null;
                  return (
                    <tr key={r._id}>
                      {user?.role !== 'employee' && (
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="avatar-circle sm">{getInitials(r.user?.name || 'U')}</div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{r.user?.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{r.user?.department}</div>
                            </div>
                          </div>
                        </td>
                      )}
                      <td style={{ fontSize: 13 }}>{new Date(r.date).toLocaleDateString()}</td>
                      <td style={{ fontSize: 13 }}>{r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                      <td style={{ fontSize: 13 }}>
                        {r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (
                          user?.role === 'employee' && r.user?._id === user._id && !r.checkOut ? (
                            <button onClick={() => handleCheckOut(r._id)} style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: 8, padding: '3px 10px', cursor: 'pointer', fontSize: 12 }}>
                              Check Out
                            </button>
                          ) : '—'
                        )}
                      </td>
                      <td style={{ fontSize: 13, fontWeight: 600 }}>{hours ? `${hours}h` : '—'}</td>
                      <td><span className={`badge-custom ${statusColors[r.status] || ''}`}>{r.status}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--muted)' }}>{r.notes || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Record Modal (HR/Admin) */}
      {showModal && (
        <div className="modal show d-block modal-custom" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ fontWeight: 700 }}><i className="bi bi-clock-fill me-2"></i>Add Attendance Record</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAddModal}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label-custom">Employee</label>
                      <select className="form-control-custom" value={form.userId} onChange={e => setForm(p => ({ ...p, userId: e.target.value }))} required>
                        <option value="">Select Employee</option>
                        {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label-custom">Date</label>
                      <input type="date" className="form-control-custom" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label-custom">Status</label>
                      <select className="form-control-custom" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                        {['present', 'absent', 'late', 'half-day'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label-custom">Check In Time</label>
                      <input type="time" className="form-control-custom" value={form.checkIn} onChange={e => setForm(p => ({ ...p, checkIn: e.target.value }))} />
                    </div>
                    <div className="col-6">
                      <label className="form-label-custom">Check Out Time</label>
                      <input type="time" className="form-control-custom" value={form.checkOut} onChange={e => setForm(p => ({ ...p, checkOut: e.target.value }))} />
                    </div>
                    <div className="col-12">
                      <label className="form-label-custom">Notes</label>
                      <input type="text" className="form-control-custom" placeholder="Optional notes..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" style={{ borderRadius: 10 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary-custom" disabled={marking}>
                    {marking ? 'Saving...' : 'Add Record'}
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
