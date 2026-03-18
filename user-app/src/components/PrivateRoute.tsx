import { Navigate } from 'react-router-dom'
import { getCurrentUser } from '../services/authService'

interface Props {
  children: React.ReactNode
  requiredType?: 'student' | 'instructor'
}

function PrivateRoute({ children, requiredType }: Props) {
  const user = getCurrentUser()

  // Not logged in — go to login page
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Wrong type — e.g. student trying to access instructor page
  if (requiredType && user.type !== requiredType) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default PrivateRoute