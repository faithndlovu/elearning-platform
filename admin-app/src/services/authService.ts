import apiClient from './apiClient'

export const login = (data: { email: string; password: string }) =>
  apiClient.post('/auth/login', data)

export const logout = () => {
  localStorage.removeItem('admin_token')
  window.location.href = '/login'
}

export const getCurrentAdmin = () => {
  const token = localStorage.getItem('admin_token')
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp * 1000 < Date.now()) { logout(); return null }
    return payload as { id: string; role: string }
  } catch { return null }
}