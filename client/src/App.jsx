import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import './App.css'

// Lazy load all page components for code splitting
const Landing = lazy(() => import('./pages/Landing'))
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const SecurityPersonnel = lazy(() => import('./pages/Personnel/SecurityPersonnel'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))

function App() {
  return (
    <Router>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/personnel/dashboard" element={<SecurityPersonnel />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
