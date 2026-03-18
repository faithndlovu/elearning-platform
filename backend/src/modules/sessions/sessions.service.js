const { v4: uuid } = require('uuid')
const repo       = require('./sessions.repository')
const courseRepo = require('../courses/courses.repository')

const getByInstructor = async (instructorId) => {
  return repo.findByInstructor(instructorId)
}

const create = async ({ title, scheduledAt, amount }, courseId, instructorId) => {
  if (!title || !scheduledAt) {
    throw new Error('Title and scheduledAt are required')
  }

  // Confirm the course belongs to this instructor
  const course = await courseRepo.findById(courseId)
  if (!course) throw new Error('Course not found')
  if (course.instructor_id !== instructorId) {
    throw new Error('You do not own this course')
  }

  return repo.create({
    id: uuid(),
    courseId,
    instructorId,
    title,
    scheduledAt,
    amount: amount || 0
  })
}

const complete = async (sessionId, instructorId) => {
  const session = await repo.findById(sessionId)
  if (!session) throw new Error('Session not found')
  if (session.instructor_id !== instructorId) {
    throw new Error('You do not own this session')
  }
  if (session.status === 'completed') {
    throw new Error('Session is already completed')
  }
  return repo.markCompleted(sessionId)
}

module.exports = { getByInstructor, create, complete }