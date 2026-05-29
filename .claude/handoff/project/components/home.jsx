/* Home (Focus) screen — Focus Card hero, weekly stats, search, recent items
   Also exports Library + Onboarding components. */

/* ============================================================
   FOCUS HOME — the new hero-led home screen
   ============================================================ */

function Home({ setRoute, openDetail, openAdd, motto }) {
  const recents = React.useMemo(() => {
    return [...LIBRARY].sort((a, b) => a.addedAt - b.addedAt).slice(0, 4);
  }, []);

  return (
    <div className="main-inner focus-home">
      <section className="focus-home-head">
        <div className="eyebrow">/ focus</div>
        <h1 className="home-title welcome focus-greeting">
          <WelcomeGreeting name="Jordan" /><span className="motto-inline">{motto}</span>
        </h1>
      </section>

      {/* HERO Focus Card */}
      <FocusCard openDetail={openDetail} />

      {/* Weekly stats bar */}
      <WeeklyStats />

      {/* Search bar */}
      <div className="search-bar focus-search">
        <Ico.search className="ico" />
        <input
          placeholder="Search your saved content"
          onFocus={() => setRoute('library')}
          readOnly
        />
        <span className="kbd">⌘K</span>
      </div>

      {/* Recents strip */}
      <section className="recents">
        <div className="recents-head">
          <span className="eyebrow">/ recently saved</span>
          <button className="link-btn" onClick={() => setRoute('library')}>
            See all in Library <Ico.arrow width={11} height={11} />
          </button>
        </div>
        <div className="recents-row">
          {recents.map((c) => (
            <RecentMini key={c.id} item={c} onClick={() => openDetail(c.id)} />
          ))}
        </div>
      </section>
    </div>
  );
}

function WelcomeGreeting({ name }) {
  const greetingForHour = (h) => {
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };
  const [greeting, setGreeting] = React.useState(() => greetingForHour(new Date().getHours()));
  React.useEffect(() => {
    const t = setInterval(() => setGreeting(greetingForHour(new Date().getHours())), 60 * 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span>{greeting}, <span className="ink">{name}</span>.</span>
  );
}

/* ============================================================
   FOCUS CARD — hero, progress bar, actions, chain dots
   ============================================================ */

function FocusCard({ openDetail }) {
  // 48h window — pick a point inside it so the bar isn't always full
  const WINDOW_MS = 48 * 60 * 60 * 1000;
  const startedRef = React.useRef(Date.now() - (6 * 60 * 60 * 1000 + 43 * 60 * 1000));
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const elapsed = now - startedRef.current;
  const remaining = Math.max(0, WINDOW_MS - elapsed);
  const pct = Math.max(0, Math.min(1, remaining / WINDOW_MS));
  const hoursRemaining = remaining / 3.6e6;

  // colour state
  let phase = 'green';
  if (hoursRemaining < 12) phase = 'red';
  else if (hoursRemaining < 24) phase = 'amber';
  const phaseColor = phase === 'green' ? '#4ADE80'
                   : phase === 'amber' ? '#FBBF24'
                   : '#F87171';

  const h = Math.floor(remaining / 3.6e6);
  const m = Math.floor((remaining / 6e4) % 60);
  const s = Math.floor((remaining / 1000) % 60);
  const pad = (n) => String(n).padStart(2, '0');

  // actions
  const [actionState, setActionState] = React.useState('idle'); // idle | done | skipped | expired
  const [moreTimeUsed, setMoreTimeUsed] = React.useState(false);

  // rescue moment — amber/red phase
  const inRescue = (phase === 'amber' || phase === 'red') && actionState === 'idle';

  // chain dots — 7 days of the current week (daily streak)
  const DAY_LABELS = ['m', 't', 'w', 't', 'f', 's', 's'];
  const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0 … Sun=6
  // deterministic week: past days done, one missed, today pulsing, future empty
  const [todayDone, setTodayDone] = React.useState(false);
  const weekStates = DAY_LABELS.map((_, i) => {
    if (i < todayIdx) return (i === todayIdx - 2 && todayIdx >= 2) ? 'broken' : 'done';
    if (i === todayIdx) return todayDone ? 'done' : 'current';
    return 'todo';
  });
  const daysCompleted = weekStates.filter(s => s === 'done').length;
  const broken = actionState === 'skipped' || actionState === 'expired';

  function doDone() {
    if (actionState !== 'idle') return;
    setActionState('done');
    setTodayDone(true); // light up today's streak dot
  }
  function doSkip() {
    if (actionState !== 'idle') return;
    setActionState('skipped');
  }
  function doMoreTime() {
    if (moreTimeUsed || actionState !== 'idle') return;
    setMoreTimeUsed(true);
    // shift start so remaining grows by 12h
    startedRef.current = startedRef.current + 12 * 60 * 60 * 1000;
  }

  return (
    <article
      className={`focus-hero focus-phase-${phase} ${broken ? 'is-broken' : ''} ${actionState === 'done' ? 'is-done' : ''} ${inRescue ? 'rescue' : ''}`}
      style={{ '--phase-color': phaseColor }}
    >
      <div className="focus-hero-top">
        <div className="focus-hero-label">
          <span className="pulse" style={{ background: phaseColor, boxShadow: `0 0 0 0 ${phaseColor}` }}></span>
          Focus action · {phase === 'red' ? 'expires very soon' : phase === 'amber' ? 'expires today' : 'in your window'}
        </div>
        <div className="focus-hero-meta mono">
          From <em>The 5 types of wealth</em> · Mindset
        </div>
      </div>

      <h2 className="focus-hero-title">
        Finish the '5 types of wealth' check-in.
      </h2>
      <p className="focus-hero-desc">
        One sentence per wealth — where you are, where you want to be. Aim for 200 words total.
      </p>

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
            {pad(h)}<span className="sep">:</span>{pad(m)}<span className="sep">:</span>{pad(s)}
          </span>
          <span className="left">left in window</span>
        </div>
      </div>

      {/* Actions */}
      <div className="focus-actions">
        {inRescue && (
          <span className="rescue-label mono">Running low — extend your window?</span>
        )}
        <button
          className={`fa-btn fa-done ${actionState === 'done' ? 'is-on' : ''}`}
          onClick={doDone}
          disabled={actionState !== 'idle'}
        >
          {actionState === 'done' ? (
            <><Ico.check width={14} height={14} /> Done</>
          ) : (
            <>Done <Ico.check width={13} height={13} /></>
          )}
        </button>
        <button
          className="fa-btn fa-skip"
          onClick={doSkip}
          disabled={actionState !== 'idle'}
        >
          Skip
        </button>
        <button
          className="fa-btn fa-more"
          onClick={doMoreTime}
          disabled={moreTimeUsed || actionState !== 'idle'}
        >
          {moreTimeUsed ? '+12h used' : 'More time'}
        </button>
        <span className="focus-actions-spacer"></span>
        <button className="fa-detail" onClick={() => openDetail && openDetail('c2')}>
          Open detail <Ico.arrow width={11} height={11} />
        </button>
      </div>

      {/* Chain dots — daily streak across this week */}
      <div className={`chain ${broken ? 'is-broken' : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div className="chain-track">
            {weekStates.map((state, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className={`chain-link chain-link-${state}`}></span>}
                <span className={`chain-dot chain-dot-${state}`}></span>
              </React.Fragment>
            ))}
          </div>
          <div className="chain-day-labels">
            {DAY_LABELS.map((d, i) => (
              <span key={i} className={`cdl ${i === todayIdx ? 'is-today' : ''}`}>{d}</span>
            ))}
          </div>
        </div>
        <span className="chain-label mono">
          {broken ? 'streak broken' : `this week · ${daysCompleted} day${daysCompleted === 1 ? '' : 's'}`}
        </span>
      </div>
    </article>
  );
}

/* ============================================================
   WEEKLY STATS — small mirror, not a celebration
   ============================================================ */

function WeeklyStats() {
  const shipped = 5;      // actions completed this week
  const saved = 4;        // pieces of content saved this week
  const ratio = saved > 0 ? shipped / saved : shipped;
  const ratioStr = (Math.round(ratio * 10) / 10).toFixed(1);
  const isLow = ratio < 1.0;

  return (
    <div className={`weekly-stats ${isLow ? 'is-low' : ''}`}>
      {isLow ? (
        <>
          You shipped <span className="num">{shipped}</span> action{shipped === 1 ? '' : 's'} from{' '}
          <span className="num">{saved}</span> save{saved === 1 ? '' : 's'} this week.{' '}
          <span className="ratio">{ratioStr}×</span> <span className="verdict">— room to grow.</span>
        </>
      ) : (
        <>
          You shipped <span className="num">{shipped}</span> action{shipped === 1 ? '' : 's'} this week from the{' '}
          <span className="num">{saved}</span> piece{saved === 1 ? '' : 's'} of content you saved.{' '}
          <span className="ratio">{ratioStr}×</span> <span className="verdict">momentum — nice.</span>
        </>
      )}
    </div>
  );
}

/* ============================================================
   RECENT MINI CARD — compact, used on home strip
   ============================================================ */

function RecentMini({ item, onClick }) {
  const cat = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[0];
  return (
    <button className="recent-mini" onClick={onClick}>
      <span className="rm-row">
        <ContentTypeMark type={item.type} />
        <span className="rm-type mono">{item.typeLabel}</span>
        <span className="rm-ts mono">{item.added}</span>
      </span>
      <span className="rm-title">{item.title}</span>
      <span className="rm-foot">
        <span className="tag" style={{ padding: '2px 7px', fontSize: 9.5 }}>
          <span className="dot" style={{ background: cat.color }}></span>
          {cat.name.toLowerCase()}
        </span>
      </span>
    </button>
  );
}

/* ============================================================
   LIBRARY — full filterable grid, sort dropdown, Add content
   ============================================================ */

function Library({ openDetail, openAdd, initialFilter, onFilterChange }) {
  const [filter, setFilterLocal] = React.useState(initialFilter || 'all');
  const [sort, setSort] = React.useState('Newest');
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    if (initialFilter && initialFilter !== filter) setFilterLocal(initialFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFilter]);

  const setFilter = (v) => {
    setFilterLocal(v);
    if (onFilterChange) onFilterChange(v);
  };

  const items = React.useMemo(() => {
    let r = LIBRARY;
    if (filter !== 'all') r = r.filter(x => x.category === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(x =>
        x.title.toLowerCase().includes(q) || x.summary.toLowerCase().includes(q));
    }
    if (sort === 'Newest') r = [...r].sort((a, b) => a.addedAt - b.addedAt);
    if (sort === 'Oldest') r = [...r].sort((a, b) => b.addedAt - a.addedAt);
    return r;
  }, [filter, sort, search]);

  return (
    <div className="main-inner">
      <section className="home-hero dot-bg" style={{ padding: '24px 0 8px' }}>
        <div className="eyebrow">/ library</div>
        <h1 className="home-title welcome">Everything you've saved.</h1>

        <div className="search-bar">
          <Ico.search className="ico" />
          <input
            placeholder="Search your saved content"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className="kbd">⌘K</span>
        </div>
      </section>

      <div className="filters">
        {CATEGORIES.map(c => (
          <button key={c.id}
            className={`pill ${filter === c.id ? 'active' : ''}`}
            onClick={() => setFilter(c.id)}
          >
            <span className="dot" style={{ background: c.color }}></span>
            {c.name}
          </button>
        ))}
        <span className="spacer"></span>
        <SortDropdown value={sort} onChange={setSort} />
      </div>

      <div className="lib-meta">
        <span>{items.length} pieces · {filter === 'all' ? 'all categories' : filter}</span>
        <span>· sort {sort.toLowerCase()}</span>
        <button className="add-pill" onClick={openAdd}>
          <Ico.add width={14} height={14} />
          Add content
        </button>
      </div>

      <div className="grid">
        {items.map((c, i) => (
          <ContentCard key={c.id} item={c} idx={i} onClick={() => openDetail(c.id)} />
        ))}
        {!items.length && <EmptyState />}
      </div>
    </div>
  );
}

/* ============================================================
   ONBOARDING — 3 step overlay
   ============================================================ */

const ONBOARD_CATS = [
  { id: 'career',        name: 'Career',        ex: 'e.g. Get into quant finance' },
  { id: 'health',        name: 'Health',        ex: 'e.g. Run a sub-25 5K' },
  { id: 'finance',       name: 'Finance',       ex: 'e.g. Save $20k by December' },
  { id: 'learning',      name: 'Learning',      ex: 'e.g. Read 24 books this year' },
  { id: 'creative',      name: 'Creative',      ex: 'e.g. Publish 10 essays' },
  { id: 'relationships', name: 'Relationships', ex: 'e.g. Call mum every Sunday' },
];

const ONBOARD_PROBLEMS = [
  { id: 'p1', text: 'I save videos but never act on them' },
  { id: 'p2', text: 'I have goals but no clear system to reach them' },
  { id: 'p3', text: "I consume a lot of content but don't retain anything" },
  { id: 'p4', text: 'I start things but struggle to finish them' },
];

const BRIEFING_OPTS = [
  { id: 'morning',   name: 'Morning',   time: '8:00 am' },
  { id: 'afternoon', name: 'Afternoon', time: '1:00 pm' },
  { id: 'evening',   name: 'Evening',   time: '7:00 pm' },
];

/* Onboarding — 6 steps:
   0 problems · 1 categories · 2 specifics · 3 preview · 4 url(+processing) · 5 briefing */
function Onboarding({ onDone }) {
  const TOTAL = 6;
  const [step, setStep] = React.useState(0);
  const [problems, setProblems] = React.useState([]);
  const [picked, setPicked] = React.useState([]);
  const [goals, setGoals] = React.useState({});
  const [urlVal, setUrlVal] = React.useState('');
  const [processing, setProcessing] = React.useState(false);
  const [briefing, setBriefing] = React.useState(null);

  function toggleProblem(id) {
    setProblems(p => p.includes(id) ? p.filter(x => x !== id) : (p.length < 2 ? [...p, id] : p));
  }
  function togglePick(id) {
    setPicked(p => p.includes(id) ? p.filter(x => x !== id) : (p.length < 3 ? [...p, id] : p));
  }

  const canNext0 = problems.length >= 1;
  const canNext1 = picked.length >= 2;
  const canNext2 = picked.every(id => (goals[id] || '').trim().length > 0);

  const goalNames = picked.map(id => (goals[id] || '').trim()).filter(Boolean);
  const goalLabel = picked.length ? ONBOARD_CATS.find(c => c.id === picked[0]).name : '';

  // Processing overlay (after URL submit) — reveal → advances to briefing step
  if (processing) {
    return (
      <window.ProcessingOverlay
        source={{ title: "Cal Newport — the case for slow productivity (Lex Fridman ep. 414)", source: 'youtube.com', type: 'video', duration: '1:14:22' }}
        goalLabel={goalLabel}
        goalPills={goalNames}
        reveal
        finishLabel="Let's go"
        onFinish={() => { setProcessing(false); setStep(5); }}
      />
    );
  }

  return (
    <div className="onboard-screen dot-bg">
      <div className="onboard-shell">
        <div className="onboard-head">
          <span className="wordmark" style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.2px' }}>Clarity.</span>
          <div className="onboard-steps mono">
            {Array.from({ length: TOTAL }).map((_, n) => (
              <span key={n} className={`step-pip ${step >= n ? 'on' : ''}`}></span>
            ))}
            <span style={{ marginLeft: 8 }}>{step + 1} / {TOTAL}</span>
          </div>
        </div>

        {step === 0 && (
          <div className="onboard-step">
            <h1 className="onboard-h">Which of these sounds like you?</h1>
            <p className="onboard-sub mono">Pick 1 or 2. We'll keep it in mind.</p>

            <div className="onboard-cats problems">
              {ONBOARD_PROBLEMS.map((p, i) => (
                <button
                  key={p.id}
                  className={`onboard-cat ${problems.includes(p.id) ? 'on' : ''}`}
                  onClick={() => toggleProblem(p.id)}
                >
                  <span className="cat-num mono">{String(i + 1).padStart(2, '0')}</span>
                  <span className="cat-name">{p.text}</span>
                  <span className="cat-check">
                    {problems.includes(p.id) ? <Ico.check width={12} height={12} /> : null}
                  </span>
                </button>
              ))}
            </div>

            <div className="onboard-foot">
              <span className="mono onboard-counter">{problems.length} / 2 selected</span>
              <span style={{ flex: 1 }}></span>
              <button className="btn btn-accent" disabled={!canNext0} onClick={() => setStep(1)}>
                Continue <Ico.arrow width={12} height={12} />
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="onboard-step">
            <h1 className="onboard-h">What are you working toward?</h1>
            <p className="onboard-sub mono">Pick 2 or 3. You can change these later.</p>

            <div className="onboard-cats">
              {ONBOARD_CATS.map(c => (
                <button
                  key={c.id}
                  className={`onboard-cat ${picked.includes(c.id) ? 'on' : ''}`}
                  onClick={() => togglePick(c.id)}
                >
                  <span className="cat-num mono">{String(ONBOARD_CATS.indexOf(c) + 1).padStart(2, '0')}</span>
                  <span className="cat-name">{c.name}</span>
                  <span className="cat-check">
                    {picked.includes(c.id) ? <Ico.check width={12} height={12} /> : null}
                  </span>
                </button>
              ))}
            </div>

            <div className="onboard-foot">
              <button className="btn btn-ghost" onClick={() => setStep(0)}>
                <Ico.arrowLeft width={11} height={11} /> Back
              </button>
              <span className="mono onboard-counter">{picked.length} / 3 selected</span>
              <span style={{ flex: 1 }}></span>
              <button
                className="btn btn-accent"
                disabled={!canNext1}
                onClick={() => setStep(2)}
              >
                Continue <Ico.arrow width={12} height={12} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="onboard-step">
            <h1 className="onboard-h">Get specific.</h1>
            <p className="onboard-sub mono">One goal per category. Make it measurable.</p>

            <div className="onboard-goals">
              {picked.map(id => {
                const c = ONBOARD_CATS.find(x => x.id === id);
                return (
                  <div className="goal-row" key={id}>
                    <span className="goal-tag mono">{c.name.toLowerCase()}</span>
                    <input
                      autoFocus={picked[0] === id}
                      placeholder={c.ex}
                      value={goals[id] || ''}
                      onChange={e => setGoals(g => ({ ...g, [id]: e.target.value }))}
                    />
                  </div>
                );
              })}
            </div>

            <div className="onboard-foot">
              <button className="btn btn-ghost" onClick={() => setStep(1)}>
                <Ico.arrowLeft width={11} height={11} /> Back
              </button>
              <span style={{ flex: 1 }}></span>
              <button
                className="btn btn-accent"
                disabled={!canNext2}
                onClick={() => setStep(3)}
              >
                Continue <Ico.arrow width={12} height={12} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="onboard-step">
            <h1 className="onboard-h">You're set. Save your first link.</h1>
            <p className="onboard-sub mono">
              Paste a YouTube link and we'll turn it into your next action.
            </p>

            <div className="url-input onboard-url">
              <Ico.link width={14} height={14} style={{ color: 'var(--fg-3)' }} />
              <input
                placeholder="paste a youtube url…"
                value={urlVal}
                autoFocus
                onChange={e => setUrlVal(e.target.value)}
              />
              <button onClick={() => setProcessing(true)}>Process →</button>
            </div>

            <div className="onboard-skip-row">
              <button className="link-btn" onClick={() => setProcessing(true)}>
                or use a sample link <Ico.arrow width={11} height={11} />
              </button>
            </div>

            <div className="onboard-preview mono">
              <div className="op-row">
                <span className="op-dot"></span>
                We'll summarise it in &lt;30 seconds
              </div>
              <div className="op-row">
                <span className="op-dot"></span>
                Pull out 3 actions you can take in the next 48h
              </div>
              <div className="op-row">
                <span className="op-dot"></span>
                Add them to your <strong>{picked.map(id => ONBOARD_CATS.find(c => c.id === id).name).join(' / ')}</strong> goals
              </div>
            </div>

            <div className="onboard-foot">
              <button className="btn btn-ghost" onClick={() => setStep(2)}>
                <Ico.arrowLeft width={11} height={11} /> Back
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="onboard-step">
            <h1 className="onboard-h">When should we send your daily briefing?</h1>
            <p className="onboard-sub mono">One nudge a day with your next action. Change it anytime.</p>

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
              <button className="btn btn-accent" disabled={!briefing} onClick={onDone}>
                Enter Clarity <Ico.arrow width={12} height={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   SHARED — SortDropdown, ContentCard, art primitives
   ============================================================ */

function SortDropdown({ value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const opts = ['Newest', 'Oldest', 'A → Z', 'Most actions'];
  return (
    <div style={{ position: 'relative' }}>
      <button className="sort" onClick={() => setOpen(o => !o)}>
        <span>sort by:</span>
        <span className="val">{value.toLowerCase()}</span>
        <Ico.chevDown width={12} height={12} />
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpen(false)}></div>
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', right: 0,
            background: 'var(--panel)', border: '1px solid var(--hairline-2)',
            borderRadius: 10, padding: 4, minWidth: 160, zIndex: 11,
          }}>
            {opts.map(o => (
              <button key={o}
                onClick={() => { onChange(o); setOpen(false); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '7px 10px', background: 'transparent',
                  border: 0, color: o === value ? 'var(--accent-bright)' : 'var(--fg-2)',
                  fontSize: 12.5, borderRadius: 6, cursor: 'pointer',
                  fontFamily: 'Geist Mono, monospace',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--panel-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >{o.toLowerCase()}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ContentCard({ item, idx, onClick }) {
  const cat = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[0];
  // dormant: added > 5 days ago AND no actions taken from it
  const hasActions = React.useMemo(
    () => (window.TASKS || []).some(t => t.sourceId === item.id),
    [item.id]
  );
  const daysAgo = Math.floor((item.addedAt || 0) / 86400);
  const isDormant = daysAgo > 5 && !hasActions;

  return (
    <article className="card" onClick={onClick}
      style={{ animationDelay: `${Math.min(idx, 8) * 40}ms` }}>
      <div className="row">
        <span className="tag">
          <ContentTypeMark type={item.type} />
          {item.typeLabel}
        </span>
        <span className="tag">
          <span className="dot" style={{ background: cat.color }}></span>
          {cat.name.toLowerCase()}
        </span>
        <span className="ts">{item.added}</span>
      </div>

      <div className={`thumb ${item.type === 'youtube' ? 'video' : ''}`}>
        <span className="type-badge">{item.type}</span>
        {item.type === 'youtube' && (
          <>
            <div className="play"><Ico.play width={14} height={14} /></div>
            {item.duration && <span className="duration mono">{item.duration}</span>}
          </>
        )}
        {item.type === 'article' && <ArticleArt />}
        {item.type === 'tweet' && <TweetArt />}
        {item.type === 'pdf' && <PdfArt />}
      </div>

      <h3 className="title">{item.title}</h3>
      <p className="summary">{item.summary}</p>

      <div className="foot">
        <span className="src mono">
          <Ico.external width={11} height={11} />
          {item.source}
        </span>
        <span className="arrow"><Ico.arrow width={12} height={12} /></span>
      </div>

      {isDormant && (
        <span className="dormant">no actions taken · {daysAgo}d ago</span>
      )}
    </article>
  );
}

function ContentTypeMark({ type }) {
  const map = {
    youtube: '#ff5a5f',
    article: 'var(--cat-tech)',
    tweet: 'var(--fg-2)',
    pdf: '#E5B86F',
  };
  return <span className="dot" style={{ background: map[type] || 'var(--fg-4)' }}></span>;
}

function ArticleArt() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 112" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <pattern id="hr" width="6" height="6" patternUnits="userSpaceOnUse">
          <line x1="0" y1="3" x2="6" y2="3" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="200" height="112" fill="url(#hr)" />
      <g opacity="0.7">
        <rect x="20" y="22" width="80" height="3" rx="1.5" fill="rgba(255,255,255,0.18)" />
        <rect x="20" y="32" width="160" height="2" rx="1" fill="rgba(255,255,255,0.10)" />
        <rect x="20" y="40" width="150" height="2" rx="1" fill="rgba(255,255,255,0.10)" />
        <rect x="20" y="48" width="130" height="2" rx="1" fill="rgba(255,255,255,0.10)" />
        <rect x="20" y="60" width="160" height="2" rx="1" fill="rgba(255,255,255,0.10)" />
        <rect x="20" y="68" width="120" height="2" rx="1" fill="rgba(255,255,255,0.10)" />
        <rect x="20" y="80" width="100" height="2" rx="1" fill="rgba(255,255,255,0.10)" />
      </g>
    </svg>
  );
}

function TweetArt() {
  return (
    <div style={{
      position: 'absolute', inset: 0, padding: '14px 18px',
      display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center',
      fontFamily: 'Geist Mono, monospace', fontSize: 10, color: 'var(--fg-3)',
      lineHeight: 1.45,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--panel-3)' }}></span>
        <span style={{ color: 'var(--fg)' }}>@user</span>
        <span style={{ color: 'var(--fg-5)' }}>·</span>
        <span>2d</span>
      </div>
      <div style={{ color: 'var(--fg-2)' }}>"A short observation that the unstructured pile is often where the next idea lives…"</div>
      <div style={{ color: 'var(--fg-4)' }}>↻ 1.2k · ♡ 8.4k</div>
    </div>
  );
}

function PdfArt() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'grid', placeItems: 'center',
      background: 'linear-gradient(135deg, rgba(229,184,111,0.07), transparent)',
    }}>
      <div style={{
        width: '64%', aspectRatio: '8/11',
        background: 'var(--panel)', border: '1px solid var(--hairline-2)',
        borderRadius: 4, padding: '8px 10px',
        display: 'flex', flexDirection: 'column', gap: 3,
      }}>
        <div style={{ height: 4, background: 'var(--hairline-2)', borderRadius: 1, width: '70%' }}></div>
        <div style={{ height: 2, background: 'var(--hairline)', borderRadius: 1, width: '100%' }}></div>
        <div style={{ height: 2, background: 'var(--hairline)', borderRadius: 1, width: '95%' }}></div>
        <div style={{ height: 2, background: 'var(--hairline)', borderRadius: 1, width: '90%' }}></div>
        <div style={{ height: 2, background: 'var(--hairline)', borderRadius: 1, width: '60%' }}></div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      gridColumn: '1 / -1',
      padding: '60px 20px',
      textAlign: 'center',
      color: 'var(--fg-4)',
      fontFamily: 'Geist Mono, monospace',
      fontSize: 12,
      letterSpacing: '0.04em',
    }}>
      nothing matches — try clearing filters
    </div>
  );
}

Object.assign(window, { Home, Library, Onboarding, ContentCard });
