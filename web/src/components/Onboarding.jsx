import { useState, useRef, useEffect } from 'react'
import {
  ArrowIcon,
  ArrowLeftIcon,
  CheckIcon,
  LinkIcon,
  PlayIcon,
  SearchIcon,
  GoalIcon,
} from './Icons'
import ProcessingOverlay from './ProcessingOverlay'
import {
  ConsumptionTruth,
  ActionGap,
  ForgettingCurveInt,
  HabitMomentum,
  SmallWin,
  FutureYou,
} from './Interstitials'

/* ============================================================
   CLARITY — ONBOARDING (10-step flow + cinematic interstitials)
   ============================================================ */

const ONBOARD_THEMES = [
  { id: 'clean', label: 'Clean', accent: 'teal', fontset: 'modern', theme: 'dark',
    pv: { bg: '#0a0b0d', fg: '#ededed', a2: '#6FE8CC', panel: 'rgba(255,255,255,0.06)',
          font: '"Geist", sans-serif', fontName: 'Geist', italic: false, radius: 16, light: false } },
  { id: 'warm', label: 'Warm', accent: 'amber', fontset: 'editorial', theme: 'dark',
    pv: { bg: '#0a0b0d', fg: '#ededed', a2: '#E5B86F', panel: 'rgba(255,255,255,0.06)',
          font: '"Instrument Serif", serif', fontName: 'Instrument Serif', italic: true, radius: 16, light: false } },
  { id: 'soft', label: 'Soft', accent: 'rose', fontset: 'soft', theme: 'light',
    pv: { bg: '#f6f6f4', fg: '#16181c', a2: '#F2A8BD', panel: 'rgba(0,0,0,0.05)',
          font: '"DM Serif Display", serif', fontName: 'DM Serif Display', italic: false, radius: 18, light: true } },
]

const ONBOARD_CATS = [
  { id: 'career', name: 'Career', color: '#4A9B8E', ex: 'e.g. Get into quant finance' },
  { id: 'health', name: 'Health', color: '#7BAE7E', ex: 'e.g. Run a sub-25 5K' },
  { id: 'finance', name: 'Finance', color: '#C99B5C', ex: 'e.g. Save $20k by December' },
  { id: 'learning', name: 'Learning', color: '#5BA3D0', ex: 'e.g. Read 24 books this year' },
  { id: 'creative', name: 'Creative', color: '#C9788C', ex: 'e.g. Publish 10 essays' },
  { id: 'relationships', name: 'Relationships', color: '#A68FBE', ex: 'e.g. Call mum every Sunday' },
]

const ONBOARD_PROBLEMS = [
  { id: 'p1', text: 'I save videos but never act on them' },
  { id: 'p2', text: 'I have goals but no clear system to reach them' },
  { id: 'p3', text: "I consume a lot of content but don't retain anything" },
  { id: 'p4', text: 'I start things but struggle to finish them' },
  { id: 'p5', text: 'I have too many ideas and struggle to commit to one' },
]

const BRIEFING_OPTS = [
  { id: 'morning', name: 'Morning', time: '8:00 am' },
  { id: 'afternoon', name: 'Afternoon', time: '1:00 pm' },
  { id: 'evening', name: 'Evening', time: '7:00 pm' },
]

const ATTRIBUTION_OPTS = [
  { id: 'tiktok', name: 'TikTok' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'reddit', name: 'Reddit' },
  { id: 'friend', name: 'A friend' },
  { id: 'other', name: 'Other' },
]

const PAYWALL_FEATURES = [
  { icon: 'play', text: 'Unlimited video processing' },
  { icon: 'tasks', text: 'AI actions with 48-hour deadlines' },
  { icon: 'progress', text: 'Daily briefing & weekly momentum' },
  { icon: 'search', text: 'Semantic search across everything you save' },
  { icon: 'goal', text: 'Goal tracking & behaviour insights' },
]

const FEATURE_ICONS = { play: PlayIcon, tasks: CheckIcon, progress: GoalIcon, search: SearchIcon, goal: GoalIcon }

/* phase → pip step index (interstitials inherit their preceding step) */
const PHASE_STEP = {
  theme: 0, attribution: 1, name: 2, intA: 2, problems: 3, intB: 3, cats: 4,
  goals: 5, intC: 5, habit: 5, url: 6, processing: 6, reveal: 6, intD: 6, intE: 6,
  briefing: 7, notifications: 8, paywall: 9,
}
const TOTAL_STEPS = 10
const JSON_HEADERS = { 'Content-Type': 'application/json' }

function capital(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

/* ============================================================
   Looping typing placeholder under the Watch Later link
   ============================================================ */
function TypingLine() {
  const PHRASES = [
    'that productivity video you saved last week',
    "the one you swore you'd watch properly",
    'literally anything from your Watch Later',
  ]
  const [text, setText] = useState('')
  const st = useRef({ idx: 0, char: 0, mode: 'type' })

  useEffect(() => {
    let timer
    const run = () => {
      const s = st.current
      const phrase = PHRASES[s.idx]
      if (s.mode === 'type') {
        s.char += 1
        setText(phrase.slice(0, s.char))
        if (s.char >= phrase.length) { s.mode = 'pause'; timer = setTimeout(run, 2000) }
        else timer = setTimeout(run, 2000 / phrase.length)
      } else if (s.mode === 'pause') {
        s.mode = 'delete'
        timer = setTimeout(run, 40)
      } else {
        s.char -= 1
        setText(phrase.slice(0, Math.max(0, s.char)))
        if (s.char <= 0) { s.mode = 'type'; s.idx = (s.idx + 1) % PHRASES.length; timer = setTimeout(run, 450) }
        else timer = setTimeout(run, 1000 / phrase.length)
      }
    }
    timer = setTimeout(run, 700)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="url-typing mono">
      <span>{text}</span><span className="url-caret">|</span>
    </div>
  )
}

/* ============================================================
   Onboarding — root flow
   ============================================================ */
export default function Onboarding({ onDone, setTheme, setAccent, setFontset }) {
  const [phase, setPhase] = useState('theme')
  const [themeId, setThemeId] = useState(null)
  const [name, setName] = useState('')
  const [problems, setProblems] = useState([])
  const [picked, setPicked] = useState([])
  const [goals, setGoals] = useState({})
  const [urlVal, setUrlVal] = useState('')
  const [briefing, setBriefing] = useState(null)
  const [source, setSource] = useState(null)
  const [showExit, setShowExit] = useState(false)
  const [exitSeen, setExitSeen] = useState(false)

  const goalIdsRef = useRef([])
  const firstName = name.trim() || 'there'

  function pickTheme(t) {
    setThemeId(t.id)
    setAccent?.(t.accent)
    setFontset?.(t.fontset)
    setTheme?.(t.theme)
  }
  function toggleProblem(id) {
    setProblems((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < 2 ? [...p, id] : p))
  }
  function togglePick(id) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < 3 ? [...p, id] : p))
  }

  // Create a goal-area + goal per picked category; keep the new ids for the
  // final onboarding payload. Fire-and-forget so it doesn't block the flow.
  async function persistGoals() {
    const ids = []
    for (const catId of picked) {
      const cat = ONBOARD_CATS.find((c) => c.id === catId)
      const title = (goals[catId] || '').trim()
      if (!cat || !title) continue
      try {
        const aRes = await fetch('/api/goal-areas', {
          method: 'POST',
          headers: JSON_HEADERS,
          body: JSON.stringify({ name: cat.name, color: cat.color }),
        })
        const area = await aRes.json()
        if (area?.id == null) continue
        const gRes = await fetch('/api/goals', {
          method: 'POST',
          headers: JSON_HEADERS,
          body: JSON.stringify({ area_id: area.id, title }),
        })
        const goal = await gRes.json()
        if (goal?.id != null) ids.push(goal.id)
      } catch {
        /* ignore — best effort */
      }
    }
    goalIdsRef.current = ids
  }

  function processUrl() {
    if (urlVal.trim()) {
      fetch('/api/process', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ url: urlVal.trim() }),
      }).catch(() => {})
    }
    setPhase('processing')
  }

  function saveProfile() {
    return fetch('/api/onboarding', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({
        name: name.trim(),
        problem_statements: problems
          .map((id) => ONBOARD_PROBLEMS.find((p) => p.id === id)?.text)
          .filter(Boolean),
        goal_ids: goalIdsRef.current,
        digest_time: briefing || 'morning',
      }),
    }).catch(() => {})
  }

  function finish() {
    saveProfile()
    onDone()
  }

  function leavePaywall() {
    if (!exitSeen) { setExitSeen(true); setShowExit(true) }
    else finish()
  }

  // Reveal pills show the user's real goals (category dot + text), falling
  // back to the category example, then a demo set.
  const DEMO_GOAL_PILLS = [
    { name: 'Save £20k by December', color: '#C99B5C' },
    { name: 'Read 20 books', color: '#5BA3D0' },
    { name: 'Learn to open up to my parents', color: '#A68FBE' },
  ]
  const goalPills = picked.length
    ? picked.map((id) => {
        const c = ONBOARD_CATS.find((x) => x.id === id)
        const typed = (goals[id] || '').trim()
        const pillName = typed.length >= 2 ? typed : c.ex.replace(/^e\.g\.\s*/i, '')
        return { name: pillName, color: c.color }
      })
    : DEMO_GOAL_PILLS
  const learnId = picked.find((id) => id === 'learning' || id === 'career')
  const goalLabel = learnId ? ONBOARD_CATS.find((c) => c.id === learnId).name : 'Learning'

  const canGoals = picked.length > 0 && picked.every((id) => (goals[id] || '').trim().length > 0)
  const step = PHASE_STEP[phase]
  const briefingTime = (BRIEFING_OPTS.find((b) => b.id === briefing) || {}).time || '8:00 am'

  /* ---- cinematic interstitials & processing render full-bleed ---- */
  if (phase === 'intA') return <ConsumptionTruth onDone={() => setPhase('problems')} />
  if (phase === 'intB') return <ActionGap onDone={() => setPhase('cats')} />
  if (phase === 'intC') return <ForgettingCurveInt onDone={() => setPhase('habit')} />
  if (phase === 'habit') return <HabitMomentum onDone={() => setPhase('url')} />
  if (phase === 'intD') return <SmallWin onDone={() => setPhase('intE')} />
  if (phase === 'intE') return <FutureYou onDone={() => setPhase('briefing')} />

  if (phase === 'processing' || phase === 'reveal') {
    return (
      <ProcessingOverlay
        source={{ title: 'Cal Newport — the case for slow productivity (Lex Fridman ep. 414)', source: 'youtube.com', type: 'video', duration: '1:14:22' }}
        goalLabel={goalLabel}
        goalPills={goalPills}
        reveal
        finishLabel="Let's go"
        onFinish={() => setPhase('intD')}
      />
    )
  }

  return (
    <div className="onboard-screen dot-bg">
      <div className="onboard-shell">
        <div className="onboard-head">
          <span className="wordmark" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>
            Clarity<span style={{ color: 'var(--accent-bright)' }}>.</span>
          </span>
          <div className="onboard-steps mono">
            {Array.from({ length: TOTAL_STEPS }).map((_, n) => (
              <span key={n} className={`step-pip ${step >= n ? 'on' : ''}`} />
            ))}
            <span style={{ marginLeft: 8 }}>{step + 1} / {TOTAL_STEPS}</span>
          </div>
        </div>

        {/* ---------- STEP 0 · THEME ---------- */}
        {phase === 'theme' && (
          <div className="onboard-step">
            <div className="theme-welcome">
              <h1 className="theme-welcome-h">Welcome to Clarity<span className="i-acc">.</span></h1>
              <p className="theme-welcome-sub mono">Pick a look that feels right. You can always change it later.</p>
            </div>

            <div className="theme-picker">
              {ONBOARD_THEMES.map((t) => (
                <button
                  key={t.id}
                  className={`theme-card ${themeId === t.id ? 'on' : ''}`}
                  style={{ borderRadius: t.pv.radius }}
                  onClick={() => pickTheme(t)}
                >
                  <div
                    className={`theme-preview ${t.pv.light ? 'is-light' : ''}`}
                    style={{ background: t.pv.bg, borderRadius: t.pv.radius - 4 }}
                  >
                    <div className="tp-swatch" style={{ background: t.pv.panel }} />
                    <div className="tp-bar" style={{ background: t.pv.panel }}>
                      <span className="tp-fill" style={{ background: t.pv.a2 }} />
                    </div>
                    <div className="tp-heading" style={{ color: t.pv.fg, fontFamily: t.pv.font, fontStyle: t.pv.italic ? 'italic' : 'normal' }}>
                      Clarity.
                    </div>
                    <div className="tp-sub" style={{ color: t.pv.fg }}>{t.pv.fontName}</div>
                  </div>
                  <span className="tp-label">{t.label}</span>
                </button>
              ))}
            </div>

            <div className="onboard-foot">
              <span style={{ flex: 1 }} />
              <button className="btn btn-gate" disabled={!themeId} onClick={() => setPhase('attribution')}>
                Continue <ArrowIcon width={12} height={12} />
              </button>
            </div>
          </div>
        )}

        {/* ---------- STEP 1 · ATTRIBUTION ---------- */}
        {phase === 'attribution' && (
          <div className="onboard-step">
            <h1 className="onboard-h">How did you find Clarity?</h1>
            <p className="onboard-sub mono">Helps us know where to find more people like you.</p>
            <div className="attr-grid">
              {ATTRIBUTION_OPTS.map((o) => (
                <button key={o.id} className={`attr-card ${source === o.id ? 'on' : ''}`} onClick={() => setSource(o.id)}>
                  <span className="attr-name mono">{o.name}</span>
                  <span className="cat-check">{source === o.id ? <CheckIcon width={12} height={12} /> : null}</span>
                </button>
              ))}
            </div>
            <div className="onboard-foot">
              <button className="btn btn-ghost" onClick={() => setPhase('theme')}>
                <ArrowLeftIcon width={11} height={11} /> Back
              </button>
              <span style={{ flex: 1 }} />
              <button className="attr-skip mono" onClick={() => setPhase('name')}>Skip</button>
              <button className="btn btn-gate" disabled={!source} onClick={() => setPhase('name')}>
                Continue <ArrowIcon width={12} height={12} />
              </button>
            </div>
          </div>
        )}

        {/* ---------- STEP 2 · NAME ---------- */}
        {phase === 'name' && (
          <div className="onboard-step">
            <h1 className="onboard-h">What should we call you?</h1>
            <div className="name-field">
              <input
                autoFocus
                placeholder="Your first name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && name.trim().length >= 2) setPhase('intA') }}
              />
            </div>
            <div className="onboard-foot">
              <button className="btn btn-ghost" onClick={() => setPhase('attribution')}>
                <ArrowLeftIcon width={11} height={11} /> Back
              </button>
              <span style={{ flex: 1 }} />
              <button className="btn btn-gate" disabled={name.trim().length < 2} onClick={() => setPhase('intA')}>
                Continue <ArrowIcon width={12} height={12} />
              </button>
            </div>
          </div>
        )}

        {/* ---------- STEP 3 · PROBLEMS ---------- */}
        {phase === 'problems' && (
          <div className="onboard-step">
            <h1 className="onboard-h">Which of these sounds like you, {capital(firstName)}?</h1>
            <p className="onboard-sub mono">Pick 1 or 2. Be honest.</p>
            <div className="onboard-cats problems">
              {ONBOARD_PROBLEMS.map((pr, i) => (
                <button key={pr.id} className={`onboard-cat ${problems.includes(pr.id) ? 'on' : ''}`} onClick={() => toggleProblem(pr.id)}>
                  <span className="cat-num mono">{String(i + 1).padStart(2, '0')}</span>
                  <span className="cat-name">{pr.text}</span>
                  <span className="cat-check">{problems.includes(pr.id) ? <CheckIcon width={12} height={12} /> : null}</span>
                </button>
              ))}
            </div>
            <div className="onboard-foot">
              <button className="btn btn-ghost" onClick={() => setPhase('name')}>
                <ArrowLeftIcon width={11} height={11} /> Back
              </button>
              <span className="mono onboard-counter">{problems.length} / 2 selected</span>
              <span style={{ flex: 1 }} />
              <button className="btn btn-gate" disabled={problems.length < 1} onClick={() => setPhase('intB')}>
                Continue <ArrowIcon width={12} height={12} />
              </button>
            </div>
          </div>
        )}

        {/* ---------- STEP 4 · GOAL CATEGORIES ---------- */}
        {phase === 'cats' && (
          <div className="onboard-step">
            <h1 className="onboard-h">What are you working toward?</h1>
            <p className="onboard-sub mono">Pick 2 or 3. You can change these later.</p>
            <div className="onboard-cats">
              {ONBOARD_CATS.map((c, i) => (
                <button key={c.id} className={`onboard-cat ${picked.includes(c.id) ? 'on' : ''}`} onClick={() => togglePick(c.id)}>
                  <span className="cat-num mono">{String(i + 1).padStart(2, '0')}</span>
                  <span className="cat-name">{c.name}</span>
                  <span className="cat-check">{picked.includes(c.id) ? <CheckIcon width={12} height={12} /> : null}</span>
                </button>
              ))}
            </div>
            <div className="onboard-foot">
              <button className="btn btn-ghost" onClick={() => setPhase('problems')}>
                <ArrowLeftIcon width={11} height={11} /> Back
              </button>
              <span className="mono onboard-counter">{picked.length} / 3 selected</span>
              <span style={{ flex: 1 }} />
              <button className="btn btn-gate" disabled={picked.length < 2} onClick={() => setPhase('goals')}>
                Continue <ArrowIcon width={12} height={12} />
              </button>
            </div>
          </div>
        )}

        {/* ---------- STEP 5 · GOAL TYPING ---------- */}
        {phase === 'goals' && (
          <div className="onboard-step">
            <h1 className="onboard-h">Name your goals</h1>
            <p className="onboard-sub mono">One goal per category. Keep it specific.</p>
            <div className="onboard-goals">
              {picked.map((id, idx) => {
                const c = ONBOARD_CATS.find((x) => x.id === id)
                return (
                  <div className="goal-row" key={id}>
                    <span className="goal-label">
                      <span className="gdot" style={{ background: c.color }} />
                      {c.name}
                    </span>
                    <input
                      autoFocus={idx === 0}
                      placeholder={c.ex}
                      value={goals[id] || ''}
                      onChange={(e) => setGoals((g) => ({ ...g, [id]: e.target.value }))}
                    />
                  </div>
                )
              })}
            </div>
            <div className="onboard-foot">
              <button className="btn btn-ghost" onClick={() => setPhase('cats')}>
                <ArrowLeftIcon width={11} height={11} /> Back
              </button>
              <span style={{ flex: 1 }} />
              <button className="btn btn-gate" disabled={!canGoals} onClick={() => { persistGoals(); setPhase('intC') }}>
                Continue <ArrowIcon width={12} height={12} />
              </button>
            </div>
          </div>
        )}

        {/* ---------- STEP 6 · PASTE URL ---------- */}
        {phase === 'url' && (
          <div className="onboard-step">
            <h1 className="onboard-h">You know that Watch Later playlist?</h1>
            <p style={{ margin: '0 0 26px', color: 'var(--fg-3)', fontSize: 14 }}>Pick one. Paste it below.</p>

            <div className="url-hero-input">
              <LinkIcon width={15} height={15} style={{ color: 'var(--fg-3)', flexShrink: 0 }} />
              <input
                autoFocus
                placeholder="Paste a YouTube URL..."
                value={urlVal}
                onChange={(e) => setUrlVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') processUrl() }}
              />
              <button className="url-go" onClick={processUrl}>Process</button>
            </div>

            <div className="url-wl-row">
              <a className="url-wl-link" href="https://www.youtube.com/playlist?list=WL" target="_blank" rel="noopener noreferrer">
                Open my Watch Later <ArrowIcon width={11} height={11} />
              </a>
            </div>

            <TypingLine />

            <div className="onboard-foot" style={{ marginTop: 40 }}>
              <button className="btn btn-ghost" onClick={() => setPhase('goals')}>
                <ArrowLeftIcon width={11} height={11} /> Back
              </button>
            </div>
          </div>
        )}

        {/* ---------- STEP 7 · BRIEFING ---------- */}
        {phase === 'briefing' && (
          <div className="onboard-step">
            <h1 className="onboard-h">When should we send your daily briefing?</h1>
            <p className="onboard-sub mono">We'll check what you saved and suggest your next move.</p>
            <div className="briefing-row">
              {BRIEFING_OPTS.map((b) => (
                <button key={b.id} className={`briefing-pill ${briefing === b.id ? 'on' : ''}`} onClick={() => setBriefing(b.id)}>
                  <span className="bp-lbl">briefing</span>
                  <span className="bp-name">{b.name}</span>
                  <span className="bp-time mono">{b.time}</span>
                </button>
              ))}
            </div>
            <div className="onboard-foot">
              <span style={{ flex: 1 }} />
              <button className="btn btn-gate" disabled={!briefing} onClick={() => setPhase('notifications')}>
                Continue <ArrowIcon width={12} height={12} />
              </button>
            </div>
          </div>
        )}

        {/* ---------- STEP 8 · NOTIFICATION PERMISSION ---------- */}
        {phase === 'notifications' && (
          <div className="onboard-step">
            <h1 className="onboard-h">Never miss your briefing.</h1>
            <p className="onboard-sub mono">We'll nudge you at {briefingTime} with your actions for the day.</p>

            <div className="notif-card">
              <div className="notif-top">
                <span className="notif-icon"><span className="notif-dot" /></span>
                <span className="notif-app mono">Clarity</span>
                <span className="notif-time mono">now</span>
              </div>
              <div className="notif-title">Your daily briefing</div>
              <div className="notif-body">3 actions waiting from what you saved.</div>
            </div>

            <div className="notif-actions">
              <button className="btn btn-accent notif-allow" onClick={() => setPhase('paywall')}>Allow notifications</button>
              <button className="notif-skip mono" onClick={() => setPhase('paywall')}>Not now</button>
            </div>
          </div>
        )}

        {/* ---------- STEP 9 · PAYWALL ---------- */}
        {phase === 'paywall' && (
          <div className="onboard-step pw-step">
            <p className="pw-eyebrow mono">built for people who watch to learn</p>
            <h1 className="pw-h">Unlock Clarity.</h1>
            <p className="pw-sub">Cancel anytime.</p>

            <div className="pw-shared">
              <span className="pw-feat-ic" aria-hidden="true" />
              <p className="pw-shared-h mono">EVERYTHING IN CLARITY</p>
              {PAYWALL_FEATURES.map((f) => {
                const Icon = FEATURE_ICONS[f.icon] || CheckIcon
                return (
                  <span key={f.text} style={{ display: 'contents' }}>
                    <span className="pw-feat-ic"><Icon width={15} height={15} /></span>
                    <span className="pw-feat-label">{f.text}</span>
                  </span>
                )
              })}
            </div>

            <div className="pw-cards">
              <div className="pw-card pw-hero">
                <span className="pw-badge mono">BEST VALUE</span>
                <div className="pw-plan">Annual</div>
                <div className="pw-tag">Less than one textbook.</div>
                <div className="pw-price">
                  <span className="pw-amt">£39.99</span><span className="pw-per">/year</span>
                </div>
                <div className="pw-math">
                  <span className="pw-strike">£9.99/mo</span>
                  <span className="pw-real">£3.33/mo billed annually</span>
                  <span className="pw-save mono">save 67%</span>
                </div>
                <button className="btn btn-accent pw-cta" onClick={finish}>
                  Unlock Clarity <ArrowIcon width={12} height={12} />
                </button>
              </div>

              <div className="pw-card">
                <div className="pw-plan">Monthly</div>
                <div className="pw-tag">Less than one streaming service.</div>
                <div className="pw-price">
                  <span className="pw-amt">£9.99</span><span className="pw-per">/month</span>
                </div>
                <div className="pw-math">
                  <span className="pw-annualised mono">£119.88/year billed monthly</span>
                </div>
                <button className="btn pw-cta pw-cta-ghost" onClick={finish}>
                  Choose monthly <ArrowIcon width={12} height={12} />
                </button>
              </div>
            </div>

            <button className="pw-dismiss mono" onClick={leavePaywall}>Maybe later</button>
            <p className="pw-reassure mono">No hidden fees. Cancel anytime in settings.</p>

            {/* Exit-discount overlay (one-time) */}
            {showExit && (
              <div className="exit-backdrop" onClick={() => { setShowExit(false); finish() }}>
                <div className="exit-card" onClick={(e) => e.stopPropagation()}>
                  <p className="exit-eyebrow mono">wait —</p>
                  <h2 className="exit-h">Try Clarity for <span className="i-acc">£4.99</span>.</h2>
                  <p className="exit-sub">Your first 3 months. Then £9.99/month. Cancel anytime.</p>
                  <p className="exit-tag">Less than a coffee a month to actually act on what you watch.</p>
                  <button className="btn btn-accent exit-cta" onClick={finish}>
                    Start at £4.99/mo <ArrowIcon width={12} height={12} />
                  </button>
                  <button className="exit-decline mono" onClick={() => { setShowExit(false); finish() }}>
                    No thanks, maybe later
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
