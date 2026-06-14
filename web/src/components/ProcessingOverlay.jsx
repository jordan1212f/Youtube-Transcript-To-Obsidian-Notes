import { useState, useEffect, useRef, Fragment } from 'react'
import { PlayIcon, ExternalIcon, CheckIcon, ArrowIcon } from './Icons'

/* Shared staged processing overlay — used by Onboarding + AddModal.
   Renders 4 stages (~2s each), then optionally a "reveal" with the first
   action card. Reuses focus-hero styling. */

export const PROC_STAGES = [
  'Fetching transcript…',
  'Reading content…',
  'Matching to your goals…',
  'Generating your first actions…',
]

/* The reveal action card — a focus-hero with a live 48h countdown that's
   already running. Used at the end of onboarding. */
export function RevealActionCard({ goalLabel }) {
  const WINDOW_MS = 48 * 60 * 60 * 1000
  const startRef = useRef(Date.now())
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const remaining = Math.max(0, WINDOW_MS - (now - startRef.current))
  const pct = Math.max(0, Math.min(1, remaining / WINDOW_MS))
  const h = Math.floor(remaining / 3.6e6)
  const m = Math.floor((remaining / 6e4) % 60)
  const s = Math.floor((remaining / 1000) % 60)
  const pad = (n) => String(n).padStart(2, '0')
  const phaseColor = '#4ADE80'

  return (
    <article className="focus-hero focus-phase-green" style={{ '--phase-color': phaseColor }}>
      <div className="focus-hero-top">
        <div className="focus-hero-label">
          <span className="pulse" style={{ background: phaseColor, boxShadow: `0 0 0 0 ${phaseColor}` }} />
          Focus action · in your window
        </div>
        <div className="focus-hero-meta mono">
          From <em>Slow productivity</em>
          {goalLabel ? ` · ${goalLabel}` : ''}
        </div>
      </div>

      <h2 className="focus-hero-title">Block your first 90-min deep-work session.</h2>
      <p className="focus-hero-desc">
        Calendar event, location, and one sentence on the outcome. Phone in another room before it starts.
      </p>

      <div className="focus-progress">
        <div className="focus-progress-track">
          <div className="focus-progress-fill" style={{ width: `${pct * 100}%`, background: phaseColor }} />
        </div>
        <div className="focus-progress-foot mono">
          <span className="time">
            {pad(h)}<span className="sep">:</span>{pad(m)}<span className="sep">:</span>{pad(s)}
          </span>
          <span className="left">left in window</span>
        </div>
      </div>

      <div className="chain">
        <div className="chain-track">
          {Array.from({ length: 7 }).map((_, i) => (
            <Fragment key={i}>
              {i > 0 && <span className={`chain-link chain-link-${i === 0 ? 'current' : 'todo'}`} />}
              <span className={`chain-dot chain-dot-${i === 0 ? 'current' : 'todo'}`} />
            </Fragment>
          ))}
        </div>
        <span className="chain-label mono">this week</span>
      </div>
    </article>
  )
}

/* ProcessingOverlay
   props:
     source: { title, source, type, duration }
     goalLabel?, goalPills?
     onComplete: () => void   — called when stages finish (no reveal)
     reveal?: boolean         — show the action reveal after stages
     onFinish?: () => void    — from the reveal button
     finishLabel?: string     — reveal button label (default "Let's go")
*/
export default function ProcessingOverlay({
  source,
  goalLabel,
  goalPills,
  onComplete,
  reveal,
  onFinish,
  finishLabel,
}) {
  const [stage, setStage] = useState(0)
  const [showReveal, setShowReveal] = useState(false)

  useEffect(() => {
    if (stage >= PROC_STAGES.length) {
      if (reveal) {
        const t = setTimeout(() => setShowReveal(true), 300)
        return () => clearTimeout(t)
      }
      const t = setTimeout(() => onComplete && onComplete(), 350)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setStage((x) => x + 1), 2000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  if (showReveal) {
    return (
      <div className="proc-overlay">
        <div className="proc-reveal">
          <p className="proc-reveal-sub">Done — your library is working for you now.</p>
          <h2 className="proc-reveal-h">Here's your first action.</h2>
          <RevealActionCard goalLabel={goalLabel} />
          {goalPills && goalPills.length > 0 && (
            <div className="onboard-preview-goals">
              {goalPills.map((g, i) => (
                <span className="tag" key={i}>
                  <span className="dot" style={{ background: g.color || 'var(--accent-bright)' }} />
                  {g.name || g}
                </span>
              ))}
            </div>
          )}
          <button className="btn btn-accent proc-finish-btn" onClick={() => onFinish && onFinish()}>
            {finishLabel || "Let's go"} <ArrowIcon width={13} height={13} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="proc-overlay">
      <div className="proc-card">
        <div className="proc-source">
          <div className="thumb-mini">
            {source && source.type === 'article' ? (
              <ExternalIcon width={16} height={16} />
            ) : (
              <PlayIcon width={16} height={16} />
            )}
          </div>
          <div className="body">
            <div className="t">{source ? source.title : 'Processing your content…'}</div>
            <div className="m">
              <span style={{ color: 'var(--accent-bright)' }}>●</span>{' '}
              {source ? `${source.source}${source.duration ? ` · ${source.duration}` : ''}` : 'analysing'}
            </div>
          </div>
        </div>

        <div className="proc-eyebrow">/ building your first actions</div>

        <div className="proc-stages">
          {PROC_STAGES.map((label, i) => {
            const state = i < stage ? 'is-done' : i === stage ? 'is-active' : ''
            return (
              <div key={i} className={`proc-stage ${state}`}>
                <span className="pill-num">
                  {i < stage ? <CheckIcon width={11} height={11} /> : String(i + 1)}
                </span>
                <span className="label">{label}</span>
                <span className="stage-end">
                  {i < stage ? (
                    <CheckIcon className="stage-check" width={14} height={14} />
                  ) : (
                    <span className="stage-bar"><span className="stage-bar-fill" /></span>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
