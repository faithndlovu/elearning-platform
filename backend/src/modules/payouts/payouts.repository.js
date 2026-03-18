const pool = require('../../db/database')

const findByInstructor = async (instructorId) => {
  const { rows } = await pool.query(
    'SELECT * FROM payout_requests WHERE instructor_id = $1 ORDER BY requested_at DESC',
    [instructorId]
  )
  return rows
}

const findAll = async (filters = {}) => {
  let query  = 'SELECT * FROM payout_requests WHERE 1=1'
  const vals = []
  let i = 1

  if (filters.status) {
    query += ` AND status = $${i++}`
    vals.push(filters.status)
  }
  if (filters.instructorId) {
    query += ` AND instructor_id = $${i++}`
    vals.push(filters.instructorId)
  }

  query += ' ORDER BY requested_at DESC'
  const { rows } = await pool.query(query, vals)
  return rows
}

const findById = async (id) => {
  const { rows } = await pool.query(
    'SELECT * FROM payout_requests WHERE id = $1', [id]
  )
  return rows[0] || null
}

const create = async (request) => {
  const { rows } = await pool.query(
    `INSERT INTO payout_requests (id, instructor_id, amount, status)
     VALUES ($1,$2,$3,'pending') RETURNING *`,
    [request.id, request.instructorId, request.amount]
  )
  return rows[0]
}

const updateStatus = async (id, status) => {
  const { rows } = await pool.query(
    `UPDATE payout_requests
     SET status = $1, resolved_at = NOW()
     WHERE id = $2 RETURNING *`,
    [status, id]
  )
  return rows[0]
}

module.exports = { findByInstructor, findAll, findById, create, updateStatus }