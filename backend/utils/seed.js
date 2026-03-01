const { User, Attendance, Leave, Performance, CalendarEvent } = require('../models');

const seedAdmin = async () => {
  const existing = await User.findOne({ role: 'admin' });
  if (existing) return console.log('ℹ️  Admin already exists');

  await User.create({
    name: 'Super Admin',
    email: 'admin@hrdesk.com',
    password: 'Admin@1234',
    role: 'admin',
    department: 'Administration',
    position: 'System Administrator',
    phone: '+1-000-000-0000',
  });
  console.log('✅ Admin seeded: admin@hrdesk.com / Admin@1234');

  // Seed HR
  const hr = await User.create({
    name: 'Sarah Johnson',
    email: 'hr@hrdesk.com',
    password: 'Hr@1234',
    role: 'hr',
    department: 'Human Resources',
    position: 'HR Manager',
    phone: '+1-555-100-2000',
  });

  // Seed Employees
  const employees = await User.insertMany([
    { name: 'John Smith', email: 'john@hrdesk.com', password: 'Emp@1234', role: 'employee', department: 'Engineering', position: 'Software Engineer', phone: '+1-555-100-3001' },
    { name: 'Emily Davis', email: 'emily@hrdesk.com', password: 'Emp@1234', role: 'employee', department: 'Design', position: 'UI/UX Designer', phone: '+1-555-100-3002' },
    { name: 'Michael Brown', email: 'michael@hrdesk.com', password: 'Emp@1234', role: 'employee', department: 'Engineering', position: 'Backend Developer', phone: '+1-555-100-3003' },
  ]);

  // Seed some calendar events
  await CalendarEvent.insertMany([
    { title: 'Company All-Hands Meeting', start: new Date(), end: new Date(Date.now() + 2 * 3600000), type: 'meeting', color: '#4F46E5', createdBy: hr._id },
    { title: 'Independence Day Holiday', start: new Date('2024-07-04'), end: new Date('2024-07-04'), type: 'holiday', color: '#EF4444', createdBy: hr._id },
  ]);

  console.log('✅ Sample HR and employees seeded');
};

module.exports = { seedAdmin };
