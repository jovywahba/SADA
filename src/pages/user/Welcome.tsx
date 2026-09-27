import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CalendarCheck, CheckCircle2, ClipboardList, Clock, Play, PlayCircle } from 'lucide-react'

const VIDEO_SRC = '/media/sada-intro.mp4'

function fmt(sec: number) {
  if (!isFinite(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function Welcome() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)
  const [ended, setEnded] = useState(false)
  const [duration, setDuration] = useState(0)
  const [time, setTime] = useState(0)
  const [ratio, setRatio] = useState('16 / 9')


  const play = () => {
    setStarted(true)
    videoRef.current?.play().catch(() => {
      /* autoplay blocked — native controls remain available */
    })
  }

  const pct = duration ? Math.min(100, (time / duration) * 100) : 0

  return (
    <section className="welcome">
      <div style={{ animation: 'fadeUp .6s var(--ease) both' }}>
        <span className="eyebrow">Customer discovery · 2026</span>
        <h1>
          Welcome to <span className="grad">SADA.</span>
          <br />
          <span style={{ color: 'rgba(255,255,255,.9)' }}>Let’s shape it around your team.</span>
        </h1>
        <p className="lead">
          SADA turns employees into your most trusted voices — sharing company news, amplifying your brand and building a
          stronger internal community. Watch the short introduction, then tell us what matters most to your organization.
        </p>

        <div className="welcome-steps">
          <div className="welcome-step">
            <span className="ws-icon"><PlayCircle /></span>
            <span>Watch the introduction<small>{duration ? `${fmt(duration)} · product introduction` : 'About a minute'}</small></span>
          </div>
          <div className="welcome-step">
            <span className="ws-icon"><ClipboardList /></span>
            <span>Answer 12 quick questions<small>About 4 minutes · progress is saved</small></span>
          </div>
          <div className="welcome-step">
            <span className="ws-icon"><CalendarCheck /></span>
            <span>Book a call with our team<small>30 minutes, at a time that suits you</small></span>
          </div>
        </div>

        <div className="welcome-cta">
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/questionnaire')}>
            Start Questionnaire <ArrowRight />
          </button>
          <span className="hint">
            {ended ? (
              <span className="chip-done"><CheckCircle2 /> Video watched</span>
            ) : (
              <><Clock size={14} /> You can start whenever you’re ready</>
            )}
          </span>
        </div>
      </div>

      <div className="video-col" style={{ animation: 'fadeUp .7s .1s var(--ease) both' }}>
        <div className="video-frame">
          <div className="chrome">
            <span className="l">
              <Play size={13} /> Introducing SADA
            </span>
            <span>{duration ? fmt(duration) : '—'}</span>
          </div>
          <div className="video-box" style={{ ['--video-ar' as string]: ratio }}>
            <video
              ref={videoRef}
              src={VIDEO_SRC}
              preload="metadata"
              playsInline
              controls={started}
              onLoadedMetadata={(e) => {
                const v = e.currentTarget
                setDuration(v.duration)
                if (v.videoWidth && v.videoHeight) setRatio(`${v.videoWidth} / ${v.videoHeight}`)
                // Nudge to a representative frame so the cover isn't a black box.
                if (!started) v.currentTime = Math.min(1.5, v.duration / 4)
              }}
              onTimeUpdate={(e) => started && setTime(e.currentTarget.currentTime)}
              onEnded={() => setEnded(true)}
              onPlay={() => setStarted(true)}
            >
              Your browser does not support embedded video.
            </video>
            {!started && (
              <button className="video-cover" onClick={play} aria-label="Play introduction video">
                <span className="play"><Play fill="currentColor" /></span>
                <span className="meta">
                  <strong>How SADA powers employee advocacy</strong>
                  Product introduction · English
                </span>
              </button>
            )}
          </div>
          <div className="video-status">
            {ended ? (
              <span className="chip-done"><CheckCircle2 /> Completed</span>
            ) : (
              <span>{started ? `${fmt(time)} / ${fmt(duration)}` : 'Not started'}</span>
            )}
            <div className="video-progress"><span style={{ width: `${ended ? 100 : pct}%` }} /></div>
          </div>
        </div>
      </div>
    </section>
  )
}
