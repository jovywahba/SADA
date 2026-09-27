import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { BrandLockup } from '../components/Brand'
import { homeFor, login, useSession } from '../lib/auth'

export default function Login() {
  const session = useSession()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (session && !loading) {
    return <Navigate to={homeFor(session.role)} replace />
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      const s = login(email, password)
      if (!s) {
        setLoading(false)
        setError('Those credentials don’t match any account. Please try again.')
        return
      }
      navigate(homeFor(s.role), { replace: true })
    }, 650)
  }

  return (
    <div className="backdrop">
      <div className="grain" />
      <span className="corner-pill">
        <span className="dot" /> Customer Discovery
      </span>
      <main className="auth-page">
        <BrandLockup />
        <form className="card auth-card" onSubmit={submit} noValidate>
          <h1>Sign in</h1>
          <p className="sub">Enter your email and password to continue.</p>
          <div style={{ display: 'grid', gap: 16, marginTop: 22 }}>
            {error && (
              <div className="form-alert" role="alert">
                <AlertCircle /> {error}
              </div>
            )}
            <div className="field">
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                className={`input ${error ? 'invalid' : ''}`}
                type="email"
                autoComplete="username"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="password">Password</label>
              <div className="input-wrap">
                <input
                  id="password"
                  className={`input ${error ? 'invalid' : ''}`}
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="icon-btn" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={loading} style={{ marginTop: 6 }}>
              {loading ? <span className="spinner" /> : <>Sign in <ArrowRight /></>}
            </button>
          </div>
        </form>
        <p className="auth-foot">Secure access for invited SADA discovery participants.</p>
        <p className="auth-foot">© 2026 SADA · Made in Saudi Arabia</p>
      </main>
    </div>
  )
}
