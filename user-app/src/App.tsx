import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Auth pages
import Login    from './pages/auth/Login'
import Register from './pages/auth/Register'

// Student pages
import StudentCourses   from './pages/student/StudentCourses'
import StudentMyCourses from './pages/student/StudentMyCourses'

// Instructor pages
import InstructorCourses  from './pages/instructor/InstructorCourses'
import InstructorSessions from './pages/instructor/InstructorSessions'
import InstructorPayouts  from './pages/instructor/InstructorPayouts'

// Route guard
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student routes — only students can access */}
        <Route path="/student/courses" element={
          <PrivateRoute requiredType="student">
            <StudentCourses />
          </PrivateRoute>
        } />
        <Route path="/student/my-courses" element={
          <PrivateRoute requiredType="student">
            <StudentMyCourses />
          </PrivateRoute>
        } />

        {/* Instructor routes — only instructors can access */}
        <Route path="/instructor/courses" element={
          <PrivateRoute requiredType="instructor">
            <InstructorCourses />
          </PrivateRoute>
        } />
        <Route path="/instructor/sessions" element={
          <PrivateRoute requiredType="instructor">
            <InstructorSessions />
          </PrivateRoute>
        } />
        <Route path="/instructor/payouts" element={
          <PrivateRoute requiredType="instructor">
            <InstructorPayouts />
          </PrivateRoute>
        } />

        {/* Default — redirect to login */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App