# E-Learning Platform

A full-stack mini e-learning platform built from scratch. Includes a backend REST API, a user-facing app for students and instructors, and a separate admin portal.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend API | Node.js, Express |
| Database | PostgreSQL |
| Authentication | JWT (jsonwebtoken), bcryptjs |
| User App | React, TypeScript, Vite |
| Admin App | React, TypeScript, Vite |
| Logging | Winston |
| Process Manager | nodemon (dev) |

---

## Project Structure
```
elearning-platform/
├── backend/          ← Node.js REST API
├── user-app/         ← React app for students and instructors
├── admin-app/        ← React app for admins only
├── ARCHITECTURE.md   ← Architecture decisions and trade-offs
└── README.md         
```

---

## Prerequisites

Make sure these are installed on your machine before starting:

- Node.js v18 or higher
- PostgreSQL v15 or higher
- npm

Check by running:
```
node --version
psql --version
```

---

## Setup Instructions

### Step 1 — Create the PostgreSQL database

Open a terminal and run:
```
psql -U postgres
CREATE DATABASE elearning;
\q
```

### Step 2 — Set up the backend
```
cd elearning-platform/backend
npm install
```

Open `src/db/database.js` and change `YOUR_PASSWORD` to your PostgreSQL password:
```js
const pool = new Pool({
  user:     'postgres',
  host:     'localhost',
  database: 'elearning',
  password: 'YOUR_PASSWORD',   
  port:     5432,
})
```

Then run:
```
npm run migrate     creates all database tables
npm run seed        creates test accounts
npm run dev         starts the API on http://localhost:3000
```

### Step 3 — Set up the user app

Open a new terminal:
```
cd elearning-platform/user-app
npm install
npm run dev         starts on http://localhost:5173
```

### Step 4 — Set up the admin app

Open another new terminal:
```
cd elearning-platform/admin-app
npm install
npm run dev         starts on http://localhost:5174
```

---

## Test Accounts

These accounts are created by the seed script:

| Email | Password | Role | Access |
|-------|----------|------|--------|
| admin@app.com | password | Admin | Admin portal (port 5174) |
| instructor@app.com | password | Instructor | User app (port 5173) |
| student@app.com | password | Student | User app (port 5173) |

---

## Running the Full App

You need **3 terminals open at the same time**:

| Terminal | Command | URL |
|----------|---------|-----|
| 1 — Backend | `npm run dev` inside `/backend` | http://localhost:3000 |
| 2 — User App | `npm run dev` inside `/user-app` | http://localhost:5173 |
| 3 — Admin App | `npm run dev` inside `/admin-app` | http://localhost:5174 |

The backend must be running before the frontend apps will work.

---

## API Endpoints

### Auth
```
POST   /auth/register          Register as student or instructor
POST   /auth/login             Login — returns JWT token
GET    /auth/me                Get current logged-in user
```

### Courses
```
GET    /courses                List all published courses (public)
GET    /courses/mine           Instructor: own courses
GET    /courses/:id            Get one course
POST   /courses                Instructor: create a course
POST   /courses/:id/publish    Instructor: publish a course
POST   /courses/:id/unpublish  Instructor: unpublish a course
POST   /courses/:id/enroll     Student: enroll in a course
POST   /courses/:id/sessions   Instructor: add a session to a course
```

### Sessions
```
GET    /sessions               Instructor: all their sessions
POST   /sessions/:id/complete  Instructor: mark session as completed
```

### Enrollments
```
GET    /me/enrollments         Student: all enrolled courses
```

### Payouts
```
GET    /payouts/balance              Instructor: virtual balance
POST   /payouts/requests             Instructor: request a payout
GET    /payouts/requests             Instructor: own | Admin: all
POST   /payouts/requests/:id/approve Admin: approve payout
POST   /payouts/requests/:id/reject  Admin: reject payout
```

---

## How Authentication Works

1. User logs in at `POST /auth/login`
2. Server returns a JWT token containing `{ id, role, type }`
3. Client stores token in `localStorage`
4. Every protected request sends: `Authorization: Bearer <token>`
5. `requireAuth` middleware verifies the token before the route runs

---

## How the Payout System Works

The payout system is fully sandboxed — no real money is involved.

1. Instructor teaches a session and marks it as **completed**
2. **Virtual balance** = sum of completed sessions where `paid_out = false`
3. Instructor submits a **payout request** — the current balance is snapshotted
4. Admin **approves** → request marked approved + sessions marked `paid_out = true`
5. Admin **rejects** → request marked rejected + sessions stay unpaid

When a payout is approved, sessions are marked `paid_out = true` so they
can never appear in the balance again. This prevents double payment.

---

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full details on:

- Module boundaries and the 3-layer pattern
- Authentication and authorisation approach
- Payout and session invariants
- Trade-offs and what would change at 10x scale

---

## Available npm Scripts

### Backend (`/backend`)
```
npm run dev       Start server with nodemon (auto-restart on changes)
npm run start     Start server without nodemon
npm run migrate   Create all database tables
npm run seed      Fill database with test accounts
```

### User App (`/user-app`)
```
npm run dev       Start dev server on port 5173
npm run build     Build for production
```

### Admin App (`/admin-app`)
```
npm run dev       Start dev server on port 5174
npm run build     Build for production
```

## AI Assistance

AI was used to help with code debugging, architecture
guidance, and documentation throughout the project.

All code was reviewed, understood, and manually integrated. The
development environment setup, end-to-end testing, and final
integration were done independently.