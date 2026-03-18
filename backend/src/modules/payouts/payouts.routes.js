const router      = require('express').Router()
const { success, error } = require('../../utils/response')
const { requireAuth }    = require('../../middleware/requireAuth')
const { requireRole }    = require('../../middleware/requireRole')
const { requireType }    = require('../../middleware/requireType')
const payoutService      = require('./payouts.service')

// GET /payouts/balance — instructor sees their virtual balance
router.get('/balance', requireAuth, requireType('instructor'), async (req, res) => {
  try {
    const data = await payoutService.getBalance(req.user.id)
    return success(res, data)
  } catch (err) {
    return error(res, err.message)
  }
})

// POST /payouts/requests — instructor requests a payout
router.post('/requests', requireAuth, requireType('instructor'), async (req, res) => {
  try {
    const data = await payoutService.requestPayout(req.user.id)
    return success(res, data, 201)
  } catch (err) {
    return error(res, err.message)
  }
})

// GET /payouts/requests
// Instructor: sees their own | Admin: sees all (filter by ?status=pending)
router.get('/requests', requireAuth, async (req, res) => {
  try {
    const user = { ...req.user, filters: req.query }
    const data = await payoutService.getRequests(user)
    return success(res, data)
  } catch (err) {
    return error(res, err.message)
  }
})

// POST /payouts/requests/:id/approve — admin only
router.post('/requests/:id/approve', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const data = await payoutService.approve(req.params.id)
    return success(res, data)
  } catch (err) {
    return error(res, err.message)
  }
})

// POST /payouts/requests/:id/reject — admin only
router.post('/requests/:id/reject', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const data = await payoutService.reject(req.params.id)
    return success(res, data)
  } catch (err) {
    return error(res, err.message)
  }
})

module.exports = router