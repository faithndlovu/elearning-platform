import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login, getCurrentUser } from '../../services/authService'

function Login() {
  const navigate  = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await login({ email, password })
      // Save token to localStorage
      localStorage.setItem('token', res.data.data.token)

      // Decode token to find out user type and redirect accordingly
      const user = getCurrentUser()
      if (user?.type === 'student') {
        navigate('/student/courses')
      } else if (user?.type === 'instructor') {
        navigate('/instructor/courses')
      } else if (user?.role === 'admin') {
        // Admin uses a different app — just show message
        setError('Admin accounts use the admin portal, not this app.')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f6fa' }}>
      <div style={{ width:'100%', maxWidth:'400px', padding:'0 1rem' }}>

        <div className="card" style={{ padding:'2rem' }}>
          <h1 style={{ fontSize:'22px', fontWeight:600, color:'#1A3A5C', marginBottom:'0.25rem' }}>
            Welcome back
          </h1>
          <p style={{ color:'#666', fontSize:'14px', marginBottom:'1.5rem' }}>
            Log in to your account
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width:'100%', padding:'10px', fontSize:'15px', marginTop:'0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'14px', color:'#666' }}>
            No account?{' '}
            <Link to="/register" style={{ color:'#1A3A5C', fontWeight:500 }}>Create one</Link>
          </p>
        </div>

        <p style={{ textAlign:'center', fontSize:'12px', color:'#999', marginTop:'1rem' }}>
          Test: student@app.com / instructor@app.com — password: password
        </p>
      </div>
    </div>
  )
}

export default Login