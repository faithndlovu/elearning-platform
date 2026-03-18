import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import apiClient from '../../services/apiClient'

interface Enrollment {
  id: string
  course_id: string
  title: string
  description: string
  price: number
  enrolled_at: string
}

function StudentMyCourses() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    apiClient.get('/me/enrollments')
      .then(res => setEnrollments(res.data.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Navbar />
      <div className="page">
        <h1 className="page-title">My Courses</h1>

        {loading && <p style={{ color:'#666' }}>Loading your courses...</p>}

        {!loading && enrollments.length === 0 && (
          <div className="card" style={{ textAlign:'center', padding:'3rem', color:'#666' }}>
            You have not enrolled in any courses yet.
            <br />
            <a href="/student/courses" style={{ color:'#1A3A5C', fontWeight:500 }}>Browse courses</a>
          </div>
        )}

        <div className="grid-2">
          {enrollments.map(e => (
            <div key={e.id} className="card">
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                <h3 style={{ fontSize:'16px', fontWeight:600, color:'#1A3A5C' }}>{e.title}</h3>
                <span className="badge badge-blue">Enrolled</span>
              </div>
              <p style={{ color:'#555', fontSize:'13px', marginBottom:'10px' }}>
                {e.description || 'No description provided.'}
              </p>
              <p style={{ fontSize:'12px', color:'#999' }}>
                Enrolled: {new Date(e.enrolled_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default StudentMyCourses