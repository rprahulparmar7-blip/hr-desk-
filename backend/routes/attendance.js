const express = require('express');
const router = express.Router();
const { Attendance } = require('../models');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/attendance - HR/Admin see all, Employee sees own
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'employee') query.user = req.user._id;
    else if (req.query.userId) query.user = req.query.userId;

    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) query.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.date.$lte = new Date(req.query.endDate);
    }

    const records = await Attendance.find(query)
      .populate('user', 'name email department')
      .populate('markedBy', 'name')
      .sort({ date: -1 });
    res.json({ success: true, count: records.length, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/attendance - Employee marks own, HR/Admin mark for anyone
router.post('/', protect, async (req, res) => {
  try {
    let { userId, date, checkIn, checkOut, status, notes } = req.body;

    // Employee can only mark for themselves
    if (req.user.role === 'employee') userId = req.user._id;

    const existing = await Attendance.findOne({
      user: userId,
      date: new Date(date || new Date().toDateString())
    });
    if (existing) return res.status(400).json({ success: false, message: 'Attendance already marked for this date' });

    const record = await Attendance.create({
      user: userId,
      date: date || new Date(),
      checkIn: checkIn || new Date(),
      checkOut,
      status: status || 'present',
      notes,
      markedBy: req.user._id
    });
    await record.populate('user', 'name email department');
    res.status(201).json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/attendance/:id - Update checkout or status
router.put('/:id', protect, async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

    if (req.user.role === 'employee' && record.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Forbidden' });

    const { checkOut, status, notes } = req.body;
    if (checkOut) record.checkOut = checkOut;
    if (status && req.user.role !== 'employee') record.status = status;
    if (notes) record.notes = notes;
    await record.save();

    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/attendance/today/summary
router.get('/today/summary', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const records = await Attendance.find({ date: { $gte: today, $lt: tomorrow } });
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;

    res.json({ success: true, summary: { present, absent, late, total: records.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
