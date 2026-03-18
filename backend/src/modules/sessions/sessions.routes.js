const router      = require('express').Router()
const { success, error } = require('../../utils/response')
const { requireAuth }    = require('../../middleware/requireAuth')
const { requireType }    = require('../../middleware/requireType')
const sessionService     = require('./sessions.service')

// GET /sessions?instructorId=...
router.get('/', requireAuth, async (req, res) => {
  try {
    const data = await sessionService.getByInstructor(req.user.id)
    return success(res, data)
  } catch (err) {
    return error(res, err.message)
  }
})

// POST /sessions/:id/complete — instructor marks session as done
router.post('/:id/complete', requireAuth, requireType('instructor'), async (req, res) => {
  try {
    const data = await sessionService.complete(req.params.id, req.user.id)
    return success(res, data)
  } catch (err) {
    return error(res, err.message)
  }
})

// POST /courses/:courseId/sessions — create session under a course
// Note: this route is mounted via app.js through courses prefix
router.post('/courses/:courseId/sessions', requireAuth, requireType('instructor'), async (req, res) => {
  try {
    const data = await sessionService.create(req.body, req.params.courseId, req.user.id)
    return success(res, data, 201)
  } catch (err) {
    return error(res, err.message)
  }
})

module.exports = router