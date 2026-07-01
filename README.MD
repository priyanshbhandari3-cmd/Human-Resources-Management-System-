# 🏢 HRMS — Human Resource Management System

A full-stack MERN application for managing employees, attendance, leaves, and team hierarchies with role-based access control.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | Node.js, Express 5 |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |

## Features

- **Role-Based Access** — Superadmin → Admin → Manager → Employee hierarchy
- **Attendance Tracking** — Check-in/out with automatic work-hour calculation
- **Leave Management** — Apply, approve/reject with overlap detection
- **User Management** — Create, toggle status, delete users per role
- **Dashboard** — Role-specific views with stats and team overviews
- **Global Settings** — Configurable leave policies and working hours

## Project Structure

```
HRMS/
├── backend/
│   ├── config/         # DB connection
│   ├── controllers/    # Auth, User, Attendance, Leave
│   ├── middleware/      # JWT auth, role-based access
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API route definitions
│   └── server.js       # Express app entry point
├── frontend/
│   ├── src/
│   │   ├── api/        # Axios instance
│   │   ├── components/ # Navbar, Sidebar, MainLayout
│   │   ├── context/    # AuthContext (JWT session)
│   │   ├── pages/      # Home, Login, Register, Dashboards
│   │   └── routes/     # ProtectedRoute component
│   └── vite.config.js
└── README.MD
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally on `mongodb://localhost:27017`

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd HRMS

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Variables

Create `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/HRMS
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

### Run Development Servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

## API Routes

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register-superadmin` | One-time superadmin registration |
| POST | `/api/auth/login` | Login (returns JWT) |

### Users (Auth Required)
| Method | Endpoint | Allowed Roles |
|--------|----------|---------------|
| POST | `/api/users/create` | Superadmin, Admin, Manager |
| GET | `/api/users/my-team` | Superadmin, Admin, Manager |
| GET | `/api/users/all` | Superadmin, Admin |
| PATCH | `/api/users/:id/toggle-status` | Superadmin, Admin |
| DELETE | `/api/users/:id` | Superadmin, Admin |

### Attendance (Auth Required)
| Method | Endpoint | Allowed Roles |
|--------|----------|---------------|
| POST | `/api/attendance/checkin` | Employee |
| POST | `/api/attendance/checkout` | Employee |
| GET | `/api/attendance/my` | Employee |
| GET | `/api/attendance/team` | Manager |
| GET | `/api/attendance/all` | Superadmin, Admin |

### Leaves (Auth Required)
| Method | Endpoint | Allowed Roles |
|--------|----------|---------------|
| POST | `/api/leave/apply` | Employee |
| GET | `/api/leave/my` | Employee |
| GET | `/api/leave/pending` | Manager |
| PATCH | `/api/leave/:id/review` | Manager |
| GET | `/api/leave/all` | Superadmin, Admin |

## Role Hierarchy

```
Superadmin ─── creates ──→ Admin
Admin ──────── creates ──→ Manager
Manager ────── creates ──→ Employee
```

Each role can only create users one level below them.

## License

MIT
