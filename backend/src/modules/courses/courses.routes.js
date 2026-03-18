const router      = require('express').Router()
const { success, error } = require('../../utils/response')
const { requireAuth }    = require('../../middleware/requireAuth')
const { requireType }    = require('../../middleware/requireType')
const courseService      = require('./courses.service')
const enrollService = require('../enrollments/enrollments.service')
const sessionService = require('../sessions/sessions.service')

// GET /courses — public, no login needed  
router.get('/', async (req, res) => {
  try {
    const data = await courseService.listPublished()
    return success(res, data)
  } catch (err) {
    return error(res, err.message)
  }
})

// GET /courses/mine — instructor sees their own courses
router.get('/mine', requireAuth, requireType('instructor'), async (req, res) => {
  try {
    const data = await courseService.getMyCoures(req.user.id)
    return success(res, data)
  } catch (err) {
    return error(res, err.message)
  }
})

// GET /courses/:id — get one course
router.get('/:id', async (req, res) => {
  try {
    const data = await courseService.getById(req.params.id)
    return success(res, data)
  } catch (err) {
    return error(res, err.message, 404)
  }
})

// POST /courses — instructor creates a course
router.post('/', requireAuth, requireType('instructor'), async (req, res) => {
  try {
    const data = await courseService.create(req.body, req.user.id)
    return success(res, data, 201)
  } catch (err) {
    return error(res, err.message)
  }
})

// POST /courses/:id/publish — instructor publishes their course
router.post('/:id/publish', requireAuth, requireType('instructor'), async (req, res) => {
  try {
    const data = await courseService.publish(req.params.id, req.user.id)
    return success(res, data)
  } catch (err) {
    return error(res, err.message, 403)
  }
})

// POST /courses/:id/unpublish
router.post('/:id/unpublish', requireAuth, requireType('instructor'), async (req, res) => {
  try {
    const data = await courseService.unpublish(req.params.id, req.user.id)
    return success(res, data)
  } catch (err) {
    return error(res, err.message, 403)
  }
})

// POST /courses/:id/enroll — student enrolls in a course
router.post('/:id/enroll', requireAuth, requireType('student'), async (req, res) => {
  try {
    const data = await enrollService.enroll(req.params.id, req.user.id)
    return success(res, data, 201)
  } catch (err) {
    return error(res, err.message)
  }
})

// POST /courses/:courseId/sessions — instructor adds a session to a course
router.post('/:courseId/sessions', requireAuth, requireType('instructor'), async (req, res) => {
  try {
    const data = await sessionService.create(req.body, req.params.courseId, req.user.id)
    return success(res, data, 201)
  } catch (err) {
    return error(res, err.message)
  }
})


module.exports = router