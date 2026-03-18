import { Link } from 'react-router-dom'
import { logout, getCurrentUser } from '../services/authService'

function Navbar() {
  const user = getCurrentUser()

  return (
    <nav className="navbar">
      <span className="navbar-brand">E-Learning Platform</span>

      <div className="navbar-links">
        {user?.type === 'student' && (
          <>
            <Link to="/student/courses">Browse Courses</Link>
            <Link to="/student/my-courses">My Courses</Link>
          </>
        )}

        {user?.type === 'instructor' && (
          <>
            <Link to="/instructor/courses">My Courses</Link>
            <Link to="/instructor/sessions">Sessions</Link>
            <Link to="/instructor/payouts">Payouts</Link>
          </>
        )}

        <button
          className="btn btn-outline"
          style={{ color:'#fff', borderColor:'rgba(255,255,255,0.5)', padding:'5px 14px', fontSize:'13px' }}
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar