# ARCHITECTURE.md

## Overview

This is a mini e-learning platform built with a Node.js/Express backend,
a React user app (students + instructors), and a React admin app.
Everything runs locally. No external services are used.

---

## 1. Module Boundaries and Dependencies

The backend is organised into feature modules. Each module owns
one domain area and has no knowledge of other modules except
through their service layer.

### Modules

| Module | Owns | Depends On |
|--------|------|------------|
| auth | users table, JWT creation | nothing |
| courses | courses table | nothing |
| sessions | sessions table | courses (ownership check) |
| enrollments | enrollments table | courses (published check) |
| payouts | payout_requests table | sessions (balance + markAsPaidOut) |

### The 3-Layer Rule

Every module is split into exactly 3 files:
```
routes.js      → handles HTTP only. Calls service. Returns response.
service.js     → all business logic and rules. Calls repository.
repository.js  → database queries only. No logic.
```

The dependency direction is always:
```
routes → service → repository → database
```

This direction never reverses. A route never touches the database
directly. A repository never contains business logic.

### Shared utilities

- `src/utils/response.js` — unified JSON response format used by all routes
- `src/utils/logger.js` — structured logging for key business events
- `src/middleware/` — reusable auth and authorisation middleware

---

## 2. Auth and Authorisation Approach

### Authentication

JWT (JSON Web Token) based authentication. On login the server
signs a token containing `{ id, role, type }` with a secret key.
The token expires after 7 days. The client stores it in
localStorage and sends it as `Authorization: Bearer <token>`
on every protected request.

No sessions, no database lookups per request. The token is
self-contained.

### Authorisation

Three composable middleware functions handle all access control:
```
requireAuth          → verifies the JWT token is valid and not expired
                       sets req.user = { id, role, type }

requireRole('admin') → checks req.user.role === 'admin'
                       blocks anyone who is not an admin

requireType('instructor') → checks req.user.type === 'instructor'
requireType('student')    → checks req.user.type === 'student'
```

These are stacked on routes as needed:
```js
// Public — no middleware
router.get('/courses', handler)

// Must be logged in
router.get('/auth/me', requireAuth, handler)

// Must be logged in and be an instructor
router.post('/courses', requireAuth, requireType('instructor'), handler)

// Must be logged in and be an admin
router.post('/payouts/requests/:id/approve',
  requireAuth, requireRole('admin'), handler)
```

Authorisation is declared at the route level, not scattered
inside handler functions. This makes it easy to see what
protection each route has at a glance.

### User roles and types
```
role: 'admin'  → can approve/reject payouts. Uses admin app.
role: 'user'   → everyone else. Uses user app.

type: 'instructor' → can create courses, add sessions, request payouts
type: 'student'    → can browse courses, enroll, view enrollments
type: null         → admins have no type
```

---

## 3. Payout and Session Invariants

### How the virtual balance works

The balance is calculated dynamically — it is never stored.
Every time the balance is requested, this query runs:
```sql
SELECT * FROM sessions
WHERE instructor_id = $1
AND   status        = 'completed'
AND   paid_out      = false
```

Balance = SUM of the `amount` field across all rows returned.

### The payout flow
```
1. Instructor marks session as completed
   → sessions.status = 'completed'

2. Instructor views balance
   → calculated from completed + unpaid sessions

3. Instructor requests payout
   → payout_requests row created with amount snapshot
   → amount is frozen at request time

4a. Admin APPROVES
    → payout_requests.status = 'approved'
    → ALL eligible sessions: paid_out = true
    → sessions no longer appear in balance calculation

4b. Admin REJECTS
    → payout_requests.status = 'rejected'
    → sessions unchanged — still paid_out = false
    → they remain in the balance for the next request
```

### The key invariant

When a payout is approved, the service atomically performs
two operations:
```js
await repo.updateStatus(requestId, 'approved')
await sessionRepo.markAsPaidOut(request.instructor_id)
```

This ensures sessions are NEVER counted in the balance twice.
If only the first operation ran (approved but not marked paid),
the instructor could request the same money again. Both must
succeed or neither counts.

### Ownership enforcement

Every mutation checks ownership before proceeding:

- Instructor can only publish their OWN courses
- Instructor can only add sessions to their OWN courses
- Instructor can only mark their OWN sessions as complete
- Balance and payout requests are always scoped to the requesting instructor

---

## 4. Cross-Cutting Concerns

### Unified response format

Every API response uses the same shape:
```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": "message here" }
```

This is enforced through `src/utils/response.js` which is
imported by every route file. The frontend can always check
`response.data.success` to know if the call worked.

### Error handling

A global error handler is registered at the bottom of `app.js`:
```js
app.use((err, req, res, next) => {
  console.error(err.message)
  res.status(500).json({ success: false, error: 'Internal server error' })
})
```

Individual routes use try/catch and call `error(res, message)`
for expected errors. Unexpected crashes fall through to the
global handler so the API always returns JSON, never crashes
with an HTML error page.

### Logging

Winston is used for structured logging of key business events:
```
[2025-03-14T10:22:01] INFO: Payout requested: instructor=abc amount=250
[2025-03-14T10:25:33] INFO: Payout APPROVED: requestId=xyz amount=250
[2025-03-14T10:26:01] INFO: Payout REJECTED: requestId=abc
```

HTTP request logging is handled by nodemon output in development.

### Input validation

Validation happens in the service layer before any database
call is made. Required fields are checked and meaningful error
messages are thrown. This keeps validation close to the
business rules rather than in the HTTP layer.

---

## 5. Trade-offs and What I Would Change at 10x Scale

### Current trade-offs

| Decision | Why | Limitation |
|----------|-----|------------|
| PostgreSQL with raw pg queries | Simple, no ORM complexity | More verbose, no type safety on queries |
| JWT stateless auth | No DB lookup per request | Cannot invalidate tokens before expiry |
| Virtual balance calculated on demand | Always accurate | Slower at scale with millions of sessions |
| In-process everything | Simple to run locally | Cannot scale horizontally without changes |

### What I would change at 10x scale

**1. Add an ORM (Prisma or TypeORM)**
Raw SQL queries work but at scale you want type-safe queries,
auto-generated migrations, and better refactoring support.

**2. Add a refresh token system**
Currently a stolen JWT is valid for 7 days with no way to
revoke it. At scale: short-lived access tokens (15 min) +
long-lived refresh tokens stored in the database so they can
be revoked.

**3. Cache the balance calculation**
At 10x sessions per instructor, recalculating the balance
from a full table scan on every request is slow. Cache the
balance in Redis, invalidate when a session is completed
or a payout is approved.

**4. Use database transactions for payout approval**
Currently the two operations in `approve()` (update request +
mark sessions paid) are two separate queries. If the server
crashes between them, the data is inconsistent. Wrap them
in a PostgreSQL transaction so both succeed or both fail.

**5. Add a job queue for long operations**
If the app grew to include video processing or email
notifications, these should run in a background queue
(Bull/BullMQ with Redis) rather than in the HTTP request cycle.

**6. Separate read and write models (CQRS)**
The balance calculation is a read concern, payout approval
is a write concern. Separating these would allow the read
side to be optimised independently (read replicas, caching)
without affecting write performance.

**7. Extract modules into microservices if teams grow**
The module boundaries are already clean. If different teams
own auth, courses, and payouts, extracting them into separate
services with their own databases would allow independent
deployment and scaling.