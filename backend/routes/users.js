const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/users - Admin gets all, HR gets employees only
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'hr') query.role = 'employee';
    else if (req.user.role === 'employee')
      return res.status(403).json({ success: false, message: 'Forbidden' });

    const { role, department, search } = req.query;
    if (role && req.user.role === 'admin') query.role = role;
    if (department) query.department = department;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];

    const users = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/users/:id
router.get('/:id', protect, async (req, res) => {
  try {
    if (req.user.role === 'employee' && req.user._id.toString() !== req.params.id)
      return res.status(403).json({ success: false, message: 'Forbidden' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/users - Admin can create any role, HR can create employees
router.post('/', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { name, email, password, role, phone, department, position, address } = req.body;
    if (req.user.role === 'hr' && role !== 'employee')
      return res.status(403).json({ success: false, message: 'HR can only create employees' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already exists' });

    const user = await User.create({ name, email, password: password || 'Pass@1234', role: role || 'employee', phone, department, position, address });
    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/users/:id
router.put('/:id', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { name, email, role, phone, department, position, address, isActive } = req.body;
    if (req.user.role === 'hr') {
      const target = await User.findById(req.params.id);
      if (!target || target.role !== 'employee')
        return res.status(403).json({ success: false, message: 'HR can only edit employees' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, phone, department, position, address, isActive },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/users/:id
router.delete('/:id', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    if (req.user.role === 'hr') {
      const target = await User.findById(req.params.id);
      if (!target || target.role !== 'employee')
        return res.status(403).json({ success: false, message: 'HR can only delete employees' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/users/stats/summary - Dashboard stats
router.get('/stats/summary', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const [totalEmployees, totalHR, totalAdmin] = await Promise.all([
      User.countDocuments({ role: 'employee', isActive: true }),
      User.countDocuments({ role: 'hr', isActive: true }),
      User.countDocuments({ role: 'admin', isActive: true }),
    ]);
    res.json({ success: true, stats: { totalEmployees, totalHR, totalAdmin } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
