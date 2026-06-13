/* ============================================================
   CLARITY — ONBOARDING (flow + step screens)
   7 step screens (pips 0–6). Cinematic interstitials A–E live in
   components/interstitials.jsx (full-bleed, no chrome, no auto-advance).
   ============================================================ */

const ONBOARD_THEMES = [
  {
    id: 'clean', label: 'Clean', accent: 'teal', fontset: 'modern', theme: 'dark',
    pv: { bg: '#0a0b0d', fg: '#ededed', a2: '#6FE8CC', panel: 'rgba(255,255,255,0.06)',
          font: '"Geist", sans-serif', fontName: 'Geist', italic: false, radius: 16, light: false },
  },
  {
    id: 'warm', label: 'Warm', accent: 'amber', fontset: 'editorial', theme: 'dark',
    pv: { bg: '#0a0b0d', fg: '#ededed', a2: '#E5B86F', panel: 'rgba(255,255,255,0.06)',
          font: '"Instrument Serif", serif', fontName: 'Instrument Serif', italic: true, radius: 16, light: false },
  },
  {
    id: 'soft', label: 'Soft', accent: 'rose', fontset: 'soft', theme: 'light',
    pv: { bg: '#f6f6f4', fg: '#16181c', a2: '#F2A8BD', panel: 'rgba(0,0,0,0.05)',
          font: '"DM Serif Display", serif', fontName: 'DM Serif Display', italic: false, radius: 18, light: true },
  },
];

const ONBOARD_CATS = [
  { id: 'career',        name: 'Career',        color: '#4A9B8E', ex: 'e.g. Get into quant finance' },
  { id: 'health',        name: 'Health',        color: '#7BAE7E', ex: 'e.g. Run a sub-25 5K' },
  { id: 'finance',       name: 'Finance',       color: '#C99B5C', ex: 'e.g. Save $20k by December' },
  { id: 'learning',      name: 'Learning',      color: '#5BA3D0', ex: 'e.g. Read 24 books this year' },
  { id: 'creative',      name: 'Creative',      color: '#C9788C', ex: 'e.g. Publish 10 essays' },
  { id: 'relationships', name: 'Relationships', color: '#A68FBE', ex: 'e.g. Call mum every Sunday' },
];

const ONBOARD_PROBLEMS = [
  { id: 'p1', text: 'I save videos but never act on them' },
  { id: 'p2', text: 'I have goals but no clear system to reach them' },
  { id: 'p3', text: "I consume a lot of content but don't retain anything" },
  { id: 'p4', text: 'I start things but struggle to finish them' },
  { id: 'p5', text: 'I have too many ideas and struggle to commit to one' },
];

const BRIEFING_OPTS = [
  { id: 'morning',   name: 'Morning',   time: '8:00 am' },
  { id: 'afternoon', name: 'Afternoon', time: '1:00 pm' },
  { id: 'evening',   name: 'Evening',   time: '7:00 pm' },
];

const ATTRIBUTION_OPTS = [
  { id: 'tiktok',    name: 'TikTok' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'youtube',   name: 'YouTube' },
  { id: 'reddit',    name: 'Reddit' },
  { id: 'friend',    name: 'A friend' },
  { id: 'other',     name: 'Other' },
];

const PAYWALL_FEATURES = [
  { icon: 'play',     text: 'Unlimited video processing' },
  { icon: 'tasks',    text: 'AI actions with 48-hour deadlines' },
  { icon: 'progress', text: 'Daily briefing & weekly momentum' },
  { icon: 'search',   text: 'Semantic search across everything you save' },
  { icon: 'goal',     text: 'Goal tracking & behaviour insights' },
];

/* phase → pip step index (interstitials & habit inherit their preceding step) */
const PHASE_STEP = {
  theme: 0, attribution: 1, name: 2, intA: 2, problems: 3, intB: 3, cats: 4,
  goals: 5, intC: 5, habit: 5, url: 6, processing: 6, reveal: 6, intD: 6, intE: 6,
  briefing: 7, notifications: 8, paywall: 9,
};
const TOTAL_STEPS = 10;

/* ============================================================
   STEP 5 — looping typing placeholder under the Watch Later link
   ============================================================ */
function TypingLine() {
  const PHRASES = [
    'that productivity video you saved last week',
    "the one you swore you'd watch properly",
    'literally anything from your Watch Later',
  ];
  const [text, setText] = React.useState('');
  const st = React.useRef({ idx: 0, char: 0, mode: 'type' });

  React.useEffect(() => {
    let timer;
    const run = () => {
      const s = st.current;
      const phrase = PHRASES[s.idx];
      if (s.mode === 'type') {
        s.char += 1;
        setText(phrase.slice(0, s.char));
        if (s.char >= phrase.length) { s.mode = 'pause'; timer = setTimeout(run, 2000); }
        else timer = setTimeout(run, 2000 / phrase.length);
      } else if (s.mode === 'pause') {
        s.mode = 'delete';
        timer = setTimeout(run, 40);
      } else {
        s.char -= 1;
        setText(phrase.slice(0, Math.max(0, s.char)));
        if (s.char <= 0) { s.mode = 'type'; s.idx = (s.idx + 1) % PHRASES.length; timer = setTimeout(run, 450); }
        else timer = setTimeout(run, 1000 / phrase.length);
      }
    };
    timer = setTimeout(run, 700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="url-typing mono">
      <span>{text}</span><span className="url-caret">|</span>
    </div>
  );
}

/* ============================================================
   ONBOARDING — root flow
   ============================================================ */
function Onboarding({ onDone, setTweak }) {
  const [phase, setPhase] = React.useState('welcome');
  const [theme, setTheme] = React.useState(null);
  const [name, setName] = React.useState('');
  const [problems, setProblems] = React.useState([]);
  const [picked, setPicked] = React.useState([]);
  const [goals, setGoals] = React.useState({});
  const [urlVal, setUrlVal] = React.useState('');
  const [briefing, setBriefing] = React.useState(null);
  const [source, setSource] = React.useState(null);
  const [plan, setPlan] = React.useState(null);
  const [showExit, setShowExit] = React.useState(false);
  const [exitSeen, setExitSeen] = React.useState(false);

  const firstName = name.trim() || 'there';

  function pickTheme(t) {
    setTheme(t.id);
    setTweak({ accent: t.accent, fontset: t.fontset, theme: t.theme });
  }
  function toggleProblem(id) {
    setProblems(p => p.includes(id) ? p.filter(x => x !== id) : (p.length < 2 ? [...p, id] : p));
  }
  function togglePick(id) {
    setPicked(p => p.includes(id) ? p.filter(x => x !== id) : (p.length < 3 ? [...p, id] : p));
  }

  // Pills on the reveal show the user's real goals (category dot + text). Fall
  // back to the category's example, then to a realistic demo set, so the pills
  // are never blank or placeholder text.
  const DEMO_GOAL_PILLS = [
    { name: 'Save £20k by December', color: '#C99B5C' },
    { name: 'Read 20 books', color: '#5BA3D0' },
    { name: 'Learn to open up to my parents', color: '#A68FBE' },
  ];
  const goalPills = picked.length
    ? picked.map(id => {
        const c = ONBOARD_CATS.find(x => x.id === id);
        const typed = (goals[id] || '').trim();
        const name = typed.length >= 2 ? typed : c.ex.replace(/^e\.g\.\s*/i, '');
        return { name, color: c.color };
      })
    : DEMO_GOAL_PILLS;
  // The fixed demo reveal action is a deep-work session — a Learning/Career
  // action, so tag it logically rather than to the user's first category.
  const learnId = picked.find(id => id === 'learning' || id === 'career');
  const goalLabel = learnId ? ONBOARD_CATS.find(c => c.id === learnId).name : 'Learning';
  const canGoals = picked.length > 0 && picked.every(id => (goals[id] || '').trim().length > 0);

  const step = PHASE_STEP[phase];
  const briefingTime = (BRIEFING_OPTS.find(b => b.id === briefing) || {}).time || '8:00 am';

  /* paywall dismissal — one-time exit offer, then route to (frozen) home */
  function leavePaywall() {
    if (!exitSeen) { setExitSeen(true); setShowExit(true); }
    else onDone();
  }

  /* ---- cinematic interstitials & processing render full-bleed (no shell) ---- */
  if (phase === 'welcome') return <window.WelcomeScreen onStart={() => setPhase('signup')} />;
  if (phase === 'signup') return <window.SignupScreen onDone={() => setPhase('theme')} />;
  if (phase === 'sartre') return <window.ColdOpen onDone={() => setPhase('attribution')} />;
  if (phase === 'intA') return <window.ConsumptionTruth name={capital(firstName)} onDone={() => setPhase('problems')} />;
  if (phase === 'intB') return <window.ActionGap onDone={() => setPhase('cats')} />;
  if (phase === 'intC') return <window.ForgettingCurveInt onDone={() => setPhase('habit')} />;
  if (phase === 'habit') return <window.HabitMomentum onDone={() => setPhase('url')} />;
  if (phase === 'intD') return <window.SmallWin onDone={() => setPhase('intE')} />;
  if (phase === 'intE') return <window.FutureYou onDone={() => setPhase('briefing')} />;

  if (phase === 'processing' || phase === 'reveal') {
    return (
      <window.ProcessingOverlay
        source={{ title: "Cal Newport — the case for slow productivity (Lex Fridman ep. 414)", source: 'youtube.com', type: 'video', duration: '1:14:22' }}
        goalLabel={goalLabel}
        goalPills={goalPills}
        reveal
        finishLabel="Let's go"
        onFinish={() => setPhase('intD')}
      />
    );
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
              <span key={n} className={`step-pip ${step >= n ? 'on' : ''}`}></span>
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
              {ONBOARD_THEMES.map(t => (
                <button
                  key={t.id}
                  className={`theme-card ${theme === t.id ? 'on' : ''}`}
                  style={{ borderRadius: t.pv.radius }}
                  onClick={() => pickTheme(t)}
                >
                  <div
                    className={`theme-preview ${t.pv.light ? 'is-light' : ''}`}
                    style={{ background: t.pv.bg, borderRadius: t.pv.radius - 4 }}
                  >
                    <div className="tp-swatch" style={{ background: t.pv.panel }}></div>
                    <div className="tp-bar" style={{ background: t.pv.panel }}>
                      <span className="tp-fill" style={{ background: t.pv.a2 }}></span>
                    </div>
                    <div className="tp-heading" style={{
                      color: t.pv.fg, fontFamily: t.pv.font,
                      fontStyle: t.pv.italic ? 'italic' : 'normal',
                    }}>Clarity.</div>
                    <div className="tp-sub" style={{ color: t.pv.fg }}>{t.pv.fontName}</div>
                  </div>
                  <span className="tp-label">{t.label}</span>
                </button>
              ))}
            </div>

            <div className="onboard-foot">
              <span style={{ flex: 1 }}></span>
              <button className="btn btn-gate" disabled={!theme} onClick={() => setPhase('sartre')}>
                Continue <Ico.arrow width={12} height={12} />
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
              {ATTRIBUTION_OPTS.map(o => (
                <button
                  key={o.id}
                  className={`attr-card ${source === o.id ? 'on' : ''}`}
                  onClick={() => setSource(o.id)}
                >
                  <span className="attr-name mono">{o.name}</span>
                  <span className="cat-check">
                    {source === o.id ? <Ico.check width={12} height={12} /> : null}
                  </span>
                </button>
              ))}
            </div>
            <div className="onboard-foot">
              <button className="btn btn-ghost" onClick={() => setPhase('theme')}>
                <Ico.arrowLeft width={11} height={11} /> Back
              </button>
              <span style={{ flex: 1 }}></span>
              <button className="attr-skip mono" onClick={() => setPhase('name')}>Skip</button>
              <button className="btn btn-gate" disabled={!source} onClick={() => setPhase('name')}>
                Continue <Ico.arrow width={12} height={12} />
              </button>
            </div>
          </div>
        )}

        {/* ---------- STEP 1 · NAME ---------- */}
        {phase === 'name' && (
          <div className="onboard-step">
            <h1 className="onboard-h">What should we call you?</h1>
            <div className="name-field">
              <input
                autoFocus
                placeholder="Your first name"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && name.trim().length >= 2) setPhase('intA'); }}
              />
            </div>
            <div className="onboard-foot">
              <button className="btn btn-ghost" onClick={() => setPhase('attribution')}>
                <Ico.arrowLeft width={11} height={11} /> Back
              </button>
              <span style={{ flex: 1 }}></span>
              <button className="btn btn-gate" disabled={name.trim().length < 2} onClick={() => setPhase('intA')}>
                Continue <Ico.arrow width={12} height={12} />
              </button>
            </div>
          </div>
        )}

        {/* ---------- STEP 2 · PROBLEMS ---------- */}
        {phase === 'problems' && (
          <div className="onboard-step">
            <h1 className="onboard-h">Which of these sounds like you, {capital(firstName)}?</h1>
            <p className="onboard-sub mono">Pick 1 or 2. Be honest.</p>
            <div className="onboard-cats problems">
              {ONBOARD_PROBLEMS.map((pr, i) => (
                <button
                  key={pr.id}
                  className={`onboard-cat ${problems.includes(pr.id) ? 'on' : ''}`}
                  onClick={() => toggleProblem(pr.id)}
                >
                  <span className="cat-num mono">{String(i + 1).padStart(2, '0')}</span>
                  <span className="cat-name">{pr.text}</span>
                  <span className="cat-check">
                    {problems.includes(pr.id) ? <Ico.check width={12} height={12} /> : null}
                  </span>
                </button>
              ))}
            </div>
            <div className="onboard-foot">
              <button className="btn btn-ghost" onClick={() => setPhase('name')}>
                <Ico.arrowLeft width={11} height={11} /> Back
              </button>
              <span className="mono onboard-counter">{problems.length} / 2 selected</span>
              <span style={{ flex: 1 }}></span>
              <button className="btn btn-gate" disabled={problems.length < 1} onClick={() => setPhase('intB')}>
                Continue <Ico.arrow width={12} height={12} />
              </button>
            </div>
          </div>
        )}

        {/* ---------- STEP 3 · GOAL CATEGORIES ---------- */}
        {phase === 'cats' && (
          <div className="onboard-step">
            <h1 className="onboard-h">What are you working toward?</h1>
            <p className="onboard-sub mono">Pick 2 or 3. You can change these later.</p>
            <div className="onboard-cats">
              {ONBOARD_CATS.map((c, i) => (
                <button
                  key={c.id}
                  className={`onboard-cat ${picked.includes(c.id) ? 'on' : ''}`}
                  onClick={() => togglePick(c.id)}
                >
                  <span className="cat-num mono">{String(i + 1).padStart(2, '0')}</span>
                  <span className="cat-name">{c.name}</span>
                  <span className="cat-check">
                    {picked.includes(c.id) ? <Ico.check width={12} height={12} /> : null}
                  </span>
                </button>
              ))}
            </div>
            <div className="onboard-foot">
              <button className="btn btn-ghost" onClick={() => setPhase('problems')}>
                <Ico.arrowLeft width={11} height={11} /> Back
              </button>
              <span className="mono onboard-counter">{picked.length} / 3 selected</span>
              <span style={{ flex: 1 }}></span>
              <button className="btn btn-gate" disabled={picked.length < 2} onClick={() => setPhase('goals')}>
                Continue <Ico.arrow width={12} height={12} />
              </button>
            </div>
          </div>
        )}

        {/* ---------- STEP 4 · GOAL TYPING ---------- */}
        {phase === 'goals' && (
          <div className="onboard-step">
            <h1 className="onboard-h">Name your goals</h1>
            <p className="onboard-sub mono">One goal per category. Keep it specific.</p>
            <div className="onboard-goals">
              {picked.map((id, idx) => {
                const c = ONBOARD_CATS.find(x => x.id === id);
                return (
                  <div className="goal-row" key={id}>
                    <span className="goal-label">
                      <span className="gdot" style={{ background: c.color }}></span>
                      {c.name}
                    </span>
                    <input
                      autoFocus={idx === 0}
                      placeholder={c.ex}
                      value={goals[id] || ''}
                      onChange={e => setGoals(g => ({ ...g, [id]: e.target.value }))}
                    />
                  </div>
                );
              })}
            </div>
            <div className="onboard-foot">
              <button className="btn btn-ghost" onClick={() => setPhase('cats')}>
                <Ico.arrowLeft width={11} height={11} /> Back
              </button>
              <span style={{ flex: 1 }}></span>
              <button className="btn btn-gate" disabled={!canGoals} onClick={() => setPhase('intC')}>
                Continue <Ico.arrow width={12} height={12} />
              </button>
            </div>
          </div>
        )}

        {/* ---------- STEP 5 · PASTE URL ---------- */}
        {phase === 'url' && (
          <div className="onboard-step">
            <h1 className="onboard-h">You know that Watch Later playlist?</h1>
            <p style={{ margin: '0 0 26px', color: 'var(--fg-3)', fontSize: 14 }}>Pick one. Paste it below.</p>

            <div className="url-hero-input">
              <Ico.link width={15} height={15} style={{ color: 'var(--fg-3)', flexShrink: 0 }} />
              <input
                autoFocus
                placeholder="Paste a YouTube URL..."
                value={urlVal}
                onChange={e => setUrlVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') setPhase('processing'); }}
              />
              <button className="url-go" onClick={() => setPhase('processing')}>Process</button>
            </div>

            <div className="url-wl-row">
              <a className="url-wl-link" href="https://www.youtube.com/playlist?list=WL" target="_blank" rel="noopener">
                Open my Watch Later <Ico.arrow width={11} height={11} />
              </a>
            </div>

            <TypingLine />

            <div className="onboard-foot" style={{ marginTop: 40 }}>
              <button className="btn btn-ghost" onClick={() => setPhase('goals')}>
                <Ico.arrowLeft width={11} height={11} /> Back
              </button>
            </div>
          </div>
        )}

        {/* ---------- STEP 6 · BRIEFING ---------- */}
        {phase === 'briefing' && (
          <div className="onboard-step">
            <h1 className="onboard-h">When should we send your daily briefing?</h1>
            <p className="onboard-sub mono">We'll check what you saved and suggest your next move.</p>
            <div className="briefing-row">
              {BRIEFING_OPTS.map(b => (
                <button
                  key={b.id}
                  className={`briefing-pill ${briefing === b.id ? 'on' : ''}`}
                  onClick={() => setBriefing(b.id)}
                >
                  <span className="bp-lbl">briefing</span>
                  <span className="bp-name">{b.name}</span>
                  <span className="bp-time mono">{b.time}</span>
                </button>
              ))}
            </div>
            <div className="onboard-foot">
              <span style={{ flex: 1 }}></span>
              <button className="btn btn-gate" disabled={!briefing} onClick={() => setPhase('notifications')}>
                Continue <Ico.arrow width={12} height={12} />
              </button>
            </div>
          </div>
        )}

        {/* ---------- STEP 8 · NOTIFICATION PERMISSION ---------- */}
        {phase === 'notifications' && (
          <div className="onboard-step">
            <h1 className="onboard-h">Never miss your briefing.</h1>
            <p className="onboard-sub mono">
              We'll nudge you at {briefingTime} with your actions for the day.
            </p>

            <div className="notif-card">
              <div className="notif-top">
                <span className="notif-icon">
                  <span className="notif-dot"></span>
                </span>
                <span className="notif-app mono">Clarity</span>
                <span className="notif-time mono">now</span>
              </div>
              <div className="notif-title">Your daily briefing</div>
              <div className="notif-body">3 actions waiting from what you saved.</div>
            </div>

            <div className="notif-actions">
              <button className="btn btn-accent notif-allow" onClick={() => setPhase('paywall')}>
                Allow notifications
              </button>
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

            {/* Shared feature list — both plans are the full app */}
            <div className="pw-shared">
              <span className="pw-feat-ic" aria-hidden="true"></span>
              <p className="pw-shared-h mono">EVERYTHING IN CLARITY</p>
              {PAYWALL_FEATURES.map(f => (
                <React.Fragment key={f.text}>
                  <span className="pw-feat-ic">{Ico[f.icon]({ width: 15, height: 15 })}</span>
                  <span className="pw-feat-label">{f.text}</span>
                </React.Fragment>
              ))}
            </div>

            {/* Billing choice — price & cadence only */}
            <div className="pw-cards">
              {/* Annual — hero */}
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
                <button className="btn btn-accent pw-cta" onClick={() => { setPlan('annual'); onDone(); }}>
                  Unlock Clarity <Ico.arrow width={12} height={12} />
                </button>
              </div>

              {/* Monthly — quieter */}
              <div className="pw-card">
                <div className="pw-plan">Monthly</div>
                <div className="pw-tag">Less than one streaming service.</div>
                <div className="pw-price">
                  <span className="pw-amt">£9.99</span><span className="pw-per">/month</span>
                </div>
                <div className="pw-math">
                  <span className="pw-annualised mono">£119.88/year billed monthly</span>
                </div>
                <button className="btn pw-cta pw-cta-ghost" onClick={() => { setPlan('monthly'); onDone(); }}>
                  Choose monthly <Ico.arrow width={12} height={12} />
                </button>
              </div>
            </div>

            <button className="pw-dismiss mono" onClick={leavePaywall}>Maybe later</button>
            <p className="pw-reassure mono">No hidden fees. Cancel anytime in settings.</p>

            {/* Exit-discount overlay (one-time) */}
            {showExit && (
              <div className="exit-backdrop" onClick={() => { setShowExit(false); onDone(); }}>
                <div className="exit-card" onClick={e => e.stopPropagation()}>
                  <p className="exit-eyebrow mono">wait —</p>
                  <h2 className="exit-h">Try Clarity for <span className="i-acc">£4.99</span>.</h2>
                  <p className="exit-sub">Your first 3 months. Then £9.99/month. Cancel anytime.</p>
                  <p className="exit-tag">Less than a coffee a month to actually act on what you watch.</p>
                  <button className="btn btn-accent exit-cta" onClick={() => { setPlan('intro'); onDone(); }}>
                    Start at £4.99/mo <Ico.arrow width={12} height={12} />
                  </button>
                  <button className="exit-decline mono" onClick={() => { setShowExit(false); onDone(); }}>
                    No thanks, maybe later
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function capital(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

Object.assign(window, { Onboarding });
