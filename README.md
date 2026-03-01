# 🏢 HR Desk Pro — Full-Stack HR Management System

A complete, production-ready HR Management application with role-based access control, beautiful UI, and smooth animations.

---

## ✨ Features

| Feature | Admin | HR | Employee |
|---------|-------|-----|----------|
| Dashboard | ✅ Full Stats | ✅ Team Stats | ✅ Personal |
| Employee Management | ✅ CRUD | ✅ CRUD | ❌ |
| HR Management | ✅ CRUD | ❌ | ❌ |
| Attendance | ✅ All | ✅ Mark + Manage | ✅ Mark Own |
| Leaves | ✅ Approve/Reject | ✅ Apply + Approve | ✅ Apply Own |
| Performance | ✅ Add Reviews | ✅ Add Reviews | ✅ View Own |
| Calendar | ✅ Manage | ✅ Manage | ✅ View |
| Reports | ✅ Download | ✅ Download | ❌ |
| Profile | ✅ | ✅ | ✅ |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

---

### 1. Clone and Set Up Backend

```bash
cd hrdesk/backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```

Backend runs on: `http://localhost:5000`

---

### 2. Set Up Frontend

```bash
cd hrdesk/frontend
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

---

### 3. Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hrdesk.com | Admin@1234 |
| HR | hr@hrdesk.com | Hr@1234 |
| Employee | john@hrdesk.com | Emp@1234 |

---

## 📁 Project Structure

```
hrdesk/
├── backend/
│   ├── models/
│   │   └── index.js          # Mongoose schemas (User, Attendance, Leave, Performance, CalendarEvent)
│   ├── middleware/
│   │   └── auth.js           # JWT protect + authorize middleware
│   ├── routes/
│   │   ├── auth.js           # Login, profile, password change
│   │   ├── users.js          # CRUD users with role guards
│   │   ├── attendance.js     # Mark/update attendance
│   │   ├── leaves.js         # Apply/approve/reject leaves
│   │   ├── performance.js    # Performance reviews
│   │   ├── calendar.js       # Calendar events CRUD
│   │   └── reports.js        # CSV export reports
│   ├── utils/
│   │   └── seed.js           # Seed admin + sample data
│   ├── server.js             # Express app entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── context/
        │   └── AuthContext.js    # Auth state, login/logout
        ├── utils/
        │   └── api.js            # Axios instance
        ├── styles/
        │   └── App.css           # Global CSS + animations
        ├── components/
        │   └── Layout.js         # Sidebar + Topbar
        ├── pages/
        │   ├── Login.js          # Login with demo buttons
        │   ├── Dashboard.js      # Stats + quick actions
        │   ├── EmployeeList.js   # Employee CRUD
        │   ├── HRList.js         # HR user management
        │   ├── AttendancePage.js # Mark + view attendance
        │   ├── LeavesPage.js     # Apply + approve leaves
        │   ├── CalendarPage.js   # Custom calendar UI
        │   ├── PerformancePage.js# Performance reviews
        │   ├── ReportsPage.js    # CSV downloads
        │   └── ProfilePage.js    # Edit profile + password
        ├── App.js                # Router + protected routes
        └── index.js              # React entry
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | /api/auth/login | Public | Login |
| GET | /api/auth/me | All | Get current user |
| PUT | /api/auth/profile | All | Update profile |
| PUT | /api/auth/change-password | All | Change password |

### Users
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | /api/users | Admin/HR | List users |
| POST | /api/users | Admin/HR | Create user |
| PUT | /api/users/:id | Admin/HR | Update user |
| DELETE | /api/users/:id | Admin/HR | Delete user |
| GET | /api/users/stats/summary | Admin/HR | Dashboard stats |

### Attendance
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | /api/attendance | All | View records |
| POST | /api/attendance | All | Mark attendance |
| PUT | /api/attendance/:id | All | Update record |
| GET | /api/attendance/today/summary | Admin/HR | Today's summary |

### Leaves
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | /api/leaves | All | View leaves |
| POST | /api/leaves | All | Apply leave (HR can apply for employees) |
| PUT | /api/leaves/:id/status | Admin/HR | Approve/reject |
| DELETE | /api/leaves/:id | All | Cancel pending leave |

### Calendar
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | /api/calendar | All | Get events |
| POST | /api/calendar | Admin/HR | Create event |
| PUT | /api/calendar/:id | Admin/HR | Update event |
| DELETE | /api/calendar/:id | Admin/HR | Delete event |

### Reports (CSV)
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | /api/reports/attendance?format=csv | Admin/HR | Attendance CSV |
| GET | /api/reports/leaves?format=csv | Admin/HR | Leaves CSV |
| GET | /api/reports/employees?format=csv | Admin/HR | Employees CSV |

---

## 🌍 Environment Variables

### Backend `.env`
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/hrdesk
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

---

## 🐳 Docker (Optional)

```yaml
# docker-compose.yml
version: '3.8'
services:
  mongo:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: [mongo_data:/data/db]

  backend:
    build: ./backend
    ports: ["5000:5000"]
    env_file: ./backend/.env
    depends_on: [mongo]

  frontend:
    build: ./frontend
    ports: ["3000:80"]
    environment:
      - REACT_APP_API_URL=http://localhost:5000/api

volumes:
  mongo_data:
```

Run: `docker-compose up --build`

---

## 🎨 Design Highlights

- **Font**: Plus Jakarta Sans + Sora for headings
- **Color**: Indigo/Violet/Cyan gradient system
- **Animations**: CSS keyframes on mount, hover transitions, counter animations
- **Dark Sidebar**: Frosted glass, active indicators, smooth hover
- **Responsive**: Mobile-first Bootstrap grid
- **Components**: Custom stat cards, badges, tables, modals, skeleton loaders

---

## 📦 Tech Stack

**Frontend**: React 18 · React Router v6 · Bootstrap 5 · Bootstrap Icons · Axios · React Toastify

**Backend**: Node.js · Express · MongoDB · Mongoose · JWT · bcryptjs

---

## 📝 Default Demo Data

After first start, seed data includes:
- 1 Super Admin
- 1 HR Manager (Sarah Johnson)
- 3 Employees (Engineering, Design departments)
- 2 Sample Calendar Events
