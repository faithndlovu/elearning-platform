import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import { getBalance, requestPayout, getPayoutRequests } from '../../services/payoutService'

interface Balance { balance: number; eligibleSessions: number }
interface PayoutRequest {
  id: string; amount: number; status: string; requested_at: string; resolved_at: string | null
}

function InstructorPayouts() {
  const [balance,    setBalance]    = useState<Balance|null>(null)
  const [requests,   setRequests]   = useState<PayoutRequest[]>([])
  const [loading,    setLoading]    = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [message,    setMessage]    = useState<{text:string,type:'success'|'error'}|null>(null)

  const load = () => {
    Promise.all([getBalance(), getPayoutRequests()])
      .then(([b, r]) => {
        setBalance(b.data.data)
        setRequests(r.data.data)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleRequest = async () => {
    setRequesting(true)
    setMessage(null)
    try {
      await requestPayout()
      setMessage({ text:'Payout request submitted! An admin will review it shortly.', type:'success' })
      load()
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || 'Failed', type:'error' })
    } finally { setRequesting(false) }
  }

  const statusColor = (s: string) =>
    s === 'approved' ? 'badge-green' :
    s === 'rejected' ? 'badge badge-gray' :
    'badge-orange'

  return (
    <>
      <Navbar />
      <div className="page">
        <h1 className="page-title">Payouts</h1>

        {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

        {/* Balance card */}
        {loading ? (
          <p style={{ color:'#666' }}>Loading...</p>
        ) : (
          <div className="card" style={{ marginBottom:'1.5rem', borderColor:'#0F6E56' }}>
            <p style={{ fontSize:'13px', color:'#666', marginBottom:'6px' }}>Your virtual balance</p>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
              <div>
                <span style={{ fontSize:'38px', fontWeight:700, color:'#0F6E56' }}>
                  ${balance?.balance.toFixed(2) ?? '0.00'}
                </span>
                <p style={{ fontSize:'13px', color:'#666', marginTop:'4px' }}>
                  From {balance?.eligibleSessions ?? 0} completed unpaid session(s)
                </p>
              </div>
              <button
                className="btn btn-success"
                onClick={handleRequest}
                disabled={requesting || !balance || balance.balance === 0}
              >
                {requesting ? 'Submitting...' : 'Request Payout'}
              </button>
            </div>
          </div>
        )}

        {/* Payout history */}
        <h2 style={{ fontSize:'16px', fontWeight:600, color:'#444', marginBottom:'0.75rem' }}>
          Payout History
        </h2>

        {requests.length === 0 && (
          <div className="card" style={{ textAlign:'center', padding:'2rem', color:'#666' }}>
            No payout requests yet.
          </div>
        )}

        {requests.map(r => (
          <div key={r.id} className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <p style={{ fontWeight:600, color:'#1A3A5C', fontSize:'16px', marginBottom:'4px' }}>
                  ${parseFloat(String(r.amount)).toFixed(2)}
                </p>
                <p style={{ fontSize:'13px', color:'#666' }}>
                  Requested: {new Date(r.requested_at).toLocaleDateString()}
                </p>
                {r.resolved_at && (
                  <p style={{ fontSize:'13px', color:'#666' }}>
                    Resolved: {new Date(r.resolved_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <span className={`badge ${statusColor(r.status)}`}>
                {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default InstructorPayouts