import { useState } from 'react'

// Bundled locally in /public/brand so the prototype has no external asset dependency.
const MARK_URL = '/brand/sada-mark.png'

/** SADA wing mark. Uses the local brand asset, with an inline SVG fallback if it fails to load. */
export function BrandMark({ size = 64 }: { size?: number }) {
  const [failed, setFailed] = useState(false)
  if (!failed) {
    return (
      <img
        className="brand-mark"
        src={MARK_URL}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size, objectFit: 'contain' }}
        onError={() => setFailed(true)}
      />
    )
  }
  return (
    <svg className="brand-mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="sada-g" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#0f6b5a" />
          <stop offset=".55" stopColor="#16a085" />
          <stop offset="1" stopColor="#6fe0bf" />
        </linearGradient>
      </defs>
      <g fill="url(#sada-g)">
        <path d="M10 40c7-14 21-25 46-30-10 7-18 12-25 20-8 1-14 5-21 10z" />
        <path d="M12 48c8-9 20-15 38-17-8 5-15 9-22 13-6 0-11 2-16 4z" />
        <path d="M15 55c7-6 16-9 28-10-6 3-11 6-17 9-4 0-7 0-11 1z" />
      </g>
    </svg>
  )
}

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand-lockup">
      <BrandMark size={compact ? 52 : 72} />
      <span className="brand-word" style={{ fontSize: compact ? 40 : 56, marginTop: compact ? 18 : 26 }}>
        SADA
      </span>
      <span className="brand-tagline" style={{ marginTop: compact ? 16 : 26 }}>
        Share · Amplify · Drive · Advocacy
      </span>
    </div>
  )
}

export function BrandInline({ size = 28 }: { size?: number }) {
  return (
    <span className="brand-inline">
      <BrandMark size={size} />
      <span className="brand-word">SADA</span>
    </span>
  )
}
