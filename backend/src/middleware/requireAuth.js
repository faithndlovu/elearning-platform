const jwt            = require('jsonwebtoken')
const { error }      = require('../utils/response')
const SECRET         = process.env.JWT_SECRET || 'dev-secret-change-in-production'

const requireAuth = (req, res, next) => {
  // Token must be sent as:  Authorization: Bearer <token>
  const header = req.headers['authorization']
  const token  = header && header.split(' ')[1]

  if (!token) {
    return error(res, 'No token — please log in', 401)
  }

  try {
    req.user = jwt.verify(token, SECRET)
    next()   // token is valid — continue to the route handler
  } catch (err) {
    return error(res, 'Invalid or expired token', 401)
  }
}

module.exports = { requireAuth }