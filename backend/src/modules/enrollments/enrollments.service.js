const { v4: uuid } = require('uuid')
const repo       = require('./enrollments.repository')
const courseRepo = require('../courses/courses.repository')

const enroll = async (courseId, studentId) => {
  // Check course exists and is published
  const course = await courseRepo.findById(courseId)
  if (!course) throw new Error('Course not found')
  if (course.status !== 'published') {
    throw new Error('Cannot enroll in an unpublished course')
  }

  // Check not already enrolled
  const existing = await repo.findOne(studentId, courseId)
  if (existing) throw new Error('Already enrolled in this course')

  return repo.create({ id: uuid(), studentId, courseId })
}

const getMyEnrollments = async (studentId) => {
  return repo.findByStudent(studentId)
}

module.exports = { enroll, getMyEnrollments }