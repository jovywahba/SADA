import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, CalendarDays, CalendarPlus, Check, ChevronLeft, ChevronRight, Clock, Globe, Lock, Mail,
  Info, MousePointerClick, UserCheck, Video,
} from 'lucide-react'
import { BrandMark } from '../../components/Brand'
import { Avatar } from '../../components/ui'
import { getJourney, saveJourney } from '../../lib/journey'
import { addMinutes, formatBookingDate, formatTime, toISODate } from '../../lib/format'

// Mock scheduling settings — purely visual, nothing is actually booked.
const TZ_LABEL = 'Africa/Cairo · Eastern European Time (GMT+3)'
const DURATION = 30
const SALES_REP = 'Mohammed Al-Harthi'
const ALL_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30']
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type Phase = 'pick' | 'form' | 'done'

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

/** Mock availability: Sunday–Thursday, from tomorrow for the next 45 days. */
function isAvailable(d: Date, today: Date) {
  if (d.getDay() === 5 || d.getDay() === 6) return false
  const diff = Math.round((startOfDay(d).getTime() - today.getTime()) / 86_400_000)
  return diff >= 1 && diff <= 45
}

/** Deterministic pseudo-random subset of slots per date so the calendar feels real. */
function slotsFor(iso: string) {
  let h = 2166136261
  for (const c of iso) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0
  return ALL_SLOTS.filter((_, i) => {
    const x = Math.imul(h ^ (i * 0x9e3779b1), 0x85ebca6b) >>> 0
    return (x >>> 13) % 10 < 7
  })
}

export default function Book() {
  const navigate = useNavigate()
  const journey = getJourney()
  const today = useMemo(() => startOfDay(new Date()), [])
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [date, setDate] = useState<string | null>(null)
  const [time, setTime] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('pick')
  const [confirming, setConfirming] = useState(false)
  const [name, setName] = useState(journey.fullName ?? '')
  const [email, setEmail] = useState(journey.email ?? '')
  const [notes, setNotes] = useState('')
  const [notified, setNotified] = useState(0)

  useEffect(() => {
    if (phase !== 'done') return
    const timers = [1, 2, 3].map((n) => setTimeout(() => setNotified(n), 450 * n + 250))
    return () => timers.forEach(clearTimeout)
  }, [phase])

  const firstMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const maxMonth = new Date(today.getFullYear(), today.getMonth() + 2, 1)
  const cells: (Date | null)[] = []
  const lead = month.getDay()
  const daysIn = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  for (let i = 0; i < lead; i++) cells.push(null)
  for (let d = 1; d <= daysIn; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d))

  const confirm = (e: FormEvent) => {
    e.preventDefault()
    if (!date || !time || !name.trim() || !email.trim()) return
    setConfirming(true)
    setTimeout(() => {
      saveJourney({ fullName: name.trim(), email: email.trim(), booking: { date, time } })
      setConfirming(false)
      setPhase('done')
    }, 1300)
  }

  const slots = date ? slotsFor(date) : []

  return (
    <>
      <div className="book-head" style={{ animation: 'fadeUp .5s var(--ease) both' }}>
        <span className="eyebrow">Step 3 · Book a call</span>
        <h1>{phase === 'done' ? 'You’re all set' : 'Pick a time with the SADA team'}</h1>
        <p>
          {phase === 'done'
            ? 'Here’s a summary of your booking.'
            : `Thanks for sharing your perspective. Choose a ${DURATION}-minute slot and we’ll walk you through SADA with your answers in mind.`}
        </p>
      </div>

      <div className="card cal-embed" style={{ animation: 'fadeUp .6s .05s var(--ease) both' }}>
        <div className="cal-embed-bar">
          <span className="secure"><Lock /> Scheduling powered by Calendly</span>
          <span className="cal-disclaimer"><Info /> Demo scheduling experience — no real calendar event will be created.</span>
        </div>

        {phase === 'done' && date && time ? (
          <div className="cal-done">
            <div className="success-badge"><Check strokeWidth={3} /></div>
            <h2>Your call has been booked successfully.</h2>
            <p className="sub">A calendar invitation is on its way to {email}.</p>
            <div className="booking-summary">
              <div><UserCheck /> <span><b>SADA Discovery Call</b> with {SALES_REP}</span></div>
              <div><CalendarDays /> <span>{formatTime(time)} – {formatTime(addMinutes(time, DURATION))}, {formatBookingDate(date)}</span></div>
              <div><Globe /> <span>{TZ_LABEL}</span></div>
              <div><Video /> <span>Web conferencing details provided upon confirmation</span></div>
            </div>
            <div className="notify-list" aria-live="polite">
              <Notify on={notified >= 1} icon={<CalendarPlus />} title="Added to your calendar" sub="The meeting has been added to your calendar." />
              <Notify on={notified >= 2} icon={<UserCheck />} title="Sales representative notified" sub={`${SALES_REP} has received the meeting.`} />
              <Notify on={notified >= 3} icon={<Mail />} title="Confirmation email sent" sub={`Sent to ${email}`} />
            </div>
            <button className="btn btn-primary btn-lg" style={{ marginTop: 26 }} disabled={notified < 3} onClick={() => navigate('/complete')}>
              {notified < 3 ? <><span className="spinner" /> Finalizing…</> : <>Finish <ArrowRight /></>}
            </button>
            <p className="mock-note">Prototype: no real calendar event or email has been created.</p>
          </div>
        ) : (
          <div className="cal-grid">
            <aside className="cal-info">
              <div className="host">
                <span className="host-logo"><BrandMark size={28} /></span>
                <div>
                  <div className="host-name">SADA Sales Team</div>
                  <b style={{ fontSize: 14 }}>mysada.app</b>
                </div>
              </div>
              <h2>SADA Discovery Call</h2>
              <div className="cal-facts">
                <div><Clock /> {DURATION} min</div>
                <div><Video /> Google Meet or Microsoft Teams</div>
                {date && time && (
                  <div className="hl"><CalendarDays /> {formatTime(time)} – {formatTime(addMinutes(time, DURATION))}, {formatBookingDate(date)}</div>
                )}
                <div><Globe /> {TZ_LABEL}</div>
              </div>
              <p className="desc">
                A tailored walkthrough of SADA based on your questionnaire responses — covering the features you prioritized,
                rollout options and next steps for a pilot.
              </p>
              <div className="rep-card">
                <Avatar name={SALES_REP} />
                <div>
                  {SALES_REP}
                  <small>Enterprise Account Executive</small>
                </div>
              </div>
            </aside>

            {phase === 'pick' ? (
              <div className={`cal-pick ${date ? '' : 'no-times'}`}>
                <div>
                  <h3>Select a Date &amp; Time</h3>
                  <div className="month-nav">
                    <button
                      className="icon-btn"
                      aria-label="Previous month"
                      disabled={month <= firstMonth}
                      onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="m">{month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
                    <button
                      className="icon-btn"
                      aria-label="Next month"
                      disabled={month >= maxMonth}
                      onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <div className="dow">{DOW.map((d) => <span key={d}>{d}</span>)}</div>
                  <div className="days">
                    {cells.map((d, i) => {
                      if (!d) return <span key={`e${i}`} />
                      const iso = toISODate(d)
                      const avail = isAvailable(d, today)
                      const isToday = d.getTime() === today.getTime()
                      return (
                        <button
                          key={iso}
                          className={`day ${avail ? 'avail' : ''} ${date === iso ? 'sel' : ''} ${isToday ? 'today' : ''}`}
                          disabled={!avail}
                          aria-pressed={date === iso}
                          aria-label={d.toDateString() + (avail ? '' : ' (unavailable)')}
                          onClick={() => {
                            setDate(iso)
                            setTime(null)
                          }}
                        >
                          {d.getDate()}
                        </button>
                      )
                    })}
                  </div>
                  <div className="tz"><Globe /> {TZ_LABEL}</div>
                </div>

                {date ? (
                  <div key={date}>
                    <div className="times-date">{formatBookingDate(date).replace(/ \d{4}$/, '')}</div>
                    <div className="times">
                      {slots.map((s, i) => (
                        <div className="slot-row" key={s} style={{ animationDelay: `${i * 25}ms` }}>
                          <button className={`slot ${time === s ? 'sel' : ''}`} onClick={() => setTime(s)}>
                            {formatTime(s)}
                          </button>
                          {time === s && (
                            <button className="btn btn-primary slot-next" onClick={() => setPhase('form')}>Next</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                {!date && (
                  <div className="times-empty" style={{ marginTop: -8 }}>
                    <MousePointerClick />
                    Select a highlighted date to see available times.
                  </div>
                )}
              </div>
            ) : (
              <form className="cal-form" onSubmit={confirm}>
                <button type="button" className="btn btn-ghost btn-sm back" onClick={() => setPhase('pick')}>
                  <ArrowLeft /> Back
                </button>
                <h3>Enter Details</h3>
                <div className="fields">
                  <div className="field">
                    <label className="label" htmlFor="bk-name">Name *</label>
                    <input id="bk-name" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="field">
                    <label className="label" htmlFor="bk-email">Email *</label>
                    <input id="bk-email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="field">
                    <label className="label" htmlFor="bk-notes">
                      Anything that will help us prepare?<span className="opt">Optional</span>
                    </label>
                    <textarea id="bk-notes" className="textarea" style={{ minHeight: 100 }} value={notes} onChange={(e) => setNotes(e.target.value)} />
                  </div>
                </div>
                <p className="cal-legal">By proceeding, you confirm that you have read and agree to SADA’s Terms of Use and Privacy Notice.</p>
                <button className="btn btn-primary btn-lg" type="submit" disabled={confirming || !name.trim() || !email.trim()}>
                  {confirming ? <><span className="spinner" /> Scheduling…</> : 'Confirm booking'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </>
  )
}

function Notify({ on, icon, title, sub }: { on: boolean; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className={`notify ${on ? 'on' : ''}`}>
      <span className="ni">{icon}</span>
      <div>
        {title}
        <small>{sub}</small>
      </div>
      <span className="st">{on ? <Check strokeWidth={3} /> : <span className="spinner dark" />}</span>
    </div>
  )
}
