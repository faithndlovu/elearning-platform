const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const { v4: uuid } = require('uuid')
const repo   = require('./auth.repository')
const SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'

// Register a new student or instructor
const register = async ({ email, password, type }) => {
  if (!email || !password || !type) {
    throw new Error('Email, password and type are required')
  }
  if (!['student', 'instructor'].includes(type)) {
    throw new Error('Type must be student or instructor')
  }

  const existing = await repo.findByEmail(email)
  if (existing) throw new Error('Email already registered')

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await repo.create({
    id: uuid(),
    email,
    passwordHash,
    role: 'user',
    type
  })
  return user
}

// Login — returns a JWT token
const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error('Email and password are required')
  }

  const user = await repo.findByEmail(email)
  if (!user) throw new Error('Invalid email or password')

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) throw new Error('Invalid email or password')

  const token = jwt.sign(
    { id: user.id, role: user.role, type: user.type },
    SECRET,
    { expiresIn: '7d' }
  )
  return { token }
}

// Get currently logged-in user
const getMe = async (userId) => {
  const user = await repo.findById(userId)
  if (!user) throw new Error('User not found')
  return user
}

module.exports = { register, login, getMe }