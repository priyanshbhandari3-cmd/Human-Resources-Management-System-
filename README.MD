# 🏢 Multi-Tenant HRMS — Human Resource Management System

A full-stack HRMS application built with React, Vite, Node.js, Express, MongoDB, and JWT authentication.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | Node.js, Express 5 |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |

## What this app does

- Multi-tenant HRMS workflow with company and user isolation
- Role-based user hierarchy: `superadmin`, `admin`, `manager`, `employee`
- Attendance check-in/check-out tracking (for employees, managers, and admins)
- Leave application, approval, rejection workflow
- Payroll, performance, notification, and reporting endpoints
- Task assignment and tracking system between managers and employees
- Protected frontend pages per user role

## Repository Structure

```
HRMS/
├── backend/
│   ├── config/           # Database connection setup
│   ├── controllers/      # Request handlers for auth, users, leave, attendance, etc.
│   ├── middleware/       # JWT auth and role-based authorization
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express route definitions
│   └── server.js         # Express application entry point
├── frontend/
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── api/          # Axios instance and API helpers
│   │   ├── components/   # Shared UI components
│   │   ├── context/      # AuthContext for login/session state
│   │   ├── pages/        # Application pages by role and feature
│   │   └── routes/       # ProtectedRoute component
│   ├── package.json
│   └── vite.config.js
└── README.MD
```

## Setup

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```
### 2. Run development servers

```bash
# Start backend
cd backend
npm start

# Start frontend
cd ../frontend
npm run dev
```

## Backend Scripts

In `backend/package.json`:

- `npm start` — start the API with Node
- `npm run dev` — start the API with `nodemon`

## Frontend Scripts

In `frontend/package.json`:

- `npm run dev` — start Vite development server
- `npm run build` — build production bundle
- `npm run preview` — preview production build
- `npm run lint` — run linter

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register-superadmin` | Register the first superadmin |
| POST | `/api/auth/login` | Login and receive JWT token |

### Users
| Method | Endpoint | Roles |
|--------|----------|-------|
| POST | `/api/users/create` | `superadmin`, `admin`, `manager` |
| GET | `/api/users/my-team` | `superadmin`, `admin`, `manager` |
| GET | `/api/users/all` | `superadmin`, `admin` |
| PATCH | `/api/users/:id/toggle-status` | `superadmin`, `admin` |
| DELETE | `/api/users/:id` | `superadmin`, `admin` |

### Attendance
| Method | Endpoint | Roles |
|--------|----------|-------|
| POST | `/api/attendance/checkin` | `employee`, `manager`, `admin` |
| POST | `/api/attendance/checkout` | `employee`, `manager`, `admin` |
| GET | `/api/attendance/my` | `employee`, `manager`, `admin` |
| GET | `/api/attendance/team` | `manager` |
| GET | `/api/attendance/all` | `superadmin`, `admin` |

### Leave
| Method | Endpoint | Roles |
|--------|----------|-------|
| POST | `/api/leave/apply` | `employee` |
| GET | `/api/leave/my` | `employee` |
| GET | `/api/leave/pending` | `manager` |
| PATCH | `/api/leave/:id/review` | `manager` |
| GET | `/api/leave/all` | `superadmin`, `admin` |

## Notes

- The backend connects to MongoDB using `MONGO_URI`.
- The frontend uses an Axios instance and React context for authentication.
- The API includes built-in route protection and 404/error handlers.

## License

MIT
