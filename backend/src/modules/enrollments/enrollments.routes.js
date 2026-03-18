const router      = require('express').Router()
const { success, error } = require('../../utils/response')
const { requireAuth }    = require('../../middleware/requireAuth')
const { requireType }    = require('../../middleware/requireType')
const enrollService      = require('./enrollments.service')

// GET /me/enrollments — student sees their enrolled courses
router.get('/enrollments', requireAuth, requireType('student'), async (req, res) => {
  try {
    const data = await enrollService.getMyEnrollments(req.user.id)
    return success(res, data)
  } catch (err) {
    return error(res, err.message)
  }
})

module.exports = router


// ─── Also add this to courses.routes.js ──────────────────────────────────────
// POST /courses/:id/enroll — student enrolls in a course
// Add this route inside courses.routes.js:
//
// router.post('/:id/enroll', requireAuth, requireType('student'), async (req, res) => {
//   try {
//     const enrollService = require('../enrollments/enrollments.service')
//     const data = await enrollService.enroll(req.params.id, req.user.id)
//     return success(res, data, 201)
//   } catch (err) {
//     return error(res, err.message)
//   }
// })