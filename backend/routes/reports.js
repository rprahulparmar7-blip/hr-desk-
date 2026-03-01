const express = require('express');
const router = express.Router();
const { User, Attendance, Leave } = require('../models');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/reports/attendance
router.get('/attendance', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    const records = await Attendance.find(query)
      .populate('user', 'name email department position')
      .sort({ date: -1 });

    // Return as CSV
    if (req.query.format === 'csv') {
      const csv = ['Name,Email,Department,Date,Status,CheckIn,CheckOut'];
      records.forEach(r => {
        csv.push([
          r.user?.name, r.user?.email, r.user?.department,
          new Date(r.date).toLocaleDateString(),
          r.status,
          r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '',
          r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : ''
        ].join(','));
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.csv');
      return res.send(csv.join('\n'));
    }
    res.json({ success: true, count: records.length, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/reports/leaves
router.get('/leaves', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const leaves = await Leave.find(req.query.status ? { status: req.query.status } : {})
      .populate('user', 'name email department')
      .sort({ createdAt: -1 });

    if (req.query.format === 'csv') {
      const csv = ['Name,Email,Department,Type,Start,End,Days,Status'];
      leaves.forEach(l => {
        csv.push([
          l.user?.name, l.user?.email, l.user?.department,
          l.type, new Date(l.startDate).toLocaleDateString(),
          new Date(l.endDate).toLocaleDateString(), l.days, l.status
        ].join(','));
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=leave_report.csv');
      return res.send(csv.join('\n'));
    }
    res.json({ success: true, count: leaves.length, leaves });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/reports/employees
router.get('/employees', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const users = await User.find({ role: 'employee' }).sort({ createdAt: -1 });

    if (req.query.format === 'csv') {
      const csv = ['Name,Email,Phone,Department,Position,JoinDate,Status'];
      users.forEach(u => {
        csv.push([
          u.name, u.email, u.phone || '', u.department || '', u.position || '',
          new Date(u.joinDate).toLocaleDateString(), u.isActive ? 'Active' : 'Inactive'
        ].join(','));
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=employees_report.csv');
      return res.send(csv.join('\n'));
    }
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
