const pool = require('../../db/database')

const findAll = async () => {
  const { rows } = await pool.query(
    "SELECT * FROM courses WHERE status = 'published' ORDER BY created_at DESC"
  )
  return rows
}

const findById = async (id) => {
  const { rows } = await pool.query(
    'SELECT * FROM courses WHERE id = $1', [id]
  )
  return rows[0] || null
}

const findByInstructor = async (instructorId) => {
  const { rows } = await pool.query(
    'SELECT * FROM courses WHERE instructor_id = $1 ORDER BY created_at DESC',
    [instructorId]
  )
  return rows
}

const create = async (course) => {
  const { rows } = await pool.query(
    `INSERT INTO courses (id, instructor_id, title, description, price, status)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [course.id, course.instructorId, course.title, course.description, course.price, 'draft']
  )
  return rows[0]
}

const updateStatus = async (id, status) => {
  const { rows } = await pool.query(
    'UPDATE courses SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  )
  return rows[0]
}

module.exports = { findAll, findById, findByInstructor, create, updateStatus }