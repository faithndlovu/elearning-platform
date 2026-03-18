import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register, getCurrentUser } from '../../services/authService'
import { login } from '../../services/authService'

function Register() {
  const navigate  = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [type,     setType]     = useState<'student'|'instructor'>('student')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Register the account
      await register({ email, password, type })

      // Auto login after registration
      const res = await login({ email, password })
      localStorage.setItem('token', res.data.data.token)

      // Redirect based on type
      if (type === 'student') {
        navigate('/student/courses')
      } else {
        navigate('/instructor/courses')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f6fa' }}>
      <div style={{ width:'100%', maxWidth:'400px', padding:'0 1rem' }}>
        <div className="card" style={{ padding:'2rem' }}>
          <h1 style={{ fontSize:'22px', fontWeight:600, color:'#1A3A5C', marginBottom:'0.25rem' }}>
            Create account
          </h1>
          <p style={{ color:'#666', fontSize:'14px', marginBottom:'1.5rem' }}>
            Join as a student or instructor
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>I am a...</label>
              <div style={{ display:'flex', gap:'1rem', marginTop:'4px' }}>
                {(['student','instructor'] as const).map(t => (
                  <label key={t} style={{ display:'flex', alignItems:'center', gap:'6px', cursor:'pointer', fontSize:'14px' }}>
                    <input
                      type="radio"
                      name="type"
                      value={t}
                      checked={type === t}
                      onChange={() => setType(t)}
                      style={{ width:'auto' }}
                    />
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </label>
                ))}
              </div>
            </div>

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
                placeholder="Choose a password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width:'100%', padding:'10px', fontSize:'15px', marginTop:'0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'14px', color:'#666' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'#1A3A5C', fontWeight:500 }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register