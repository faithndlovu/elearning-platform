import apiClient from './apiClient'

// Get all sessions for the logged-in instructor
export const getMySessions = () =>
  apiClient.get('/sessions')

// Mark a session as completed
export const completeSession = (id: string) =>
  apiClient.post(`/sessions/${id}/complete`)