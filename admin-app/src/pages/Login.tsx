import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, getCurrentAdmin } from '../services/authService'

function Login() {
  const navigate  = useNavigate()
  const [email,    setEmail]    = useState('admin@app.com')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login({ email, password })
      localStorage.setItem('admin_token', res.data.data.token)
      const admin = getCurrentAdmin()
      if (admin?.role !== 'admin') {
        localStorage.removeItem('admin_token')
        setError('This portal is for admin accounts only.')
        return
      }
      navigate('/payouts')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f6fa' }}>
      <div style={{ width:'100%', maxWidth:'380px', padding:'0 1rem' }}>
        <div className="card" style={{ padding:'2rem' }}>
          <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
            <div style={{ width:'52px', height:'52px', background:'#2C1A5C', borderRadius:'12px',
              display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:'12px' }}>
              <span style={{ color:'#fff', fontSize:'22px', fontWeight:700 }}>A</span>
            </div>
            <h1 style={{ fontSize:'20px', fontWeight:600, color:'#2C1A5C' }}>Admin Portal</h1>
            <p style={{ color:'#888', fontSize:'13px', marginTop:'4px' }}>E-Learning Platform</p>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary"
              style={{ width:'100%', padding:'10px', fontSize:'15px' }}
              disabled={loading}>
              {loading ? 'Logging in...' : 'Log in as Admin'}
            </button>
          </form>
        </div>
        <p style={{ textAlign:'center', fontSize:'12px', color:'#999', marginTop:'1rem' }}>
          Test: admin@app.com / password
        </p>
      </div>
    </div>
  )
}
export default Login