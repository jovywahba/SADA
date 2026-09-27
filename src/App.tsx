import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { homeFor, useSession, type Role } from './lib/auth'
import Login from './pages/Login'
import UserLayout from './pages/user/UserLayout'
import Welcome from './pages/user/Welcome'
import Questionnaire from './pages/user/Questionnaire'
import Book from './pages/user/Book'
import Complete from './pages/user/Complete'
import Admin from './pages/Admin'

/** Only lets the matching demo account through; everyone else goes to login or their own view. */
function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const session = useSession()
  if (!session) return <Navigate to="/login" replace />
  if (session.role !== role) return <Navigate to={homeFor(session.role)} replace />
  return <>{children}</>
}

function Home() {
  const session = useSession()
  return <Navigate to={session ? homeFor(session.role) : '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireRole role="user"><UserLayout /></RequireRole>}>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/book" element={<Book />} />
        <Route path="/complete" element={<Complete />} />
      </Route>
      <Route path="/admin" element={<RequireRole role="admin"><Admin /></RequireRole>} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
