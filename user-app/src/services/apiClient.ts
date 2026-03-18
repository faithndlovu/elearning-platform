import axios from 'axios'

// All API calls go to the backend running on port 3000
const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
})

// Before every request — attach the JWT token if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default apiClient