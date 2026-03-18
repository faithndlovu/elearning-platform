import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import { getMySessions, completeSession } from '../../services/sessionService'

interface Session {
  id: string; title: string; course_id: string
  scheduled_at: string; status: string
  paid_out: boolean; amount: number
}

function InstructorSessions() {
  const [sessions,   setSessions]   = useState<Session[]>([])
  const [loading,    setLoading]    = useState(true)
  const [completing, setCompleting] = useState<string|null>(null)
  const [message,    setMessage]    = useState<{text:string,type:'success'|'error'}|null>(null)

  const load = () => {
    getMySessions()
      .then(res => setSessions(res.data.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleComplete = async (id: string) => {
    setCompleting(id)
    setMessage(null)
    try {
      await completeSession(id)
      setMessage({ text:'Session marked as completed! It will now count toward your balance.', type:'success' })
      load()
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || 'Failed', type:'error' })
    } finally { setCompleting(null) }
  }

  const scheduled  = sessions.filter(s => s.status === 'scheduled')
  const completed  = sessions.filter(s => s.status === 'completed')

  return (
    <>
      <Navbar />
      <div className="page">
        <h1 className="page-title">My Sessions</h1>

        {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
        {loading && <p style={{ color:'#666' }}>Loading...</p>}

        {/* Upcoming sessions */}
        {scheduled.length > 0 && (
          <>
            <h2 style={{ fontSize:'16px', fontWeight:600, color:'#444', marginBottom:'0.75rem' }}>
              Upcoming ({scheduled.length})
            </h2>
            {scheduled.map(s => (
              <div key={s.id} className="card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <p style={{ fontWeight:600, color:'#1A3A5C', marginBottom:'4px' }}>{s.title}</p>
                    <p style={{ fontSize:'13px', color:'#666' }}>
                      {new Date(s.scheduled_at).toLocaleString()}
                    </p>
                    <p style={{ fontSize:'13px', color:'#0F6E56', fontWeight:500, marginTop:'4px' }}>
                      Fee: ${parseFloat(String(s.amount)).toFixed(2)}
                    </p>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px' }}>
                    <span className="badge badge-blue">Scheduled</span>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleComplete(s.id)}
                      disabled={completing === s.id}
                    >
                      {completing === s.id ? 'Saving...' : 'Mark Complete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Completed sessions */}
        {completed.length > 0 && (
          <>
            <h2 style={{ fontSize:'16px', fontWeight:600, color:'#444', margin:'1.5rem 0 0.75rem' }}>
              Completed ({completed.length})
            </h2>
            {completed.map(s => (
              <div key={s.id} className="card" style={{ opacity:0.8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <p style={{ fontWeight:600, color:'#333', marginBottom:'4px' }}>{s.title}</p>
                    <p style={{ fontSize:'13px', color:'#666' }}>
                      {new Date(s.scheduled_at).toLocaleString()}
                    </p>
                    <p style={{ fontSize:'13px', color:'#0F6E56', fontWeight:500, marginTop:'4px' }}>
                      Fee: ${parseFloat(String(s.amount)).toFixed(2)}
                    </p>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'6px' }}>
                    <span className="badge badge-green">Completed</span>
                    {s.paid_out
                      ? <span className="badge badge-gray">Paid out</span>
                      : <span className="badge badge-orange">Pending payout</span>
                    }
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {!loading && sessions.length === 0 && (
          <div className="card" style={{ textAlign:'center', padding:'3rem', color:'#666' }}>
            No sessions yet. Add sessions to your courses first.
          </div>
        )}
      </div>
    </>
  )
}

export default InstructorSessions