const router      = require('express').Router()
const { success, error } = require('../../utils/response')
const { requireAuth }    = require('../../middleware/requireAuth')
const authService        = require('./auth.service')

// POST /auth/register
// Body: { email, password, type }  — type is 'student' or 'instructor'
router.post('/register', async (req, res) => {
  try {
    const data = await authService.register(req.body)
    return success(res, data, 201)
  } catch (err) {
    return error(res, err.message)
  }
})

// POST /auth/login
// Body: { email, password }
// Returns: { token }
router.post('/login', async (req, res) => {
  try {
    const data = await authService.login(req.body)
    return success(res, data)
  } catch (err) {
    return error(res, err.message, 401)
  }
})

// GET /auth/me  — requires token in Authorization header
router.get('/me', requireAuth, async (req, res) => {
  try {
    const data = await authService.getMe(req.user.id)
    return success(res, data)
  } catch (err) {
    return error(res, err.message, 404)
  }
})

module.exports = router