/* App root — routing, tweaks, modals */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "teal",
  "dotIntensity": 0.9,
  "theme": "dark",
  "density": "comfortable",
  "fontset": "modern"
}/*EDITMODE-END*/;

const ACCENT_PRESETS = {
  teal:    { accent: '#4A9B8E', bright: '#6FE8CC', accentRgb: '74, 155, 142',   brightRgb: '111, 232, 204' },
  sage:    { accent: '#7BAE7E', bright: '#A8E0AC', accentRgb: '123, 174, 126',  brightRgb: '168, 224, 172' },
  amber:   { accent: '#C99B5C', bright: '#E5B86F', accentRgb: '201, 155, 92',   brightRgb: '229, 184, 111' },
  indigo:  { accent: '#5879B9', bright: '#9CB7E8', accentRgb: '88, 121, 185',   brightRgb: '156, 183, 232' },
  rose:    { accent: '#C9788C', bright: '#F2A8BD', accentRgb: '201, 120, 140',  brightRgb: '242, 168, 189' },
  mauve:   { accent: '#A68FBE', bright: '#D4B8E8', accentRgb: '166, 143, 190',  brightRgb: '212, 184, 232' },
};

function App() {
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  const [route, setRoute] = React.useState('home');
  const [detailId, setDetailId] = React.useState(null);
  const [showAdd, setShowAdd] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [processingSrc, setProcessingSrc] = React.useState(null); // {title,source,type,...} | null
  const [motto] = React.useState(() => MOTTOS[Math.floor(Math.random() * MOTTOS.length)]);
  const [goalFilter, setGoalFilter] = React.useState('all'); // category id selected from sidebar / detail
  const [onboarded, setOnboarded] = React.useState(true); // toggle false via tweaks to re-run onboarding

  function goToGoal(catId) {
    setGoalFilter(catId || 'all');
    setRoute('library');
    setDetailId(null);
  }

  // apply tweaks via CSS vars
  React.useEffect(() => {
    const p = ACCENT_PRESETS[tweaks.accent] || ACCENT_PRESETS.teal;
    const root = document.documentElement;
    root.style.setProperty('--accent', p.accent);
    root.style.setProperty('--accent-bright', p.bright);
    root.style.setProperty('--accent-rgb', p.accentRgb);
    root.style.setProperty('--accent-bright-rgb', p.brightRgb);
    root.style.setProperty('--dot-intensity', tweaks.dotIntensity);
    root.setAttribute('data-theme', tweaks.theme);
    root.setAttribute('data-fontset', tweaks.fontset || 'modern');
    if (tweaks.density === 'compact') {
      root.style.setProperty('--sidebar-w', '220px');
    } else {
      root.style.setProperty('--sidebar-w', '240px');
    }
  }, [tweaks]);

  function openDetail(id) {
    setDetailId(id);
    setRoute('detail');
  }
  function back() {
    setDetailId(null);
    setRoute('home');
  }

  // keyboard: ⌘K opens add modal (close to "search for content"), Esc closes
  React.useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('.search-bar input')?.focus();
      }
      if (e.key === 'Escape') {
        if (showAdd) setShowAdd(false);
        else if (showSettings) setShowSettings(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showAdd, showSettings]);

  if (!onboarded) {
    return (
      <>
        <Onboarding onDone={() => setOnboarded(true)} />
        <TweakPanel tweaks={tweaks} setTweak={setTweak} onboarded={onboarded} setOnboarded={setOnboarded} />
      </>
    );
  }

  return (
    <div className="app">
      <Sidebar
        route={route === 'detail' ? 'home' : route}
        setRoute={setRoute}
        goToGoal={goToGoal}
        activeGoal={goalFilter}
        openSettings={() => setShowSettings(true)}
      />
      <main className="main" data-screen-label={`02 ${route}`}>
        {route === 'home' && (
          <Home
            setRoute={setRoute}
            openDetail={openDetail}
            openAdd={() => setShowAdd(true)}
            motto={motto}
          />
        )}
        {route === 'library' && (
          <Library
            openDetail={openDetail}
            openAdd={() => setShowAdd(true)}
            initialFilter={goalFilter}
            onFilterChange={setGoalFilter}
          />
        )}
        {route === 'ask' && <AskStub />}
        {route === 'detail' && <Detail contentId={detailId} back={back} goToGoal={goToGoal} />}
      </main>

      {showAdd && (
        <AddModal
          onClose={() => setShowAdd(false)}
          onAdd={() => setRoute('home')}
          onProcess={(src) => {
            setShowAdd(false);
            setProcessingSrc(src || { title: 'Your saved content', source: 'youtube.com', type: 'video' });
          }}
        />
      )}

      {processingSrc && (
        <window.ProcessingOverlay
          source={processingSrc}
          onComplete={() => {
            setProcessingSrc(null);
            openDetail('c1');
          }}
        />
      )}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          theme={tweaks.theme}
          setTheme={(t) => setTweak('theme', t)}
          accent={tweaks.accent}
          setAccent={(a) => setTweak('accent', a)}
          fontset={tweaks.fontset || 'modern'}
          setFontset={(f) => setTweak('fontset', f)}
        />
      )}

      <TweakPanel tweaks={tweaks} setTweak={setTweak} onboarded={onboarded} setOnboarded={setOnboarded} />
    </div>
  );
}

function AskStub() {
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const scrollRef = React.useRef(null);

  const suggestions = [
    'summarise what I saved this week',
    'what should I do first from my finance saves?',
    'find me 3 things to read on building habits',
  ];

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  async function send(text) {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setInput('');
    const next = [...messages, { role: 'user', text: q }];
    setMessages(next);
    setBusy(true);
    try {
      const sys = "You are Clarity — an assistant that helps the user synthesise their saved library of articles, videos, threads and PDFs. Their library is focused on self-improvement: an Ali Abdaal video on finishing what you start, Sahil Bloom's '5 types of wealth' essay, a Codie Sanchez thread on compounding income, Atomic Habits notes, a Mel Robbins video on the 5-second rule, a Jeff Nippard article on breaking strength plateaus, a Steph Smith video on writing online, and a Naval thread on choosing the long game. Answer concisely (3–5 sentences max) and reference specific saved items when relevant. Speak conversationally, no markdown headers.";
      const convo = next.map(m => ({ role: m.role, content: m.text }));
      const reply = await window.claude.complete({
        messages: [{ role: 'user', content: sys }, ...convo],
      });
      setMessages(m => [...m, { role: 'assistant', text: reply }]);
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', text: "Something broke on my end. Try again in a moment.", error: true }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ask-screen">
      <div className="ask-scroll" ref={scrollRef}>
        <div className="ask-thread">
          {messages.length === 0 && (
            <div className="ask-empty">
              <div className="eyebrow">/ ask</div>
              <p className="ask-empty-h">What do you want to know about your library?</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`msg msg-${m.role}`}>
              {m.role === 'assistant' && (
                <div className="msg-avatar"><span className="dot" style={{ background: 'var(--accent-bright)' }}></span></div>
              )}
              <div className={`msg-bubble ${m.error ? 'is-error' : ''}`}>{m.text}</div>
            </div>
          ))}

          {busy && (
            <div className="msg msg-assistant">
              <div className="msg-avatar"><span className="dot" style={{ background: 'var(--accent-bright)' }}></span></div>
              <div className="msg-bubble"><span className="typing"><span></span><span></span><span></span></span></div>
            </div>
          )}
        </div>
      </div>

      <div className="ask-composer">
        {messages.length === 0 && (
          <div className="ask-suggestions">
            {suggestions.map(s => (
              <button key={s} className="pill" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}

        <form
          className="ask-input-wrap"
          onSubmit={(e) => { e.preventDefault(); send(); }}
        >
          <input
            className="ask-input"
            placeholder="Ask anything about your saved library…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
            disabled={busy}
          />
          <button
            type="submit"
            className="ask-send"
            disabled={!input.trim() || busy}
            aria-label="Send"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
              <path d="M8 13V3M8 3l-4 4M8 3l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

function TweakPanel({ tweaks, setTweak, onboarded, setOnboarded }) {
  return (
    <window.TweaksPanel title="Tweaks">
      <window.TweakSection label="Background">
        <window.TweakSlider
          label="Dots"
          value={tweaks.dotIntensity}
          min={0} max={1} step={0.05}
          onChange={(v) => setTweak('dotIntensity', v)}
        />
      </window.TweakSection>

      <window.TweakSection label="Layout">
        <window.TweakRadio
          label="Density"
          value={tweaks.density}
          options={[{ value: 'comfortable', label: 'Roomy' }, { value: 'compact', label: 'Compact' }]}
          onChange={(v) => setTweak('density', v)}
        />
      </window.TweakSection>

      <window.TweakSection label="Flow">
        <window.TweakButton
          label="Re-run onboarding"
          onClick={() => setOnboarded(false)}
        />
      </window.TweakSection>
    </window.TweaksPanel>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
