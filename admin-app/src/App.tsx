import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login   from './pages/Login'
import Payouts from './pages/Payouts'
import AdminRoute from './components/AdminRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"   element={<Login />} />
        <Route path="/payouts" element={<AdminRoute><Payouts /></AdminRoute>} />
        <Route path="*"        element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App