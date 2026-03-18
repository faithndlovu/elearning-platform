import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import {
  getMyCourses, createCourse,
  publishCourse, unpublishCourse, createSession
} from '../../services/courseService'

interface Course {
  id: string; title: string; description: string
  price: number; status: string
}

function InstructorCourses() {
  const [courses,  setCourses]  = useState<Course[]>([])
  const [loading,  setLoading]  = useState(true)
  const [message,  setMessage]  = useState<{text:string,type:'success'|'error'}|null>(null)

  // New course form
  const [showForm,    setShowForm]    = useState(false)
  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [price,       setPrice]       = useState('')
  const [saving,      setSaving]      = useState(false)

  // Add session form
  const [sessionCourse,   setSessionCourse]   = useState<string|null>(null)
  const [sessionTitle,    setSessionTitle]    = useState('')
  const [sessionDate,     setSessionDate]     = useState('')
  const [sessionAmount,   setSessionAmount]   = useState('')
  const [savingSession,   setSavingSession]   = useState(false)

  const load = () => {
    getMyCourses()
      .then(res => setCourses(res.data.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createCourse({ title, description, price: parseFloat(price) || 0 })
      setMessage({ text:'Course created as draft!', type:'success' })
      setShowForm(false); setTitle(''); setDescription(''); setPrice('')
      load()
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || 'Failed', type:'error' })
    } finally { setSaving(false) }
  }

  const handlePublish = async (id: string, status: string) => {
    try {
      if (status === 'published') await unpublishCourse(id)
      else await publishCourse(id)
      load()
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || 'Failed', type:'error' })
    }
  }

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionCourse) return
    setSavingSession(true)
    try {
      await createSession(sessionCourse, {
        title: sessionTitle,
        scheduledAt: sessionDate,
        amount: parseFloat(sessionAmount) || 0
      })
      setMessage({ text:'Session added!', type:'success' })
      setSessionCourse(null); setSessionTitle(''); setSessionDate(''); setSessionAmount('')
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || 'Failed', type:'error' })
    } finally { setSavingSession(false) }
  }

  return (
    <>
      <Navbar />
      <div className="page">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
          <h1 className="page-title" style={{ margin:0 }}>My Courses</h1>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Course'}
          </button>
        </div>

        {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

        {/* Create course form */}
        {showForm && (
          <div className="card" style={{ marginBottom:'1.5rem', borderColor:'#1A3A5C' }}>
            <h3 style={{ marginBottom:'1rem', color:'#1A3A5C' }}>Create new course</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Title</label>
                <input value={title} onChange={e=>setTitle(e.target.value)} required placeholder="Course title" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={description} onChange={e=>setDescription(e.target.value)}
                  rows={3} style={{ width:'100%', padding:'9px 12px', border:'1px solid #d1d5db', borderRadius:'6px', fontSize:'14px' }}
                  placeholder="What will students learn?" />
              </div>
              <div className="form-group">
                <label>Price ($)</label>
                <input type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="0.00" min="0" step="0.01" />
              </div>
              <button type="submit" className="btn btn-success" disabled={saving}>
                {saving ? 'Saving...' : 'Create Course'}
              </button>
            </form>
          </div>
        )}

        {loading && <p style={{ color:'#666' }}>Loading...</p>}

        {!loading && courses.length === 0 && (
          <div className="card" style={{ textAlign:'center', padding:'3rem', color:'#666' }}>
            You have not created any courses yet. Click "+ New Course" to start.
          </div>
        )}

        {courses.map(course => (
          <div key={course.id} className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
              <div>
                <h3 style={{ fontSize:'16px', fontWeight:600, color:'#1A3A5C', marginBottom:'4px' }}>{course.title}</h3>
                <p style={{ fontSize:'13px', color:'#555' }}>{course.description}</p>
              </div>
              <span className={course.status === 'published' ? 'badge badge-green' : 'badge badge-gray'}>
                {course.status}
              </span>
            </div>

            <div style={{ display:'flex', gap:'8px', marginTop:'12px', flexWrap:'wrap' }}>
              <button
                className={`btn btn-sm ${course.status === 'published' ? 'btn-outline' : 'btn-success'}`}
                onClick={() => handlePublish(course.id, course.status)}
              >
                {course.status === 'published' ? 'Unpublish' : 'Publish'}
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setSessionCourse(course.id)}
              >
                + Add Session
              </button>
            </div>

            {/* Add session form for this course */}
            {sessionCourse === course.id && (
              <form onSubmit={handleAddSession} style={{ marginTop:'1rem', background:'#f5f6fa', padding:'1rem', borderRadius:'8px' }}>
                <p style={{ fontWeight:500, marginBottom:'0.75rem', color:'#1A3A5C', fontSize:'14px' }}>Add session to this course:</p>
                <div className="form-group">
                  <label>Session title</label>
                  <input value={sessionTitle} onChange={e=>setSessionTitle(e.target.value)} required placeholder="e.g. Week 1 — Introduction" />
                </div>
                <div className="form-group">
                  <label>Date and time</label>
                  <input type="datetime-local" value={sessionDate} onChange={e=>setSessionDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Session fee ($)</label>
                  <input type="number" value={sessionAmount} onChange={e=>setSessionAmount(e.target.value)} placeholder="25.00" min="0" step="0.01" />
                </div>
                <div style={{ display:'flex', gap:'8px' }}>
                  <button type="submit" className="btn btn-success btn-sm" disabled={savingSession}>
                    {savingSession ? 'Saving...' : 'Add Session'}
                  </button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setSessionCourse(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

export default InstructorCourses