const { v4: uuid } = require('uuid')
const repo = require('./courses.repository')

const listPublished = async () => {
  return repo.findAll()
}

const getById = async (id) => {
  const course = await repo.findById(id)
  if (!course) throw new Error('Course not found')
  return course
}

const getMyCoures = async (instructorId) => {
  return repo.findByInstructor(instructorId)
}

const create = async ({ title, description, price }, instructorId) => {
  if (!title) throw new Error('Title is required')
  return repo.create({
    id: uuid(),
    instructorId,
    title,
    description: description || '',
    price:       price || 0
  })
}

const publish = async (courseId, instructorId) => {
  const course = await repo.findById(courseId)
  if (!course) throw new Error('Course not found')
  // Only the owner can publish their own course
  if (course.instructor_id !== instructorId) {
    throw new Error('You do not own this course')
  }
  return repo.updateStatus(courseId, 'published')
}

const unpublish = async (courseId, instructorId) => {
  const course = await repo.findById(courseId)
  if (!course) throw new Error('Course not found')
  if (course.instructor_id !== instructorId) {
    throw new Error('You do not own this course')
  }
  return repo.updateStatus(courseId, 'draft')
}

module.exports = { listPublished, getById, getMyCoures, create, publish, unpublish }