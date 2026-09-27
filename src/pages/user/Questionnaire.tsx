import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Info, Lock, Send } from 'lucide-react'
import { OTHER, QUESTIONS, SECTIONS, selectionHint, type Question } from '../../lib/questions'
import { saveJourney } from '../../lib/journey'

const TOTAL_STEPS = QUESTIONS.length + 1 // contact details + 12 questions
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

interface Draft {
  fullName: string
  company: string
  email: string
  /** choice answers keyed by question id */
  answers: Record<string, string[]>
  /** free text for "Other" options */
  other: Record<string, string>
  /** open text answers */
  text: Record<string, string>
}

/** Q7 choices are derived from the features picked in Q6. */
function derivedOptions(q: Question, d: Draft): string[] {
  if (!q.optionsFrom) return q.options ?? []
  return (d.answers[q.optionsFrom] ?? []).map((v) => (v === OTHER ? `Other: ${(d.other[q.optionsFrom!] ?? '').trim()}` : v))
}

function validate(step: number, d: Draft): { ok: boolean; message: string; fields?: Record<string, string> } {
  if (step === 0) {
    const fields: Record<string, string> = {}
    if (d.fullName.trim().length < 2) fields.fullName = 'Please enter your full name.'
    if (!d.company.trim()) fields.company = 'Please enter your company name.'
    if (!EMAIL_RE.test(d.email.trim())) fields.email = 'Please enter a valid work email.'
    const ok = Object.keys(fields).length === 0
    return { ok, message: ok ? '' : 'Complete all fields to continue', fields }
  }
  const q = QUESTIONS[step - 1]
  if (q.kind === 'text') return { ok: true, message: 'Optional — you can skip this question' }
  const vals = d.answers[q.id] ?? []
  if (!vals.length) return { ok: false, message: q.kind === 'single' ? 'Select an option to continue' : 'Select at least one option to continue' }
  if (vals.includes(OTHER) && !(d.other[q.id] ?? '').trim()) return { ok: false, message: 'Please describe your “Other” answer' }
  return { ok: true, message: '' }
}

export default function Questionnaire() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd')
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [draft, setDraft] = useState<Draft>({ fullName: '', company: '', email: '', answers: {}, other: {}, text: {} })

  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  const check = useMemo(() => validate(step, draft), [step, draft])

  const next = (e?: FormEvent) => {
    e?.preventDefault()
    setTouched(true)
    if (!check.ok) return
    if (step === TOTAL_STEPS - 1) {
      setSubmitting(true)
      saveJourney({ fullName: draft.fullName.trim(), email: draft.email.trim() })
      setTimeout(() => navigate('/book'), 900)
      return
    }
    setDir('fwd')
    setTouched(false)
    setStep(step + 1)
  }

  const back = () => {
    setDir('back')
    setTouched(false)
    setStep(step - 1)
  }

  const q = step > 0 ? QUESTIONS[step - 1] : null
  const sectionIdx = q ? SECTIONS.findIndex((s) => s.id === q.section) + 1 : 0
  const segments = [{ label: 'Your details', steps: [0] }, ...SECTIONS.map((s) => ({ label: s.label, steps: QUESTIONS.filter((x) => x.section === s.id).map((x) => x.number) }))]
  const pctDone = Math.round((step / TOTAL_STEPS) * 100)

  return (
    <div className="q-wrap">
      <div className="q-progress-head">
        <span>{q ? `Question ${q.number} of ${QUESTIONS.length}` : 'Before we begin'}</span>
        <span>{pctDone}% complete</span>
      </div>
      <div className="q-sections" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pctDone}>
        {segments.map((seg, i) => {
          const done = seg.steps.filter((s) => s < step).length
          const fill = (done / seg.steps.length) * 100
          return (
            <div key={seg.label} className={`q-seg ${i === sectionIdx ? 'active' : fill === 100 ? 'done' : ''}`}>
              <div className="bar"><span style={{ width: `${i === sectionIdx && fill === 0 ? 6 : fill}%` }} /></div>
              <span className="name">{seg.label}</span>
            </div>
          )
        })}
      </div>

      <form className="card q-card" onSubmit={next} noValidate>
        <div key={step} className={`q-anim ${dir === 'back' ? 'back' : ''}`}>
          {q ? (
            <QuestionStep q={q} draft={draft} setDraft={setDraft} />
          ) : (
            <ContactStep draft={draft} setDraft={setDraft} errors={touched ? check.fields : undefined} />
          )}
        </div>

        <div className="q-foot">
          <div>
            {step > 0 ? (
              <button type="button" className="btn btn-ghost" onClick={back} disabled={submitting}>
                <ArrowLeft /> Back
              </button>
            ) : (
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/welcome')}>
                <ArrowLeft /> Video
              </button>
            )}
          </div>
          <div className="q-foot-right">
            <span className={`validation ${touched && !check.ok ? 'warn' : ''}`} aria-live="polite">
              {check.message}
            </span>
            <button type="submit" className="btn btn-primary" disabled={(!check.ok && step > 0) || submitting}>
              {submitting ? (
                <><span className="spinner" /> Submitting…</>
              ) : step === TOTAL_STEPS - 1 ? (
                <>Submit responses <Send /></>
              ) : q?.kind === 'text' && !(draft.text[q.id] ?? '').trim() ? (
                <>Skip <ArrowRight /></>
              ) : (
                <>Continue <ArrowRight /></>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

function ContactStep({ draft, setDraft, errors }: { draft: Draft; setDraft: (fn: (d: Draft) => Draft) => void; errors?: Record<string, string> }) {
  const set = (k: 'fullName' | 'company' | 'email') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setDraft((d) => ({ ...d, [k]: v }))
  }
  return (
    <>
      <span className="eyebrow dark">Before we begin</span>
      <h2 className="q-title">Tell us a little about yourself</h2>
      <p className="q-desc">So our team knows who to follow up with. This takes less than a minute.</p>
      <div className="q-body contact-grid">
        <Field id="fullName" label="Full Name" placeholder="e.g. Noura Al-Qahtani" value={draft.fullName} onChange={set('fullName')} error={errors?.fullName} autoComplete="name" autoFocus />
        <Field id="company" label="Company Name" placeholder="e.g. Rawabi Holding Group" value={draft.company} onChange={set('company')} error={errors?.company} autoComplete="organization" />
        <Field id="email" label="Work Email" type="email" placeholder="name@company.com" value={draft.email} onChange={set('email')} error={errors?.email} autoComplete="email" />
      </div>
      <div className="privacy-note">
        <Lock /> Your answers are only shared with the SADA product and sales team to tailor your demo.
      </div>
    </>
  )
}

function Field({ id, label, error, ...rest }: { id: string; label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="field">
      <label className="label" htmlFor={id}>{label}</label>
      <input id={id} className={`input ${error ? 'invalid' : ''}`} aria-invalid={!!error} {...rest} />
      {error && <span className="field-error"><Info size={13} /> {error}</span>}
    </div>
  )
}

function QuestionStep({ q, draft, setDraft }: { q: Question; draft: Draft; setDraft: (fn: (d: Draft) => Draft) => void }) {
  const hint = selectionHint(q)
  const selected = draft.answers[q.id] ?? []
  const options = derivedOptions(q, draft)
  const atMax = q.kind === 'multi' && q.max !== undefined && selected.length >= q.max
  const otherRef = useRef<HTMLInputElement>(null)

  const toggle = (opt: string) => {
    setDraft((d) => {
      const cur = d.answers[q.id] ?? []
      let nextVals: string[]
      if (q.kind === 'single') nextVals = [opt]
      else if (cur.includes(opt)) nextVals = cur.filter((v) => v !== opt)
      else if (q.max && cur.length >= q.max) return d
      else nextVals = [...cur, opt]

      const answers = { ...d.answers, [q.id]: nextVals }
      const other = { ...d.other }
      if (!nextVals.includes(OTHER)) delete other[q.id]
      const nd = { ...d, answers, other }
      return syncDependents(nd)
    })
    if (opt === OTHER) setTimeout(() => otherRef.current?.focus(), 30)
  }

  if (q.kind === 'text') {
    const val = draft.text[q.id] ?? ''
    return (
      <>
        <Header q={q} hint="Open response · optional" />
        <div className="q-body">
          <textarea
            className="textarea"
            placeholder={q.placeholder}
            value={val}
            maxLength={600}
            onChange={(e) => {
              const v = e.target.value
              setDraft((d) => ({ ...d, text: { ...d.text, [q.id]: v } }))
            }}
            autoFocus
          />
          <div className="char-count">{val.length} / 600</div>
          <div className="suggest-chips">
            {['Nothing was missing', 'Not sure yet'].map((s) => (
              <button type="button" key={s} className="suggest-chip" onClick={() => setDraft((d) => ({ ...d, text: { ...d.text, [q.id]: s } }))}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </>
    )
  }

  const long = options.some((o) => o.length > 42)

  return (
    <>
      <Header q={q} hint={hint} count={q.kind === 'multi' ? `${selected.length} / ${q.max} selected` : undefined} full={atMax} />
      <div className="q-body">
        {options.length === 0 ? (
          <div className="empty-derived">Select at least one feature in the previous question to continue.</div>
        ) : (
          <div className={`options ${long || options.length <= 5 ? 'one-col' : ''}`} role={q.kind === 'single' ? 'radiogroup' : 'group'}>
            {options.map((opt) => {
              const isSel = selected.includes(opt)
              const disabled = !isSel && atMax
              return (
                <button
                  type="button"
                  key={opt}
                  role={q.kind === 'single' ? 'radio' : 'checkbox'}
                  aria-checked={isSel}
                  className={`option ${isSel ? 'selected' : ''}`}
                  disabled={disabled}
                  onClick={() => toggle(opt)}
                >
                  <span className={`ind ${q.kind === 'single' ? 'radio' : 'check'}`}>{q.kind === 'multi' && <Check strokeWidth={3.2} />}</span>
                  <span>{opt === OTHER ? 'Other' : opt}</span>
                </button>
              )
            })}
          </div>
        )}
        {q.allowOther && selected.includes(OTHER) && (
          <div className="other-input">
            <input
              ref={otherRef}
              className="input"
              placeholder="Please specify…"
              value={draft.other[q.id] ?? ''}
              maxLength={120}
              onChange={(e) => {
                const v = e.target.value
                setDraft((d) => syncDependents({ ...d, other: { ...d.other, [q.id]: v } }))
              }}
            />
          </div>
        )}
        {atMax && (
          <div className="limit-note full">
            <Check size={14} /> Maximum reached — deselect an option to choose a different one.
          </div>
        )}
      </div>
    </>
  )
}

/** Keep Q7 consistent with Q6: clear the pick if it's no longer one of the chosen features. */
function syncDependents(d: Draft): Draft {
  const dependents = QUESTIONS.filter((x) => x.optionsFrom)
  let out = d
  for (const dep of dependents) {
    const pick = out.answers[dep.id]?.[0]
    if (pick && !derivedOptions(dep, out).includes(pick)) {
      const answers = { ...out.answers }
      delete answers[dep.id]
      out = { ...out, answers }
    }
  }
  return out
}

function Header({ q, hint, count, full }: { q: Question; hint: string | null; count?: string; full?: boolean }) {
  const section = SECTIONS.find((s) => s.id === q.section)!
  return (
    <>
      <div className="q-meta">
        <span className="q-num">Q{q.number}</span>
        <span className="q-rule">{section.label}</span>
      </div>
      <h2 className="q-title">{q.title}</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {hint && <p className="q-desc">{hint}{q.optionsFrom ? ' — based on the features you chose' : ''}</p>}
        {count && <span className={`pill-count ${full ? 'full' : ''}`}>{count}</span>}
      </div>
    </>
  )
}
