import { useState, useEffect } from 'react'

/* ============================================================
   CLARITY — ONBOARDING INTERSTITIALS  (A · B · C · D · E + Habit)
   Full-screen cinematic moments. No chrome, no auto-advance:
   each line quietly arrives, and a "tap to continue" affordance
   appears only after a silence once all content has rendered.
   ============================================================ */

const Acc = ({ children }) => <span className="i-acc">{children}</span>
const Dgr = ({ children }) => <span className="i-dgr">{children}</span>
const Fg1 = ({ children }) => <span className="i-fg1">{children}</span>

/* staged reveal — returns how many stages have elapsed. */
function useStages(timings) {
  const [n, setN] = useState(0)
  useEffect(() => {
    const ts = timings.map((ms, i) => setTimeout(() => setN((v) => Math.max(v, i + 1)), ms))
    return () => ts.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return n
}

/* tap-to-continue gate */
function useReady(ms) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setReady(true), ms)
    return () => clearTimeout(t)
  }, [ms])
  return ready
}

/* count-up: 0 → `to`, ease-in, ~`duration` ms */
function CountUp({ to, duration = 1800 }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let raf
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      setV(Math.round(t * t * to))
      if (t < 1) raf = requestAnimationFrame(tick)
      else setV(to)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <>{v}</>
}

/* shared full-screen shell */
function IntShell({ ready, onDone, children }) {
  return (
    <div
      className="onboard-screen intermission-screen dot-bg"
      onClick={() => ready && onDone()}
      style={{ cursor: ready ? 'pointer' : 'default' }}
    >
      <div className="intermission">{children}</div>
      {ready && <div className="int-skip">tap to continue</div>}
    </div>
  )
}

/* ============================================================
   A — CONSUMPTION TRUTH
   ============================================================ */
export function ConsumptionTruth({ onDone }) {
  const n = useStages([0, 1000, 3400, 5000, 6400, 8000, 9400])
  const ready = useReady(12600)
  return (
    <IntShell ready={ready} onDone={onDone}>
      {n >= 1 && <p className="ia-eyebrow iv-fade">the average person aged 18–24</p>}
      {n >= 2 && (
        <p className="ia-stat iv-fade">
          watches <Acc><CountUp to={462} duration={1800} /> hours</Acc>
        </p>
      )}
      {n >= 3 && <p className="ia-sub iv-fade">of educational content every year.</p>}
      {n >= 4 && (
        <p className="ia-mid iv-fade">
          They recall roughly <Acc>34 hours</Acc>.
        </p>
      )}
      {n >= 5 && <p className="ia-sub ia-sub-gap iv-fade">The rest disappears.</p>}
      {n >= 6 && <p className="ia-para iv-fade">Algorithms reward fast consumption, not understanding.</p>}
      {n >= 7 && (
        <p className="ia-para ia-para-2 iv-fade">
          You're not lazy. You just need <Acc>direction</Acc>.
        </p>
      )}
    </IntShell>
  )
}

/* ============================================================
   B — ACTION GAP (100-person grid · cascade to 13)
   ============================================================ */
export function ActionGap({ onDone }) {
  const n = useStages([0, 2000, 5400, 7800, 10200, 12000, 13800])
  const ready = useReady(17000)

  const YOU = 12
  const people = Array.from({ length: 100 }, (_, i) => i)

  return (
    <IntShell ready={ready} onDone={onDone}>
      {n >= 1 && (
        <p className="ib-head iv-fade">
          Everyone <Acc>saves</Acc> content.<br />
          Everyone <Acc>plans</Acc> to come back to it.
        </p>
      )}
      {n >= 2 && (
        <p className="ib-body iv-fade">
          They bookmark, make notes, add to Watch Later. They tell themselves next week. Next week
          usually means never. The playlist grows but nothing changes.
        </p>
      )}

      {n >= 3 && (
        <div className="ib-gridwrap iv-fade">
          <div className="ib-grid">
            {people.map((i) => {
              const faded = n >= 4 && i >= 13
              const isYou = n >= 5 && i === YOU
              return (
                <span
                  key={i}
                  className={`ib-person${faded ? ' faded' : ''}${isYou ? ' you' : ''}`}
                  style={faded ? { transitionDelay: `${(i - 13) * 18}ms` } : undefined}
                >
                  <span className="ib-head-dot" />
                  <span className="ib-body-bar" />
                  {isYou && <span className="ib-you-label">you</span>}
                </span>
              )
            })}
          </div>

          <div className="ib-fill">
            {n >= 6 && (
              <p className="ib-stat iv-fade">
                out of 100 people who save educational content, <Acc>fewer than 13</Acc> ever act on it
              </p>
            )}
            {n >= 7 && (
              <p className="ib-punch iv-fade">
                By opening Clarity, <Acc>you just joined that group.</Acc>
              </p>
            )}
          </div>
        </div>
      )}
    </IntShell>
  )
}

/* ============================================================
   C — THE FORGETTING CURVE (labeled chart · draw-on)
   ============================================================ */
function ForgettingChart() {
  const PASSIVE = 'M40,10 C60,40 76,62 90,69 C124,84 182,98 230,102 C266,106 290,111 310,115'
  const ACTION =
    'M40,10 C58,14 74,20 90,24 C108,27 130,30 150,31 C178,33 204,41 230,45 C260,48 286,53 310,55'
  const AREA =
    'M40,10 C58,14 74,20 90,24 C108,27 130,30 150,31 C178,33 204,41 230,45 C260,48 286,53 310,55 ' +
    'L310,115 C290,111 266,106 230,102 C182,98 124,84 90,69 C76,62 60,40 40,10 Z'
  const yTicks = [
    { y: 10, t: '100%' },
    { y: 80, t: '50%' },
    { y: 150, t: '0%' },
  ]
  const xTicks = [
    { x: 90, t: '20m' },
    { x: 150, t: '1hr' },
    { x: 230, t: '24hr' },
    { x: 310, t: '7 days' },
  ]
  return (
    <svg className="ic-chart" viewBox="-12 0 436 200" fill="none">
      <defs>
        <clipPath id="ic-reveal-p">
          <rect className="ic-reveal ic-reveal-p" x="0" y="0" width="360" height="178" />
        </clipPath>
        <clipPath id="ic-reveal-a">
          <rect className="ic-reveal ic-reveal-a" x="0" y="0" width="360" height="178" />
        </clipPath>
      </defs>

      <path className="ic-gap ic-late" d={AREA} />

      <line className="ic-axis" x1="40" y1="10" x2="40" y2="150" />
      <line className="ic-axis" x1="40" y1="150" x2="310" y2="150" />

      <text className="ic-axis-title" x="-3" y="80" transform="rotate(-90 -3 80)" textAnchor="middle">
        % remembered
      </text>

      {yTicks.map((t) => (
        <text key={t.t} className="ic-tick" x="33" y={t.y + 4} textAnchor="end">{t.t}</text>
      ))}
      {xTicks.map((t) => (
        <text key={t.t} className="ic-tick" x={t.x} y="170" textAnchor="middle">{t.t}</text>
      ))}

      <line className="ic-drop ic-late" x1="230" y1="45" x2="230" y2="102" />
      <text className="ic-drop-label ic-late" x="237" y="77">−66%</text>

      <path className="ic-passive" clipPath="url(#ic-reveal-p)" d={PASSIVE} />
      <path className="ic-action" clipPath="url(#ic-reveal-a)" d={ACTION} />

      <text className="ic-end ic-end-passive ic-late" x="316" y="118">passive</text>
      <text className="ic-end ic-end-action ic-late" x="316" y="47">taking action</text>
      <text className="ic-end ic-end-action ic-late" x="316" y="60">with clarity</text>
    </svg>
  )
}

export function ForgettingCurveInt({ onDone }) {
  const n = useStages([0, 800, 6000, 7400, 8800])
  const ready = useReady(12000)
  return (
    <IntShell ready={ready} onDone={onDone}>
      {n >= 1 && <p className="ia-eyebrow iv-fade">the forgetting curve</p>}
      {n >= 2 && (
        <div className="ic-graphic iv-fade">
          <ForgettingChart />
        </div>
      )}
      {n >= 3 && (
        <p className="ic-head iv-fade">
          You have access to <Acc>more information than any generation in history.</Acc>
        </p>
      )}
      {n >= 4 && (
        <p className="ic-body iv-fade">
          The problem was never access. It was <Fg1>action</Fg1>.
        </p>
      )}
      {n >= 5 && (
        <p className="ic-body ic-body-2 iv-fade">
          A focused information diet, built on doing rather than saving, is how you keep what matters.
        </p>
      )}
    </IntShell>
  )
}

/* ============================================================
   HABIT MOMENTUM (after C, before url)
   ============================================================ */
export function HabitMomentum({ onDone }) {
  const n = useStages([0, 800, 2400, 3800, 5000])
  const ready = useReady(8200)
  return (
    <IntShell ready={ready} onDone={onDone}>
      {n >= 1 && <p className="ia-eyebrow iv-fade">the first few days matter most</p>}
      {n >= 2 && (
        <p className="ih-head iv-fade">
          Habits are <Acc>most flexible right at the start.</Acc>
        </p>
      )}
      {n >= 3 && (
        <p className="ih-body iv-fade">
          The earliest repetitions of a new behaviour carry the most weight. Miss them and the
          pattern never forms.
        </p>
      )}
      {n >= 4 && (
        <p className="ih-body ih-body-2 iv-fade">
          Process one video now and you've already taken the first rep.
        </p>
      )}
      {n >= 5 && (
        <div className="ih-days iv-fade">
          <div className="ih-dots">
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} className={`ih-dot${i === 0 ? ' on' : ''}`} />
            ))}
          </div>
          <span className="ih-days-label">day 1 of 7</span>
        </div>
      )}
    </IntShell>
  )
}

/* ============================================================
   D — SMALL WIN (target / bullseye)
   ============================================================ */
export function SmallWin({ onDone }) {
  const n = useStages([0, 3400, 4800, 7200])
  const ready = useReady(10400)
  return (
    <IntShell ready={ready} onDone={onDone}>
      {n >= 1 && (
        <div className="id-target iv-fade">
          <span className="id-ring id-ring-1" />
          <span className="id-ring id-ring-2" />
          <span className="id-ring id-ring-3" />
          <span className="id-bull" />
        </div>
      )}
      {n >= 2 && (
        <p className="id-head iv-fade">
          You just did something<br />
          <Acc>most people never do.</Acc>
        </p>
      )}
      {n >= 3 && <p className="id-sub iv-fade">You turned a video into an action with a deadline.</p>}
      {n >= 4 && (
        <p className="id-close iv-fade">
          You're no longer waiting for motivation.<br />
          <Acc>You're designing your actions.</Acc>
        </p>
      )}
    </IntShell>
  )
}

/* ============================================================
   E — FUTURE YOU (today vs day 30)
   ============================================================ */
export function FutureYou({ onDone }) {
  const n = useStages([0, 1200, 3400, 5200, 6400])
  const ready = useReady(9600)
  return (
    <IntShell ready={ready} onDone={onDone}>
      {n >= 1 && (
        <p className="ie-head iv-fade">
          Imagine <Acc>30 days</Acc> from now.
        </p>
      )}

      {n >= 2 && (
        <div className="ie-cards iv-fade">
          <div className={`ie-card${n >= 3 ? ' dim' : ''}`}>
            <div className="ie-label today">TODAY</div>
            <div className="ie-lines">
              <div className="ie-line">Tabs open: <Fg1>47</Fg1></div>
              <div className="ie-line">Watch Later: <Fg1>400+ videos</Fg1></div>
              <div className="ie-line">Actions taken: <Dgr>0</Dgr></div>
              <div className="ie-line">Feeling: <Dgr>overwhelmed</Dgr></div>
              <div className="ie-line">Progress: <Dgr>none</Dgr></div>
            </div>
            <div className="ie-here">you are here →</div>
          </div>

          <div className="ie-arrow">→</div>

          <div className="ie-card glow">
            <div className="ie-label day30">DAY 30</div>
            <div className="ie-lines">
              <div className="ie-line"><Acc>22</Acc> videos saved and actioned</div>
              <div className="ie-line">Actions completed: <Acc>22</Acc></div>
              <div className="ie-line">Feeling: <Acc>in control</Acc></div>
              <div className="ie-line">Progress: <span className="ie-made">made</span></div>
            </div>
          </div>
        </div>
      )}

      {n >= 4 && (
        <p className="ie-close iv-fade">The only difference is what you do with what you watch.</p>
      )}
      {n >= 5 && <p className="ie-sub iv-fade">with clarity, less becomes more</p>}
    </IntShell>
  )
}
