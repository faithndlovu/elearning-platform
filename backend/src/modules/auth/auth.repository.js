const pool = require('../../db/database')

// Find a user by their email address
const findByEmail = async (email) => {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  )
  return rows[0] || null
}

// Find a user by their ID
const findById = async (id) => {
  const { rows } = await pool.query(
    'SELECT id, email, role, type, created_at FROM users WHERE id = $1',
    [id]
  )
  return rows[0] || null
}

// Save a new user to the database
const create = async (user) => {
  const { rows } = await pool.query(
    `INSERT INTO users (id, email, password_hash, role, type)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, role, type`,
    [user.id, user.email, user.passwordHash, user.role, user.type]
  )
  return rows[0]
}

module.exports = { findByEmail, findById, create }