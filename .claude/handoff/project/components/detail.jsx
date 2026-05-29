/* Detail view — article-style page with embed at top, mono body */

function Detail({ contentId, back, goToGoal }) {
  const libItem = (LIBRARY.find(x => x.id === contentId)) || LIBRARY[0];
  const isVideo = libItem.type === 'youtube';
  // Use the rich mock detail; merge real library metadata in for breadcrumb/title.
  const item = { ...DETAIL_C1, ...libItem };
  const [steps, setSteps] = React.useState(
    DETAIL_C1.steps.map(s => ({ ...s, added: false, done: false }))
  );
  const [newStep, setNewStep] = React.useState('');

  const toggleAdded = id => setSteps(s => s.map(x => x.id === id ? { ...x, added: !x.added } : x));
  const toggleDone  = id => setSteps(s => s.map(x => x.id === id ? { ...x, done: !x.done } : x));
  const addStep = () => {
    const t = newStep.trim();
    if (!t) return;
    setSteps(s => [
      ...s,
      { id: 'u' + Date.now(), difficulty: 'easy', deadline: 'no date',
        title: t, desc: 'Custom step you added.', added: true, done: false, custom: true },
    ]);
    setNewStep('');
  };

  const cat = CATEGORIES.find(c => c.id === libItem.category) || CATEGORIES[5];
  const goalName = cat.name; // category doubles as folder
  // Estimated read/watch time + date — derive from data; fallback to mock.
  const meta = isVideo
    ? `Watch time: ${libItem.duration || '— —'}`
    : `Read time: ${estimateRead(item.fullSummary)} min`;
  const date = formatAdded(libItem.added);

  return (
    <div className="main-inner">
      <button className="detail-back" onClick={back}>
        <Ico.arrowLeft width={12} height={12} /> back to library
      </button>

      <article className="article">
        {/* breadcrumb */}
        <nav className="crumbs">
          <button onClick={back}>Home</button>
          <span className="sep">▸</span>
          <button onClick={() => goToGoal && goToGoal(libItem.category)}>{goalName}</button>
          <span className="sep">▸</span>
          <span className="current">{truncate(libItem.title, 40)}</span>
        </nav>

        {/* hero embed — video player or article banner */}
        <div className="article-hero">
          {isVideo
            ? <YTMockPlayer />
            : <ArticleBanner title={libItem.title} category={cat} />}
        </div>

        {/* title */}
        <h1 className="article-title">{libItem.title}</h1>

        {/* meta row: date / read time */}
        <div className="article-meta">
          <span>{date}</span>
          <span className="dash">/</span>
          <span>{meta}</span>
        </div>

        {/* tags */}
        <div className="article-tags">
          <span className="tag">
            <span className="dot" style={{ background: cat.color }}></span>
            {cat.name.toLowerCase()}
          </span>
          <span className="tag">
            <span className="dot" style={{ background: 'var(--accent-bright)' }}></span>
            linked goal · {libItem.goal || cat.name}
          </span>
          <span className="tag mono">{libItem.typeLabel}</span>
          {libItem.bestPick && (
            <span className="tag" style={{
              background: 'rgba(var(--accent-bright-rgb), 0.10)', borderColor: 'rgba(var(--accent-bright-rgb), 0.30)',
              color: 'var(--accent-bright)',
            }}>★ best pick</span>
          )}
        </div>

        <hr className="rule" />

        {/* body — mono, bold-highlighted */}
        <div className="article-body">
          {item.fullSummary.map((p, i) => (
            <p key={i}>{renderMonoProse(p)}</p>
          ))}
        </div>

        {/* key takeaways */}
        <section className="article-section">
          <h2>Key takeaways</h2>
          <div className="takeaways">
            {item.takeaways.map((t, i) => (
              <div className="takeaway" key={i}>
                <span className="num">0{i + 1}</span>
                <p>{renderMonoProse(t)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* analogy */}
        <section className="article-section">
          <h2>Analogy</h2>
          <div className="analogy">
            <em>"A model in a cookbook."</em><br />
            {item.analogy}
          </div>
        </section>

        <div className="eot">
          <span className="line"></span>
          <span className="text mono">end of summary</span>
          <span className="line"></span>
        </div>

        {/* actionable steps */}
        <section className="article-section">
          <div className="section-h" style={{ marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>Actionable steps</h2>
            <span className="line"></span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)' }}>
              {steps.filter(s => s.added).length} added · easy → hard
            </span>
          </div>

          <div className="steps">
            {steps.map(s => (
              <div key={s.id} className={`step ${s.done ? 'done' : ''}`}>
                <button className={`step-check ${s.done ? 'checked' : ''}`} onClick={() => toggleDone(s.id)}>
                  <svg viewBox="0 0 14 14" width={11} height={11}>
                    <path d="m3 7 3 3 5-7" fill="none" stroke="#0a0b0d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className="step-body">
                  <div className="step-meta">
                    <span className={`difficulty diff-${s.difficulty}`}>· {s.difficulty}</span>
                    <span className="deadline">· deadline {s.deadline}</span>
                    {s.custom && <span className="mono" style={{ fontSize: 10, color: 'var(--accent-bright)' }}>· yours</span>}
                  </div>
                  <h4 className="step-title">{s.title}</h4>
                  <p className="step-desc">{s.desc}</p>
                </div>
                <button
                  className={`step-add ${s.added ? 'added' : ''}`}
                  onClick={() => toggleAdded(s.id)}
                >
                  {s.added ? '✓ in tasks' : '+ to tasks'}
                </button>
              </div>
            ))}

            {/* add your own */}
            <div className="step step-add-row">
              <span className="step-check" style={{
                background: 'transparent', borderStyle: 'dashed',
                color: 'var(--fg-4)', display: 'grid', placeItems: 'center',
              }}>
                <svg viewBox="0 0 12 12" width={9} height={9}>
                  <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              <input
                className="step-input"
                placeholder="Add your own step — e.g. 'read this chapter twice'"
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addStep(); }}
              />
              <button
                className="step-add"
                onClick={addStep}
                style={{ opacity: newStep.trim() ? 1 : 0.4 }}
              >+ add step</button>
            </div>
          </div>
        </section>

        {/* share progress card */}
        <ShareProgressCard item={libItem} />

        {/* footer source line */}
        <div className="article-source">
          <Ico.link width={12} height={12} style={{ color: 'var(--fg-3)' }} />
          <span>Source</span>
          <span className="dash">/</span>
          <a href="#" className="src-url">{libItem.source}</a>
          <span style={{ flex: 1 }}></span>
          <button className="btn btn-ghost" style={{ fontSize: 12 }}>
            Open original <Ico.external width={11} height={11} />
          </button>
        </div>
      </article>
    </div>
  );
}

/* ---------- helpers ---------- */

function ShareProgressCard({ item }) {
  const [copied, setCopied] = React.useState(false);
  function copy() {
    const text = `Clarity · ${item.title}\nNext action in my window — 47:23:15 left · 3-day streak`;
    try {
      navigator.clipboard && navigator.clipboard.writeText(text);
    } catch (e) { /* ignore in sandbox */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return (
    <section className="share-card">
      <div>
        <div className="sc-eyebrow">/ share</div>
        <h3 className="sc-h" style={{ marginTop: 6 }}>Share your progress</h3>
      </div>

      <div className="sc-preview">
        <div className="sc-row">
          <span className="sc-label">
            <span className="pulse"></span>Focus action
          </span>
          <span className="sc-time">47:23:15</span>
        </div>
        <p className="sc-action">Finish the '5 types of wealth' check-in.</p>
        <div className="sc-chain">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const done = i < 3;
            return (
              <React.Fragment key={i}>
                {i > 0 && <span className={`sc-link ${done ? '' : 'todo'}`}></span>}
                <span className={`sc-dot ${done ? '' : 'todo'}`}></span>
              </React.Fragment>
            );
          })}
          <span className="sc-chain-lbl">this week</span>
        </div>
      </div>

      <div className="sc-foot">
        <button className={`btn btn-ghost ${copied ? 'copied' : ''}`} onClick={copy}>
          {copied ? <><Ico.check width={12} height={12} /> Copied</> : <><Ico.external width={12} height={12} /> Copy to clipboard</>}
        </button>
        <span className="sc-hint">screenshot-ready · coming soon</span>
      </div>
    </section>
  );
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function estimateRead(paras) {
  const words = paras.reduce((n, p) => n + p.split(/\s+/).length, 0);
  return Math.max(1, Math.round(words / 220));
}

function formatAdded(s) {
  // mock — turn "3h ago" / "yesterday" / "2d ago" into a date-ish label
  const now = new Date(2026, 4, 20); // May 20, 2026 (project date)
  const map = { 'yesterday': 1 };
  let daysBack = 0;
  if (typeof s === 'string') {
    if (s in map) daysBack = map[s];
    const m = s.match(/(\d+)\s*([hdw])/i);
    if (m) {
      const n = parseInt(m[1], 10);
      if (m[2].toLowerCase() === 'h') daysBack = 0;
      if (m[2].toLowerCase() === 'd') daysBack = n;
      if (m[2].toLowerCase() === 'w') daysBack = n * 7;
    }
  }
  const d = new Date(now);
  d.setDate(d.getDate() - daysBack);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// Bold any **word** wrapped in double-asterisks, render rest as text.
function renderMonoProse(p) {
  const parts = p.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function ArticleBanner({ title, category }) {
  // pixel-art-ish banner so non-video items get a hero too
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `
        linear-gradient(135deg, ${category.color || '#4A9B8E'}33 0%, transparent 70%),
        repeating-linear-gradient(0deg, var(--panel-2) 0 2px, var(--panel-3) 2px 4px)
      `,
      display: 'grid', placeItems: 'center',
      overflow: 'hidden',
    }}>
      <svg width="100%" height="100%" viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
        {Array.from({ length: 70 }).map((_, i) => {
          const x = (i * 23) % 400;
          const y = (i * 17) % 180;
          const w = 4 + (i % 5) * 2;
          return <rect key={i} x={x} y={y} width={w} height={w}
            fill={`rgba(255,255,255,${0.02 + (i % 7) * 0.012})`} />;
        })}
      </svg>
      <div style={{
        position: 'relative', zIndex: 2,
        padding: '8px 14px', borderRadius: 6,
        background: 'rgba(0,0,0,0.45)', border: '1px solid var(--hairline-2)',
        backdropFilter: 'blur(8px)',
        fontFamily: 'Geist Mono, monospace', fontSize: 11,
        color: 'var(--fg-2)', letterSpacing: '0.06em', textTransform: 'lowercase',
      }}>
        {category.name} · {title.length > 36 ? title.slice(0, 36) + '…' : title}
      </div>
    </div>
  );
}

function YTMockPlayer() {
  const [playing, setPlaying] = React.useState(false);
  const [pos, setPos] = React.useState(0.34);
  React.useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setPos(p => (p + 0.003) % 1), 100);
    return () => clearInterval(t);
  }, [playing]);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, #1a1c20 0%, #0e1014 100%)',
      display: 'grid', placeItems: 'center', cursor: 'pointer',
    }}
      onClick={() => setPlaying(p => !p)}
    >
      <div style={{ position: 'absolute', inset: 0, opacity: 0.35 }}>
        <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 200 112">
          {Array.from({ length: 40 }).map((_, i) => {
            const h = 6 + ((i * 37) % 50);
            return <rect key={i} x={i * 5} y={56 - h / 2} width="2" height={h} fill="rgba(var(--accent-bright-rgb), 0.20)" />;
          })}
        </svg>
      </div>

      <div style={{
        width: 62, height: 62, borderRadius: '50%',
        background: playing ? 'rgba(255,90,95,0.18)' : 'rgba(255,255,255,0.10)',
        border: `1px solid ${playing ? 'rgba(255,90,95,0.35)' : 'rgba(255,255,255,0.20)'}`,
        display: 'grid', placeItems: 'center',
        color: playing ? 'var(--danger)' : 'var(--fg)',
        backdropFilter: 'blur(6px)',
        transition: 'all 200ms var(--ease)',
      }}>
        {playing
          ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
          : <Ico.play width={20} height={20} />}
      </div>

      <div style={{
        position: 'absolute', left: 14, right: 14, bottom: 14,
        height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.12)',
      }}>
        <div style={{
          width: `${pos * 100}%`, height: '100%', borderRadius: 2,
          background: 'var(--accent-bright)',
        }}></div>
      </div>
      <div style={{
        position: 'absolute', left: 14, bottom: 24,
        fontFamily: 'Geist Mono, monospace', fontSize: 10.5,
        color: 'var(--fg-3)',
      }}>{Math.floor(pos * 23)}:{String(Math.floor(pos * 1394) % 60).padStart(2, '0')} / 23:14</div>
    </div>
  );
}

window.Detail = Detail;
