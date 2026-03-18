const pool = require('./database')

async function migrate() {
  await pool.query(`

    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      email       TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role        TEXT NOT NULL DEFAULT 'user',
      type        TEXT,
      created_at  TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS courses (
      id            TEXT PRIMARY KEY,
      instructor_id TEXT NOT NULL REFERENCES users(id),
      title         TEXT NOT NULL,
      description   TEXT,
      price         NUMERIC DEFAULT 0,
      status        TEXT NOT NULL DEFAULT 'draft',
      created_at    TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id            TEXT PRIMARY KEY,
      course_id     TEXT NOT NULL REFERENCES courses(id),
      instructor_id TEXT NOT NULL REFERENCES users(id),
      title         TEXT NOT NULL,
      scheduled_at  TIMESTAMP NOT NULL,
      status        TEXT NOT NULL DEFAULT 'scheduled',
      paid_out      BOOLEAN DEFAULT FALSE,
      amount        NUMERIC DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id          TEXT PRIMARY KEY,
      student_id  TEXT NOT NULL REFERENCES users(id),
      course_id   TEXT NOT NULL REFERENCES courses(id),
      enrolled_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(student_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS payout_requests (
      id            TEXT PRIMARY KEY,
      instructor_id TEXT NOT NULL REFERENCES users(id),
      amount        NUMERIC NOT NULL,
      status        TEXT NOT NULL DEFAULT 'pending',
      requested_at  TIMESTAMP DEFAULT NOW(),
      resolved_at   TIMESTAMP
    );

  `)

  console.log('Tables created successfully')
  process.exit(0)
}

migrate().catch(err => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})