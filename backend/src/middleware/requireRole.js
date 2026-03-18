const { error } = require('../utils/response')

// Usage on a route:  requireRole('admin')
const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return error(res, 'Forbidden — admins only', 403)
  }
  next()
}

module.exports = { requireRole }