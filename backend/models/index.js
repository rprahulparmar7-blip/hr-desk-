const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ========== USER MODEL ==========
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'hr', 'employee'], default: 'employee' },
  phone: { type: String, trim: true },
  department: { type: String, trim: true },
  position: { type: String, trim: true },
  avatar: { type: String },
  address: { type: String },
  joinDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

// ========== ATTENDANCE MODEL ==========
const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  checkIn: { type: Date },
  checkOut: { type: Date },
  status: { type: String, enum: ['present', 'absent', 'late', 'half-day'], default: 'present' },
  notes: { type: String },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

// ========== LEAVE MODEL ==========
const leaveSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['sick', 'casual', 'annual', 'maternity', 'other'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  days: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  comments: { type: String },
}, { timestamps: true });

// ========== PERFORMANCE MODEL ==========
const performanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  period: { type: String, required: true }, // e.g., "Q1 2024"
  rating: { type: Number, min: 1, max: 5, required: true },
  goals: [{ title: String, achieved: Boolean }],
  skills: [{ name: String, score: Number }],
  comments: { type: String },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// ========== CALENDAR EVENT MODEL ==========
const calendarSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  type: { type: String, enum: ['meeting', 'holiday', 'event', 'deadline', 'other'], default: 'event' },
  color: { type: String, default: '#4F46E5' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  visibility: { type: String, enum: ['all', 'hr', 'admin'], default: 'all' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);
const Leave = mongoose.model('Leave', leaveSchema);
const Performance = mongoose.model('Performance', performanceSchema);
const CalendarEvent = mongoose.model('CalendarEvent', calendarSchema);

module.exports = { User, Attendance, Leave, Performance, CalendarEvent };
