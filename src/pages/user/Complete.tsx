import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarCheck, CheckCircle2, ClipboardCheck, LogOut, Mail } from 'lucide-react'
import { getJourney } from '../../lib/journey'
import { logout } from '../../lib/auth'
import { addMinutes, formatBookingDate, formatTime } from '../../lib/format'

const COLORS = ['#6fe0bf', '#2fc4a0', '#16a085', '#97ead2', '#ffffff']

export default function Complete() {
  const navigate = useNavigate()
  const { fullName, email, booking } = getJourney()
  const firstName = fullName?.split(' ')[0]
  const confetti = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        dur: 2.4 + Math.random() * 2,
        color: COLORS[i % COLORS.length],
        rot: Math.random() * 180,
      })),
    [],
  )

  return (
    <>
      <div className="confetti" aria-hidden>
        {confetti.map((c, i) => (
          <i key={i} style={{ left: `${c.left}%`, background: c.color, animationDelay: `${c.delay}s`, animationDuration: `${c.dur}s`, transform: `rotate(${c.rot}deg)` }} />
        ))}
      </div>
      <section className="complete">
        <div className="card complete-card">
          <div className="success-badge"><CheckCircle2 /></div>
          <h1>Thank you for exploring SADA{firstName ? `, ${firstName}` : ''}.</h1>
          <p className="sub">Your responses have been submitted and your demo call has been scheduled. We look forward to speaking with you.</p>

          <div className="complete-rows">
            <div className="complete-row">
              <span className="ci"><ClipboardCheck /></span>
              <div><b>Questionnaire submitted</b><small>12 of 12 questions answered</small></div>
              <CheckCircle2 className="ok" size={18} />
            </div>
            <div className="complete-row">
              <span className="ci"><CalendarCheck /></span>
              <div>
                <b>Demo call scheduled</b>
                <small>
                  {booking
                    ? `${formatBookingDate(booking.date)} · ${formatTime(booking.time)} – ${formatTime(addMinutes(booking.time, 30))} (Cairo, GMT+3)`
                    : 'Our team will be in touch'}
                </small>
              </div>
              <CheckCircle2 className="ok" size={18} />
            </div>
            <div className="complete-row">
              <span className="ci"><Mail /></span>
              <div><b>Confirmation sent</b><small>Check {email || 'your inbox'} for your calendar invite</small></div>
              <CheckCircle2 className="ok" size={18} />
            </div>
          </div>

          <div className="complete-actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                logout()
                navigate('/login', { replace: true })
              }}
            >
              <LogOut /> Log out
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
