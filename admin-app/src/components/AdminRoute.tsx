import { Navigate } from 'react-router-dom'
import { getCurrentAdmin } from '../services/authService'

function AdminRoute({ children }: { children: React.ReactNode }) {
  const admin = getCurrentAdmin()
  if (!admin || admin.role !== 'admin') return <Navigate to="/login" replace />
  return <>{children}</>
}
export default AdminRoute