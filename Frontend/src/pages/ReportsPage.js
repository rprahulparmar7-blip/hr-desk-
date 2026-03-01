import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

export default function ReportsPage() {
  const [loading, setLoading] = useState({});
  const [dates, setDates] = useState({ startDate: '', endDate: '' });

  const downloadCSV = async (type, label) => {
    setLoading(p => ({ ...p, [type]: true }));
    try {
      const params = new URLSearchParams({ format: 'csv' });
      if (dates.startDate) params.append('startDate', dates.startDate);
      if (dates.endDate) params.append('endDate', dates.endDate);

      const res = await api.get(`/reports/${type}?${params}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`${label} report downloaded!`);
    } catch (err) { toast.error('Download failed'); }
    setLoading(p => ({ ...p, [type]: false }));
  };

  const reports = [
    { type: 'attendance', label: 'Attendance Report', icon: 'bi-clock-fill', color: '#4F46E5', desc: 'Daily attendance records with check-in/out times and status' },
    { type: 'leaves', label: 'Leave Report', icon: 'bi-calendar2-x-fill', color: '#EF4444', desc: 'All leave requests with approval status and details' },
    { type: 'employees', label: 'Employee Report', icon: 'bi-people-fill', color: '#10B981', desc: 'Complete employee directory with department and position info' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Download and export HR data reports</p>
      </div>

      {/* Date Filters */}
      <div className="card-custom mb-4" style={{ padding: 20 }}>
        <h6 style={{ fontWeight: 700, marginBottom: 14 }}><i className="bi bi-funnel me-2"></i>Filter by Date Range</h6>
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-4">
            <label className="form-label-custom">Start Date</label>
            <input type="date" className="form-control-custom" value={dates.startDate} onChange={e => setDates(p => ({ ...p, startDate: e.target.value }))} />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label-custom">End Date</label>
            <input type="date" className="form-control-custom" value={dates.endDate} onChange={e => setDates(p => ({ ...p, endDate: e.target.value }))} />
          </div>
          <div className="col-12 col-md-4">
            <button onClick={() => setDates({ startDate: '', endDate: '' })}
              style={{ background: 'var(--light)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: 'var(--muted)' }}>
              <i className="bi bi-x-circle me-1"></i> Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {reports.map(r => (
          <div key={r.type} className="col-12 col-md-4">
            <div className="card-custom" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 20,
                background: `${r.color}15`, color: r.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, margin: '0 auto 16px'
              }}>
                <i className={`bi ${r.icon}`}></i>
              </div>
              <h5 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{r.label}</h5>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.5 }}>{r.desc}</p>
              <button
                onClick={() => downloadCSV(r.type, r.label)}
                disabled={loading[r.type]}
                style={{
                  background: `${r.color}15`, border: `2px solid ${r.color}30`,
                  borderRadius: 12, padding: '10px 24px', cursor: 'pointer',
                  color: r.color, fontWeight: 700, fontSize: 14,
                  transition: 'all 0.2s', width: '100%'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${r.color}25`; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${r.color}15`; }}
              >
                {loading[r.type] ? (
                  <><div className="spinner-border spinner-border-sm" style={{ marginRight: 8 }}></div>Downloading...</>
                ) : (
                  <><i className="bi bi-download me-2"></i>Download CSV</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Report Tips */}
      <div className="card-custom mt-4" style={{ background: 'rgba(79,70,229,0.04)', borderColor: 'rgba(79,70,229,0.15)' }}>
        <h6 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>
          <i className="bi bi-info-circle me-2"></i>Report Tips
        </h6>
        <div className="row g-2">
          {[
            'Use date filters to narrow down records for specific periods.',
            'CSV files can be opened in Excel or Google Sheets for further analysis.',
            'Employee report does not require date filters — it exports all employees.',
            'Reports include all records based on your access level.',
          ].map((tip, i) => (
            <div key={i} className="col-12 col-md-6">
              <div style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', gap: 8 }}>
                <i className="bi bi-check-circle-fill" style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 1 }}></i>
                <span>{tip}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
