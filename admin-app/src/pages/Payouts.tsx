import { useEffect, useState } from 'react'
import { logout } from '../services/authService'
import { getAllRequests, approveRequest, rejectRequest } from '../services/payoutService'

interface PayoutRequest {
  id: string
  instructor_id: string
  amount: number
  status: string
  requested_at: string
  resolved_at: string | null
}

function Payouts() {
  const [requests, setRequests] = useState<PayoutRequest[]>([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('')
  const [message,  setMessage]  = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [acting,   setActing]   = useState<string | null>(null)

  const load = (status = filter) => {
    setLoading(true)
    getAllRequests(status ? { status } : {})
      .then(res => setRequests(res.data.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleFilter = (s: string) => { setFilter(s); load(s) }

  const handle = async (id: string, action: 'approve' | 'reject') => {
    setActing(id)
    setMessage(null)
    try {
      if (action === 'approve') await approveRequest(id)
      else await rejectRequest(id)
      setMessage({ text: `Request ${action}d successfully.`, type: 'success' })
      load()
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || 'Action failed', type: 'error' })
    } finally { setActing(null) }
  }

  const pending  = requests.filter(r => r.status === 'pending')
  const resolved = requests.filter(r => r.status !== 'pending')

  const statusBadge = (s: string) =>
    s === 'approved' ? 'badge-green' :
    s === 'rejected' ? 'badge-red'   : 'badge-orange'

  return (
    <>
      <nav className="navbar">
        <span className="navbar-brand">Admin Portal — Payout Requests</span>
        <button className="btn btn-outline"
          style={{ color:'#fff', borderColor:'rgba(255,255,255,0.4)', padding:'5px 14px', fontSize:'13px' }}
          onClick={logout}>
          Logout
        </button>
      </nav>

      <div className="page">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' }}>
          <h1 className="page-title" style={{ margin:0 }}>Payout Requests</h1>
          <div style={{ display:'flex', gap:'6px' }}>
            {['', 'pending', 'approved', 'rejected'].map(s => (
              <button key={s}
                className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => handleFilter(s)}>
                {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
        {loading && <p style={{ color:'#666' }}>Loading requests...</p>}

        {/* Pending — needs action */}
        {!loading && pending.length > 0 && (
          <>
            <h2 style={{ fontSize:'15px', fontWeight:600, color:'#444', marginBottom:'0.75rem' }}>
              Needs your action ({pending.length})
            </h2>
            {pending.map(r => (
              <div key={r.id} className="card"
                style={{ borderLeft:'4px solid #f59e0b', borderRadius:'0 10px 10px 0' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
                  <div>
                    <p style={{ fontWeight:700, fontSize:'22px', color:'#2C1A5C', marginBottom:'4px' }}>
                      ${parseFloat(String(r.amount)).toFixed(2)}
                    </p>
                    <p style={{ fontSize:'12px', color:'#888', marginBottom:'2px' }}>
                      Instructor ID: {r.instructor_id}
                    </p>
                    <p style={{ fontSize:'12px', color:'#888' }}>
                      Requested: {new Date(r.requested_at).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button className="btn btn-success"
                      onClick={() => handle(r.id, 'approve')}
                      disabled={acting === r.id}>
                      {acting === r.id ? '...' : 'Approve'}
                    </button>
                    <button className="btn btn-danger"
                      onClick={() => handle(r.id, 'reject')}
                      disabled={acting === r.id}>
                      {acting === r.id ? '...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Resolved */}
        {!loading && resolved.length > 0 && (
          <>
            <h2 style={{ fontSize:'15px', fontWeight:600, color:'#444', margin:'1.5rem 0 0.75rem' }}>
              Resolved ({resolved.length})
            </h2>
            {resolved.map(r => (
              <div key={r.id} className="card" style={{ opacity:0.8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <p style={{ fontWeight:600, fontSize:'17px', color:'#333', marginBottom:'4px' }}>
                      ${parseFloat(String(r.amount)).toFixed(2)}
                    </p>
                    <p style={{ fontSize:'12px', color:'#888', marginBottom:'2px' }}>
                      Instructor ID: {r.instructor_id}
                    </p>
                    <p style={{ fontSize:'12px', color:'#888' }}>
                      Requested: {new Date(r.requested_at).toLocaleDateString()}
                      {r.resolved_at && ` · Resolved: ${new Date(r.resolved_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <span className={`badge ${statusBadge(r.status)}`}>
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Empty state */}
        {!loading && requests.length === 0 && (
          <div className="card" style={{ textAlign:'center', padding:'3rem', color:'#888' }}>
            No payout requests found.
          </div>
        )}
      </div>
    </>
  )
}
export default Payouts