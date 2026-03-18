const { v4: uuid }  = require('uuid')
const repo         = require('./payouts.repository')
const sessionRepo  = require('../sessions/sessions.repository')
const logger       = require('../../utils/logger')

// Balance = sum of completed sessions not yet paid out
const getBalance = async (instructorId) => {
  const sessions = await sessionRepo.findEligible(instructorId)
  const balance  = sessions.reduce((sum, s) => sum + parseFloat(s.amount), 0)
  return {
    balance:           parseFloat(balance.toFixed(2)),
    eligibleSessions:  sessions.length
  }
}

// Instructor requests a payout — snapshots current balance
const requestPayout = async (instructorId) => {
  const { balance } = await getBalance(instructorId)

  if (balance === 0) {
    throw new Error('No balance available to request payout')
  }

  const request = await repo.create({
    id:           uuid(),
    instructorId,
    amount:       balance
  })

  logger.info(`Payout requested: instructor=${instructorId} amount=${balance}`)
  return request
}

const getRequests = async (user) => {
  // Admins see all requests (with optional filters)
  if (user.role === 'admin') {
    return repo.findAll(user.filters || {})
  }
  // Instructors see only their own
  return repo.findByInstructor(user.id)
}

// Admin approves — marks sessions as paid so they leave the balance
const approve = async (requestId) => {
  const request = await repo.findById(requestId)
  if (!request) throw new Error('Payout request not found')
  if (request.status !== 'pending') {
    throw new Error('Request has already been resolved')
  }

  // Mark the request approved
  const updated = await repo.updateStatus(requestId, 'approved')

  // KEY STEP: mark all eligible sessions as paid out
  // Without this, they would appear in the balance again next time
  await sessionRepo.markAsPaidOut(request.instructor_id)

  logger.info(`Payout approved: requestId=${requestId} amount=${request.amount}`)
  return updated
}

// Admin rejects — sessions remain unpaid so they stay in the balance
const reject = async (requestId) => {
  const request = await repo.findById(requestId)
  if (!request) throw new Error('Payout request not found')
  if (request.status !== 'pending') {
    throw new Error('Request has already been resolved')
  }

  const updated = await repo.updateStatus(requestId, 'rejected')
  logger.info(`Payout rejected: requestId=${requestId}`)
  return updated
}

module.exports = { getBalance, requestPayout, getRequests, approve, reject }