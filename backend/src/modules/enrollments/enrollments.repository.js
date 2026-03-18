const pool = require('../../db/database')

const findByStudent = async (studentId) => {
  const { rows } = await pool.query(
    `SELECT e.*, c.title, c.description, c.price, c.status
     FROM enrollments e
     JOIN courses c ON e.course_id = c.id
     WHERE e.student_id = $1
     ORDER BY e.enrolled_at DESC`,
    [studentId]
  )
  return rows
}

const findOne = async (studentId, courseId) => {
  const { rows } = await pool.query(
    'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
    [studentId, courseId]
  )
  return rows[0] || null
}

const create = async (enrollment) => {
  const { rows } = await pool.query(
    'INSERT INTO enrollments (id, student_id, course_id) VALUES ($1,$2,$3) RETURNING *',
    [enrollment.id, enrollment.studentId, enrollment.courseId]
  )
  return rows[0]
}

module.exports = { findByStudent, findOne, create }