import { useState, useEffect, useRef, Fragment } from 'react'
import { CheckIcon, ArrowIcon } from './Icons'

const WINDOW_MS = 48 * 60 * 60 * 1000
const DAY_LABELS = ['m', 't', 'w', 't', 'f', 's', 's']

/* Parse a backend timestamp. SQLite's datetime('now') returns a naive
   UTC string ("YYYY-MM-DD HH:MM:SS"); treat anything without an explicit
   timezone as UTC so the countdown matches the server. */
function parseTime(value) {
  if (!value) return null
  let iso = value.includes('T') ? value : value.replace(' ', 'T')
  if (!/([zZ])|([+-]\d\d:?\d\d)$/.test(iso)) iso += 'Z'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

const pad = (n) => String(n).padStart(2, '0')

export default function FocusCard({ openDetail }) {
  const [focus, setFocus] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [streak, setStreak] = useState(0)
  const [now, setNow] = useState(Date.now())

  // local action state
  const [actionState, setActionState] = useState('idle') // idle | done | skipped
  const [moreTimeUsed, setMoreTimeUsed] = useState(false)
  const [todayDone, setTodayDone] = useState(false)

  // deadline (ms epoch); held in a ref so "More time" can shift it live
  const deadlineRef = useRef(null)

  useEffect(() => {
    let alive = true
    fetch('/api/focus')
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return
        const f = data && data.focus ? data.focus : null
        if (f) {
          const dl = parseTime(f.deadline)
          const created = parseTime(f.created_at)
          deadlineRef.current = dl
            ? dl.getTime()
            : (created ? created.getTime() : Date.now()) + WINDOW_MS
        }
        setFocus(f)
        setLoaded(true)
      })
      .catch(() => {
        if (alive) setLoaded(true)
      })

    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => {
        if (alive && data && typeof data.streak === 'number') setStreak(data.streak)
      })
      .catch(() => {})

    return () => {
      alive = false
    }
  }, [])

  // live ticking countdown
  useEffect(() => {
    if (!focus) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [focus])

  if (!loaded) {
    return <div className="focus-empty" aria-busy="true" />
  }

  if (!focus) {
    return (
      <div className="focus-empty">
        <span className="eyebrow">/ focus</span>
        <p className="focus-empty-text">
          No actions yet. Save some content and we'll generate your first action.
        </p>
      </div>
    )
  }

  const remaining = Math.max(0, (deadlineRef.current ?? now + WINDOW_MS) - now)
  const pct = Math.max(0, Math.min(1, remaining / WINDOW_MS))
  const hoursRemaining = remaining / 3.6e6

  let phase = 'green'
  if (hoursRemaining < 12) phase = 'red'
  else if (hoursRemaining < 24) phase = 'amber'
  const phaseColor =
    phase === 'green' ? '#4ADE80' : phase === 'amber' ? '#FBBF24' : '#F87171'

  const h = Math.floor(remaining / 3.6e6)
  const m = Math.floor((remaining / 6e4) % 60)
  const s = Math.floor((remaining / 1000) % 60)

  const broken = actionState === 'skipped'
  const inRescue = (phase === 'amber' || phase === 'red') && actionState === 'idle'

  // chain dots — daily streak across the current week (Mon = 0 … Sun = 6)
  const todayIdx = (new Date().getDay() + 6) % 7
  const effectiveStreak = todayDone && streak < 1 ? 1 : streak
  const weekStates = DAY_LABELS.map((_, i) => {
    if (i > todayIdx) return 'todo'
    if (i === todayIdx) return effectiveStreak >= 1 ? 'done' : 'current'
    return todayIdx - i < effectiveStreak ? 'done' : 'todo'
  })
  const daysCompleted = weekStates.filter((st) => st === 'done').length

  function doDone() {
    if (actionState !== 'idle') return
    setActionState('done')
    setTodayDone(true)
    fetch(`/api/actions/${focus.id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    }).catch(() => {})
  }
  function doSkip() {
    if (actionState !== 'idle') return
    setActionState('skipped')
    // NOTE: the backend doesn't expose /skip yet — call it as documented and
    // fall back to a local skip if it 404s so the UI still responds.
    fetch(`/api/actions/${focus.id}/skip`, { method: 'PUT' }).catch(() => {})
  }
  function doMoreTime() {
    if (moreTimeUsed || actionState !== 'idle') return
    setMoreTimeUsed(true)
    if (deadlineRef.current != null) deadlineRef.current += 24 * 60 * 60 * 1000
  }

  const label =
    phase === 'red'
      ? 'expires very soon'
      : phase === 'amber'
        ? 'expires today'
        : 'in your window'

  return (
    <article
      className={`focus-hero focus-phase-${phase} ${broken ? 'is-broken' : ''} ${
        actionState === 'done' ? 'is-done' : ''
      } ${inRescue ? 'rescue' : ''}`}
      style={{ '--phase-color': phaseColor }}
    >
      <div className="focus-hero-top">
        <div className="focus-hero-label">
          <span className="pulse" style={{ background: phaseColor }}></span>
          Focus action · {label}
        </div>
        <div className="focus-hero-meta mono">
          From <em>{focus.goal_title || 'your library'}</em>
          {focus.area_name ? <> · {focus.area_name}</> : null}
        </div>
      </div>

      <h2 className="focus-hero-title">{focus.title}</h2>
      {focus.description && <p className="focus-hero-desc">{focus.description}</p>}

      {/* Progress bar */}
      <div className="focus-progress">
        <div className="focus-progress-track">
          <div
            className="focus-progress-fill"
            style={{ width: `${pct * 100}%`, background: phaseColor }}
          ></div>
        </div>
        <div className="focus-progress-foot mono">
          <span className="time">
            {pad(h)}
            <span className="sep">:</span>
            {pad(m)}
            <span className="sep">:</span>
            {pad(s)}
          </span>
          <span className="left">left in window</span>
        </div>
      </div>

      {/* Actions */}
      <div className="focus-actions">
        {inRescue && (
          <span className="rescue-label mono">running low — extend your window?</span>
        )}
        <button
          className={`fa-btn fa-done ${actionState === 'done' ? 'is-on' : ''}`}
          onClick={doDone}
          disabled={actionState !== 'idle'}
        >
          {actionState === 'done' ? (
            <>
              <CheckIcon width={14} height={14} /> Done
            </>
          ) : (
            <>
              Done <CheckIcon width={13} height={13} />
            </>
          )}
        </button>
        <button className="fa-btn fa-skip" onClick={doSkip} disabled={actionState !== 'idle'}>
          Skip
        </button>
        <button
          className="fa-btn fa-more"
          onClick={doMoreTime}
          disabled={moreTimeUsed || actionState !== 'idle'}
        >
          {moreTimeUsed ? '+24h used' : 'More time'}
        </button>
        <span className="focus-actions-spacer"></span>
        <button className="fa-detail" onClick={() => openDetail && openDetail(focus.content_id)}>
          Open detail <ArrowIcon width={11} height={11} />
        </button>
      </div>

      {/* Chain dots — daily streak across this week */}
      <div className={`chain ${broken ? 'is-broken' : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div className="chain-track">
            {weekStates.map((state, i) => (
              <Fragment key={i}>
                {i > 0 && <span className={`chain-link chain-link-${state}`}></span>}
                <span className={`chain-dot chain-dot-${state}`}></span>
              </Fragment>
            ))}
          </div>
          <div className="chain-day-labels">
            {DAY_LABELS.map((d, i) => (
              <span key={i} className={`cdl ${i === todayIdx ? 'is-today' : ''}`}>
                {d}
              </span>
            ))}
          </div>
        </div>
        <span className="chain-label mono">
          {broken
            ? 'streak broken'
            : `this week · ${daysCompleted} day${daysCompleted === 1 ? '' : 's'}`}
        </span>
      </div>
    </article>
  )
}
