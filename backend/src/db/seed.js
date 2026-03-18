const pool   = require('./database')
const bcrypt = require('bcryptjs')
const { v4: uuid } = require('uuid')

async function seed() {
  const { rows } = await pool.query('SELECT COUNT(*) FROM users')
  if (parseInt(rows[0].count) > 0) {
    console.log('Already seeded — skipping')
    process.exit(0)
  }

  const hash = (p) => bcrypt.hashSync(p, 10)

  // Admin
  await pool.query(
    `INSERT INTO users (id, email, password_hash, role, type)
     VALUES ($1,$2,$3,$4,$5)`,
    [uuid(), 'admin@app.com', hash('password'), 'admin', null]
  )

  // Instructor
  const instructorId = uuid()
  await pool.query(
    `INSERT INTO users (id, email, password_hash, role, type)
     VALUES ($1,$2,$3,$4,$5)`,
    [instructorId, 'instructor@app.com', hash('password'), 'user', 'instructor']
  )

  // Student
  await pool.query(
    `INSERT INTO users (id, email, password_hash, role, type)
     VALUES ($1,$2,$3,$4,$5)`,
    [uuid(), 'student@app.com', hash('password'), 'user', 'student']
  )

  // Course
  const courseId = uuid()
  await pool.query(
    `INSERT INTO courses (id, instructor_id, title, description, price, status)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [courseId, instructorId, 'Intro to Node.js', 'Learn Node from scratch', 49.99, 'published']
  )

  console.log('Seeded successfully!')
  console.log('Login credentials:')
  console.log('  admin@app.com       / password  (role: admin)')
  console.log('  instructor@app.com  / password  (type: instructor)')
  console.log('  student@app.com     / password  (type: student)')
  process.exit(0)
}

seed().catch(err => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
