import { Fragment } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Check, LogOut } from 'lucide-react'
import { BrandInline } from '../../components/Brand'
import { logout, useSession } from '../../lib/auth'

const STEPS = [
  { path: '/welcome', label: 'Welcome' },
  { path: '/questionnaire', label: 'Questionnaire' },
  { path: '/book', label: 'Book a call' },
  { path: '/complete', label: 'Done' },
]

export default function UserLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const session = useSession()
  const current = STEPS.findIndex((s) => s.path === pathname)

  return (
    <div className="backdrop">
      <div className="grain" />
      <header className="user-top">
        <BrandInline />
        <nav className="journey" aria-label="Progress">
          {STEPS.map((s, i) => (
            <Fragment key={s.path}>
              {i > 0 && <span className="j-sep" />}
              <span className={`j-step ${i === current ? 'active' : i < current ? 'done' : ''}`}>
                <span className="j-num">{i < current ? <Check size={12} strokeWidth={3} /> : i + 1}</span>
                <span className="j-label">{s.label}</span>
              </span>
            </Fragment>
          ))}
        </nav>
        <div className="user-top-right">
          <span className="who"><span className="who-email">{session?.email}</span></span>
          <button
            className="btn btn-sm btn-on-dark"
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
          >
            <LogOut /> <span className="hide-sm">Log out</span>
          </button>
        </div>
      </header>
      <main className="user-main">
        <Outlet />
      </main>
    </div>
  )
}
