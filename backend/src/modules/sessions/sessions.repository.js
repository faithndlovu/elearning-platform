const pool = require('../../db/database')

const findByInstructor = async (instructorId) => {
  const { rows } = await pool.query(
    'SELECT * FROM sessions WHERE instructor_id = $1 ORDER BY scheduled_at ASC',
    [instructorId]
  )
  return rows
}

const findByCourse = async (courseId) => {
  const { rows } = await pool.query(
    'SELECT * FROM sessions WHERE course_id = $1 ORDER BY scheduled_at ASC',
    [courseId]
  )
  return rows
}

const findById = async (id) => {
  const { rows } = await pool.query(
    'SELECT * FROM sessions WHERE id = $1', [id]
  )
  return rows[0] || null
}

const create = async (session) => {
  const { rows } = await pool.query(
    `INSERT INTO sessions (id, course_id, instructor_id, title, scheduled_at, amount)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [session.id, session.courseId, session.instructorId,
     session.title, session.scheduledAt, session.amount]
  )
  return rows[0]
}

const markCompleted = async (id) => {
  const { rows } = await pool.query(
    "UPDATE sessions SET status = 'completed' WHERE id = $1 RETURNING *",
    [id]
  )
  return rows[0]
}

// Get completed sessions not yet paid out — used for balance calculation
const findEligible = async (instructorId) => {
  const { rows } = await pool.query(
    `SELECT * FROM sessions
     WHERE instructor_id = $1
     AND status = 'completed'
     AND paid_out = false`,
    [instructorId]
  )
  return rows
}

// Mark sessions as paid after payout is approved
const markAsPaidOut = async (instructorId) => {
  await pool.query(
    `UPDATE sessions
     SET paid_out = true
     WHERE instructor_id = $1
     AND status = 'completed'
     AND paid_out = false`,
    [instructorId]
  )
}

module.exports = {
  findByInstructor, findByCourse, findById,
  create, markCompleted, findEligible, markAsPaidOut
}