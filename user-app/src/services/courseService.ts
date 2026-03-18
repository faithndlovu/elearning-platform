import apiClient from './apiClient'

// Get all published courses — public
export const getCourses = () =>
  apiClient.get('/courses')

// Get one course by ID
export const getCourse = (id: string) =>
  apiClient.get(`/courses/${id}`)

// Get instructor's own courses
export const getMyCourses = () =>
  apiClient.get('/courses/mine')

// Create a new course (instructor)
export const createCourse = (data: {
  title: string
  description: string
  price: number
}) => apiClient.post('/courses', data)

// Publish a course
export const publishCourse = (id: string) =>
  apiClient.post(`/courses/${id}/publish`)

// Unpublish a course
export const unpublishCourse = (id: string) =>
  apiClient.post(`/courses/${id}/unpublish`)

// Enroll in a course (student)
export const enrollCourse = (id: string) =>
  apiClient.post(`/courses/${id}/enroll`)

// Create a session inside a course
export const createSession = (courseId: string, data: {
  title: string
  scheduledAt: string
  amount: number
}) => apiClient.post(`/courses/${courseId}/sessions`, data)