import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import { getCourses } from '../../services/courseService'
import { enrollCourse } from '../../services/courseService'

interface Course {
  id: string
  title: string
  description: string
  price: number
  status: string
  instructor_id: string
}

function StudentCourses() {
  const [courses,  setCourses]  = useState<Course[]>([])
  const [loading,  setLoading]  = useState(true)
  const [message,  setMessage]  = useState<{text:string, type:'success'|'error'} | null>(null)
  const [enrolling, setEnrolling] = useState<string | null>(null)

  useEffect(() => {
    getCourses()
      .then(res => setCourses(res.data.data))
      .catch(() => setMessage({ text:'Failed to load courses', type:'error' }))
      .finally(() => setLoading(false))
  }, [])

  const handleEnroll = async (courseId: string) => {
    setEnrolling(courseId)
    setMessage(null)
    try {
      await enrollCourse(courseId)
      setMessage({ text:'Successfully enrolled!', type:'success' })
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || 'Enrollment failed', type:'error' })
    } finally {
      setEnrolling(null)
    }
  }

  return (
    <>
      <Navbar />
      <div className="page">
        <h1 className="page-title">Browse Courses</h1>

        {message && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        {loading && <p style={{ color:'#666' }}>Loading courses...</p>}

        {!loading && courses.length === 0 && (
          <div className="card" style={{ textAlign:'center', padding:'3rem', color:'#666' }}>
            No published courses available yet.
          </div>
        )}

        <div className="grid-2">
          {courses.map(course => (
            <div key={course.id} className="card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                <h3 style={{ fontSize:'16px', fontWeight:600, color:'#1A3A5C' }}>{course.title}</h3>
                <span className="badge badge-green">Published</span>
              </div>

              <p style={{ color:'#555', fontSize:'13px', marginBottom:'12px', lineHeight:1.5 }}>
                {course.description || 'No description provided.'}
              </p>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontWeight:600, color:'#1A3A5C', fontSize:'15px' }}>
                  ${parseFloat(String(course.price)).toFixed(2)}
                </span>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleEnroll(course.id)}
                  disabled={enrolling === course.id}
                >
                  {enrolling === course.id ? 'Enrolling...' : 'Enroll'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default StudentCourses