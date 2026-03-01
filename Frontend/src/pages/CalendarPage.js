import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const typeColors = {
  meeting: { bg: '#EDE9FE', text: '#7C3AED', border: '#DDD6FE' },
  holiday: { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' },
  event: { bg: '#DBEAFE', text: '#1D4ED8', border: '#BFDBFE' },
  deadline: { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
  other: { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' },
};

export default function CalendarPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', start: '', end: '', type: 'event', color: '#4F46E5', visibility: 'all' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchEvents(); }, [currentDate]);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/calendar');
      setEvents(res.data.events);
    } catch (e) { toast.error('Failed to load events'); }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const getEventsForDay = (day) => {
    if (!day) return [];
    const date = new Date(year, month, day);
    return events.filter(e => {
      const start = new Date(e.start);
      const end = new Date(e.end);
      return date >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
        date <= new Date(end.getFullYear(), end.getMonth(), end.getDate());
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/calendar', form);
      toast.success('Event created!');
      setShowModal(false);
      setForm({ title: '', description: '', start: '', end: '', type: 'event', color: '#4F46E5', visibility: 'all' });
      fetchEvents();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/calendar/${id}`);
      toast.success('Event deleted');
      setSelectedDate(null);
      fetchEvents();
    } catch (err) { toast.error('Error'); }
  };

  const today = new Date();
  const isToday = (day) => day && year === today.getFullYear() && month === today.getMonth() && day === today.getDate();

  const selectedEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  return (
    <div>
      <div className="page-header d-flex align-items-center justify-content-between">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-subtitle">Schedule and events</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'hr') && (
          <button className="btn-primary-custom d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-circle"></i> Add Event
          </button>
        )}
      </div>

      <div className="row g-3">
        {/* Calendar Grid */}
        <div className="col-12 col-lg-8">
          <div className="card-custom">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-4">
              <button onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1))}
                style={{ background: 'var(--light)', border: 'none', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-chevron-left"></i>
              </button>
              <h4 style={{ fontWeight: 800, fontSize: 20 }}>{MONTHS[month]} {year}</h4>
              <button onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1))}
                style={{ background: 'var(--light)', border: 'none', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
              {DAYS.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', padding: '4px 0', letterSpacing: 0.5 }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {cells.map((day, i) => {
                const dayEvents = getEventsForDay(day);
                const isSelected = selectedDate === day;
                return (
                  <div
                    key={i}
                    onClick={() => day && setSelectedDate(isSelected ? null : day)}
                    style={{
                      minHeight: 70,
                      padding: 6,
                      borderRadius: 10,
                      cursor: day ? 'pointer' : 'default',
                      background: isSelected ? 'rgba(79,70,229,0.1)' : isToday(day) ? 'rgba(79,70,229,0.06)' : day ? 'var(--lighter)' : 'transparent',
                      border: `1.5px solid ${isSelected ? 'var(--primary)' : isToday(day) ? 'rgba(79,70,229,0.3)' : 'transparent'}`,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => day && !isSelected && (e.currentTarget.style.background = 'rgba(79,70,229,0.04)')}
                    onMouseLeave={e => day && !isSelected && !isToday(day) && (e.currentTarget.style.background = 'var(--lighter)')}
                  >
                    {day && (
                      <>
                        <div style={{
                          fontWeight: isToday(day) ? 800 : 600,
                          fontSize: 13,
                          color: isToday(day) ? 'var(--primary)' : 'var(--dark)',
                          marginBottom: 3,
                          width: 24, height: 24,
                          borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: isToday(day) ? 'var(--primary)' : 'transparent',
                          color: isToday(day) ? 'white' : 'var(--dark)',
                        }}>
                          {day}
                        </div>
                        <div>
                          {dayEvents.slice(0, 2).map(ev => (
                            <div key={ev._id} style={{
                              fontSize: 10, padding: '1px 5px', borderRadius: 4,
                              background: typeColors[ev.type]?.bg || '#F1F5F9',
                              color: typeColors[ev.type]?.text || '#475569',
                              marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              fontWeight: 600,
                            }}>
                              {ev.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 600 }}>+{dayEvents.length - 2} more</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Event Sidebar */}
        <div className="col-12 col-lg-4">
          <div className="card-custom" style={{ position: 'sticky', top: 90 }}>
            <h5 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
              {selectedDate ? `${MONTHS[month]} ${selectedDate}` : 'Upcoming Events'}
            </h5>

            {(() => {
              const displayEvents = selectedDate ? selectedEvents : events.filter(e => new Date(e.start) >= new Date()).slice(0, 8);
              return displayEvents.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px 0' }}>
                  <i className="bi bi-calendar3 d-block" style={{ fontSize: 36 }}></i>
                  <h5 style={{ fontSize: 14 }}>No events{selectedDate ? ' on this day' : ' upcoming'}</h5>
                </div>
              ) : (
                <div>
                  {displayEvents.map(ev => {
                    const tc = typeColors[ev.type] || typeColors.other;
                    return (
                      <div key={ev._id} style={{
                        background: tc.bg, border: `1px solid ${tc.border}`,
                        borderRadius: 12, padding: '12px 14px', marginBottom: 10
                      }}>
                        <div className="d-flex align-items-start justify-content-between">
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: tc.text }}>{ev.title}</div>
                            <div style={{ fontSize: 11, color: tc.text, opacity: 0.7, marginTop: 2 }}>
                              <i className="bi bi-clock me-1"></i>
                              {new Date(ev.start).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="d-flex gap-1">
                            <span style={{ fontSize: 10, background: 'rgba(0,0,0,0.08)', padding: '2px 8px', borderRadius: 10, color: tc.text, fontWeight: 600, textTransform: 'capitalize' }}>
                              {ev.type}
                            </span>
                            {(user?.role === 'admin' || user?.role === 'hr') && (
                              <button onClick={() => handleDelete(ev._id)}
                                style={{ background: 'transparent', border: 'none', color: tc.text, opacity: 0.6, cursor: 'pointer', padding: '0 4px', fontSize: 13 }}>
                                <i className="bi bi-trash"></i>
                              </button>
                            )}
                          </div>
                        </div>
                        {ev.description && <p style={{ fontSize: 12, color: tc.text, opacity: 0.7, marginTop: 6, marginBottom: 0 }}>{ev.description}</p>}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div className="modal show d-block modal-custom" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ fontWeight: 700 }}><i className="bi bi-calendar-plus me-2"></i>Add Event</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label-custom">Title</label>
                      <input type="text" className="form-control-custom" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label-custom">Type</label>
                      <select className="form-control-custom" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                        {['meeting', 'holiday', 'event', 'deadline', 'other'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label-custom">Visibility</label>
                      <select className="form-control-custom" value={form.visibility} onChange={e => setForm(p => ({ ...p, visibility: e.target.value }))}>
                        <option value="all">All Staff</option>
                        <option value="hr">HR Only</option>
                        <option value="admin">Admin Only</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label-custom">Start Date/Time</label>
                      <input type="datetime-local" className="form-control-custom" value={form.start} onChange={e => setForm(p => ({ ...p, start: e.target.value }))} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label-custom">End Date/Time</label>
                      <input type="datetime-local" className="form-control-custom" value={form.end} onChange={e => setForm(p => ({ ...p, end: e.target.value }))} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label-custom">Description (optional)</label>
                      <textarea className="form-control-custom" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ resize: 'none' }}></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" style={{ borderRadius: 10 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary-custom d-flex align-items-center gap-2" disabled={saving}>
                    {saving ? 'Saving...' : <><i className="bi bi-check-circle"></i> Create Event</>}
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
