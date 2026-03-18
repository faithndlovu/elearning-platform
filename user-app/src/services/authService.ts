import apiClient from './apiClient'

// Register a new account
export const register = (data: {
  email: string
  password: string
  type: 'student' | 'instructor'
}) => apiClient.post('/auth/register', data)

// Login — returns { token }
export const login = (data: {
  email: string
  password: string
}) => apiClient.post('/auth/login', data)

// Get current logged-in user
export const getMe = () => apiClient.get('/auth/me')

// Logout — just remove the token from localStorage
export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

// Decode JWT to get user info without an API call
export const getCurrentUser = () => {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    // Check token is not expired
    if (payload.exp * 1000 < Date.now()) {
      logout()
      return null
    }
    return payload as { id: string; role: string; type: string }
  } catch {
    return null
  }
}