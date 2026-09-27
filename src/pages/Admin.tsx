import { useNavigate } from 'react-router-dom'
import { CalendarCheck, Check, LogIn, LogOut, Minus } from 'lucide-react'
import { BrandInline } from '../components/Brand'
import { Avatar } from '../components/ui'
import { logout, useSession } from '../lib/auth'

type Status = 'Logged In' | 'Questionnaire Started' | 'Questionnaire Completed' | 'Demo Booked'

// Hardcoded mock participants for the prototype.
const USERS: { name: string; company: string; email: string; status: Status; date: string }[] = [
  { name: 'Noura Al-Qahtani', company: 'Rawabi Holding Group', email: 'noura.q@rawabigroup.sa', status: 'Demo Booked', date: '24 Sep 2026' },
  { name: 'Faisal Al-Harbi', company: 'Nakheel Financial', email: 'f.alharbi@nakheelfin.sa', status: 'Demo Booked', date: '23 Sep 2026' },
  { name: 'Sara Al-Mutairi', company: 'Tamkeen Telecom', email: 'sara.m@tamkeentel.com', status: 'Questionnaire Completed', date: '23 Sep 2026' },
  { name: 'Omar Bin Saleh', company: 'Masar Real Estate', email: 'omar@masar-re.sa', status: 'Demo Booked', date: '22 Sep 2026' },
  { name: 'Lama Al-Dosari', company: 'Wasl Healthcare', email: 'lama.dosari@waslhealth.sa', status: 'Questionnaire Started', date: '21 Sep 2026' },
  { name: 'Khalid Al-Otaibi', company: 'Riyadh Digital Labs', email: 'khalid@rdlabs.io', status: 'Demo Booked', date: '20 Sep 2026' },
  { name: 'Reem Al-Shehri', company: 'Qimam Hospitality', email: 'reem.shehri@qimamhotels.com', status: 'Questionnaire Completed', date: '19 Sep 2026' },
  { name: 'Abdullah Al-Zahrani', company: 'Sahm Retail Co.', email: 'a.zahrani@sahmretail.sa', status: 'Logged In', date: '18 Sep 2026' },
  { name: 'Hessa Al-Rashid', company: 'National Heritage Authority', email: 'h.alrashid@nha.gov.sa', status: 'Demo Booked', date: '17 Sep 2026' },
  { name: 'Yousef Al-Ghamdi', company: 'Bayan Consulting', email: 'yousef@bayanconsult.com', status: 'Questionnaire Started', date: '16 Sep 2026' },
  { name: 'Mona Al-Anazi', company: 'Anwar Media House', email: 'mona@anwarmedia.sa', status: 'Demo Booked', date: '15 Sep 2026' },
  { name: 'Turki Al-Subaie', company: 'Jadeer Technologies', email: 'turki.s@jadeer.tech', status: 'Logged In', date: '14 Sep 2026' },
]

const BADGE: Record<Status, string> = {
  'Logged In': 'logged_in',
  'Questionnaire Started': 'started',
  'Questionnaire Completed': 'completed',
  'Demo Booked': 'booked',
}

export default function Admin() {
  const navigate = useNavigate()
  const session = useSession()
  const loggedIn = USERS.length
  const booked = USERS.filter((u) => u.status === 'Demo Booked').length

  return (
    <div className="admin-simple">
      <header className="admin-bar">
        <BrandInline />
        <div className="admin-bar-right">
          <span className="who-email">{session?.email}</span>
          <button
            className="btn btn-sm btn-on-dark"
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
          >
            <LogOut /> Log out
          </button>
        </div>
      </header>

      <main className="admin-body">
        <div className="page-head">
          <div>
            <h1>Customer discovery</h1>
            <p>Overview of prospects who have gone through the SADA discovery journey.</p>
          </div>
        </div>

        <div className="kpis two">
          <div className="panel kpi">
            <div className="k-top">
              <span className="k-label">Users logged in</span>
              <span className="k-icon"><LogIn /></span>
            </div>
            <div className="k-value">{loggedIn}</div>
            <div className="k-foot">Total participants with access</div>
          </div>
          <div className="panel kpi hero">
            <div className="k-top">
              <span className="k-label">Demos booked</span>
              <span className="k-icon"><CalendarCheck /></span>
            </div>
            <div className="k-value">{booked}</div>
            <div className="k-foot">{Math.round((booked / loggedIn) * 100)}% of users booked a call</div>
          </div>
        </div>

        <section className="panel" style={{ marginTop: 16 }}>
          <div className="panel-head">
            <div>
              <h2>Users</h2>
              <p>{USERS.length} participants</p>
            </div>
          </div>
          <div className="table-wrap">
            <table className="tbl static">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Demo booked</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {USERS.map((u) => (
                  <tr key={u.email}>
                    <td>
                      <div className="cell-person">
                        <Avatar name={u.name} />
                        <span className="nm">{u.name}</span>
                      </div>
                    </td>
                    <td>{u.company}</td>
                    <td className="muted">{u.email}</td>
                    <td><span className={`badge ${BADGE[u.status]}`}>{u.status}</span></td>
                    <td>
                      {u.status === 'Demo Booked' ? (
                        <span className="yes"><Check strokeWidth={2.6} /> Yes</span>
                      ) : (
                        <span className="no"><Minus /> No</span>
                      )}
                    </td>
                    <td className="muted">{u.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
