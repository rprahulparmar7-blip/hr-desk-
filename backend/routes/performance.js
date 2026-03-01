const express = require('express');
const router = express.Router();
const { Performance } = require('../models');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/performance
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'employee') query.user = req.user._id;
    else if (req.query.userId) query.user = req.query.userId;

    const records = await Performance.find(query)
      .populate('user', 'name email department')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/performance - HR/Admin add performance review
router.post('/', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { userId, period, rating, goals, skills, comments } = req.body;
    const record = await Performance.create({
      user: userId, period, rating, goals, skills, comments, reviewedBy: req.user._id
    });
    res.status(201).json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
