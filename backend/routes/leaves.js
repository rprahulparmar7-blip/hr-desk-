const express = require('express');
const router = express.Router();
const { Leave } = require('../models');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/leaves
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'employee') query.user = req.user._id;
    else if (req.query.userId) query.user = req.query.userId;
    if (req.query.status) query.status = req.query.status;

    const leaves = await Leave.find(query)
      .populate('user', 'name email department')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: leaves.length, leaves });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/leaves - Employee OR HR can apply
router.post('/', protect, async (req, res) => {
  try {
    let { userId, type, startDate, endDate, reason } = req.body;

    // Employee applies for themselves; HR can apply for any employee
    if (req.user.role === 'employee') userId = req.user._id;
    else if (!userId) userId = req.user._id;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const leave = await Leave.create({ user: userId, type, startDate: start, endDate: end, days, reason });
    await leave.populate('user', 'name email');
    res.status(201).json({ success: true, leave });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/leaves/:id/status - HR/Admin approve or reject
router.put('/:id/status', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { status, comments } = req.body;
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status, comments, approvedBy: req.user._id, approvedAt: new Date() },
      { new: true }
    ).populate('user', 'name email');

    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
    res.json({ success: true, leave });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/leaves/:id - Cancel own pending leave
router.delete('/:id', protect, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
    if (req.user.role === 'employee' && leave.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Forbidden' });
    if (leave.status !== 'pending')
      return res.status(400).json({ success: false, message: 'Can only cancel pending leaves' });

    await leave.deleteOne();
    res.json({ success: true, message: 'Leave cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
