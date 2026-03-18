const { error } = require('../utils/response')

// Usage on a route:  requireType('instructor')
//                    requireType('student')
const requireType = (type) => (req, res, next) => {
  if (!req.user || req.user.type !== type) {
    return error(res, `Forbidden — ${type}s only`, 403)
  }
  next()
}

module.exports = { requireType }