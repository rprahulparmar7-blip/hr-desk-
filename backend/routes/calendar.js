const express = require('express');
const router = express.Router();
const { CalendarEvent } = require('../models');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/calendar
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'employee') query.visibility = 'all';
    if (req.query.start) query.start = { $gte: new Date(req.query.start) };
    if (req.query.end) query.end = { $lte: new Date(req.query.end) };

    const events = await CalendarEvent.find(query)
      .populate('createdBy', 'name')
      .sort({ start: 1 });
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/calendar
router.post('/', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { title, description, start, end, type, color, visibility } = req.body;
    const event = await CalendarEvent.create({
      title, description, start, end, type, color, visibility, createdBy: req.user._id
    });
    res.status(201).json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/calendar/:id
router.put('/:id', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const event = await CalendarEvent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/calendar/:id
router.delete('/:id', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    await CalendarEvent.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
