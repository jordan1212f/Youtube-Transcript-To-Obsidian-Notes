/* Modals — Add content, Settings */

function AddModal({ onClose, onAdd, onProcess }) {
  const [method, setMethod] = React.useState('url');
  const [url, setUrl] = React.useState('');
  const [dragover, setDragover] = React.useState(false);
  const [preview, setPreview] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  function handlePaste(v) {
    setUrl(v);
    setPreview(null);
    if (/youtu/.test(v)) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setPreview({
          title: "Cal Newport — the case for slow productivity (Lex Fridman ep. 414)",
          source: "youtube.com",
          type: "video",
          duration: "1:14:22",
        });
      }, 700);
    } else if (v.length > 5) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setPreview({
          title: "URL detected — preview unavailable",
          source: new URL(v.startsWith('http') ? v : 'https://' + v).hostname,
          type: "article",
        });
      }, 700);
    }
  }

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal wide" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>Add content here!</h2>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-4)', marginTop: 2, letterSpacing: '0.04em' }}>
              we'll summarise & suggest actions
            </div>
          </div>
          <button className="close" onClick={onClose}><Ico.x width={14} height={14} /></button>
        </div>

        <div
          className={`dropzone ${dragover ? 'dragover' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragover(true); }}
          onDragLeave={() => setDragover(false)}
          onDrop={e => { e.preventDefault(); setDragover(false); }}
        >
          <div className="icon"><Ico.upload width={18} height={18} /></div>
          <div className="t">Drop files here</div>
          <div className="s">.pdf · .mp4 · .mp3 · .txt · .epub — or any URL</div>
        </div>

        <div className="method-tabs">
          {[
            { id: 'upload', label: 'Upload file(s)', ico: Ico.upload },
            { id: 'url', label: 'From URL', ico: Ico.url },
            { id: 'paste', label: 'Paste text', ico: Ico.paste },
          ].map(t => (
            <button key={t.id}
              className={`method-tab ${method === t.id ? 'active' : ''}`}
              onClick={() => setMethod(t.id)}
            >
              <t.ico width={16} height={16} />
              {t.label}
            </button>
          ))}
        </div>

        {method === 'url' && (
          <>
            <div className="url-input">
              <Ico.link width={14} height={14} style={{ color: 'var(--fg-3)' }} />
              <input
                placeholder="paste a youtube, twitter, or article url…"
                value={url}
                onChange={e => handlePaste(e.target.value)}
                autoFocus
              />
              <button disabled={!preview} onClick={() => { onProcess && onProcess(preview); }}>
                Process →
              </button>
            </div>

            {loading && (
              <div style={{
                marginTop: 14, padding: '14px 16px',
                border: '1px solid var(--hairline)', borderRadius: 10,
                fontFamily: 'Geist Mono, monospace', fontSize: 11,
                color: 'var(--fg-4)', letterSpacing: '0.04em',
                background: 'var(--bg-2)',
              }}>
                <span style={{ color: 'var(--accent-bright)' }}>●</span> fetching preview…
              </div>
            )}

            {preview && !loading && (
              <div className="url-preview">
                <div className="thumb-mini">
                  {preview.type === 'video'
                    ? <Ico.play width={18} height={18} style={{ color: 'var(--fg-2)' }} />
                    : <Ico.external width={18} height={18} style={{ color: 'var(--fg-2)' }} />}
                </div>
                <div className="body">
                  <div className="t">{preview.title}</div>
                  <div className="m">
                    <span style={{ color: 'var(--accent-bright)' }}>●</span> {preview.source} · {preview.type}{preview.duration ? ` · ${preview.duration}` : ''}
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    <span className="tag"><span className="dot" style={{ background: 'var(--cat-tech)' }}></span>productivity</span>
                    <span className="tag"><span className="dot" style={{ background: 'var(--cat-ai)' }}></span>mindset</span>
                    <span className="tag mono" style={{ color: 'var(--fg-4)' }}>auto-categorised</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {method === 'upload' && (
          <div style={{
            marginTop: 16, padding: '14px 16px',
            border: '1px solid var(--hairline)', borderRadius: 10,
            background: 'var(--bg-2)',
            fontSize: 12.5, color: 'var(--fg-3)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Ico.upload width={14} height={14} />
            Drop above or <span style={{ color: 'var(--accent-bright)', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>browse files</span>
          </div>
        )}

        {method === 'paste' && (
          <textarea
            placeholder="paste anything — an essay, a tweet thread, a transcript…"
            style={{
              width: '100%', marginTop: 16, minHeight: 120, resize: 'vertical',
              padding: '12px 14px', borderRadius: 10,
              background: 'var(--bg-2)', border: '1px solid var(--hairline)',
              outline: 0, color: 'var(--fg)', fontSize: 13.5, lineHeight: 1.55,
              fontFamily: 'Geist, sans-serif',
            }}
          />
        )}

        <div style={{
          marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--hairline)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span className="eyebrow">link to goal →</span>
          <span className="pill" style={{ padding: '4px 10px', fontSize: 11 }}>
            <span className="dot" style={{ background: 'var(--cat-tech)' }}></span>
            Productivity
          </span>
          <span className="pill" style={{ padding: '4px 10px', fontSize: 11 }}>
            <span className="dot" style={{ background: 'var(--cat-ai)' }}></span>
            Mindset
          </span>
          <span style={{ flex: 1 }}></span>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ----- Settings ----- */

function SettingsModal({ onClose, theme, setTheme, accent, setAccent, fontset, setFontset }) {
  const [goals, setGoals] = React.useState(GOALS);
  const [newGoal, setNewGoal] = React.useState('');

  function addGoal() {
    if (!newGoal.trim()) return;
    setGoals(g => [...g, { id: 'g' + Date.now(), name: newGoal, items: 0, color: 'var(--cat-other)' }]);
    setNewGoal('');
  }
  function delGoal(id) { setGoals(g => g.filter(x => x.id !== id)); }

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Settings</h2>
          <button className="close" onClick={onClose}><Ico.x width={14} height={14} /></button>
        </div>

        <div className="set-section">
          <h4>API keys</h4>
          {[
            { label: 'OpenAI', val: 'sk-•••••••••••••••••••••3f2a', status: 'live' },
            { label: 'Anthropic', val: 'sk-ant-•••••••••••••••dcf9', status: 'live' },
            { label: 'YouTube Data', val: 'AIza•••••••••••••••••2k7', status: 'live' },
          ].map(k => (
            <div className="api-row" key={k.label}>
              <span className="lbl">{k.label}</span>
              <input defaultValue={k.val} />
              <span className="status">● {k.status}</span>
            </div>
          ))}
        </div>

        <div className="set-section">
          <h4>Goals</h4>
          <div className="goals-list">
            {goals.map(g => (
              <div className="row" key={g.id}>
                <span className="dot" style={{ width: 8, height: 8, borderRadius: '50%', background: g.color }}></span>
                <span className="name">{g.name}</span>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)' }}>{g.items} items</span>
                <button className="del" onClick={() => delGoal(g.id)}>
                  <Ico.trash width={11} height={11} />
                </button>
              </div>
            ))}
          </div>
          <div className="add-goal">
            <input
              placeholder="add a new goal…"
              value={newGoal}
              onChange={e => setNewGoal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addGoal()}
            />
            <button className="btn btn-primary" onClick={addGoal}>
              <Ico.add width={12} height={12} /> Add
            </button>
          </div>
        </div>

        <div className="set-section">
          <h4>Theme</h4>
          <div className="theme-toggle">
            <button className={theme === 'dark' ? 'on' : ''} onClick={() => setTheme('dark')}>Dark</button>
            <button className={theme === 'light' ? 'on' : ''} onClick={() => setTheme('light')}>Light</button>
          </div>

          <div className="set-sub">
            <span className="set-sub-lbl">Accent</span>
            <div className="swatch-row">
              {[
                { id: 'teal',   color: '#6FE8CC' },
                { id: 'sage',   color: '#A8E0AC' },
                { id: 'amber',  color: '#E5B86F' },
                { id: 'indigo', color: '#9CB7E8' },
                { id: 'rose',   color: '#F2A8BD' },
                { id: 'mauve',  color: '#D4B8E8' },
              ].map(s => (
                <button
                  key={s.id}
                  className={`swatch ${accent === s.id ? 'on' : ''}`}
                  style={{ background: s.color }}
                  aria-label={s.id}
                  title={s.id}
                  onClick={() => setAccent && setAccent(s.id)}
                />
              ))}
            </div>
          </div>

          <div className="set-sub">
            <span className="set-sub-lbl">Fonts</span>
            <div className="font-row">
              {[
                { id: 'modern',    name: 'Modern',    sub: 'Geist',             specimen: 'Aa' },
                { id: 'editorial', name: 'Editorial', sub: 'Instrument Serif',  specimen: 'Aa' },
                { id: 'soft',      name: 'Soft',      sub: 'DM Serif + DM Sans', specimen: 'Aa' },
              ].map(f => (
                <button
                  key={f.id}
                  className={`font-card ${fontset === f.id ? 'on' : ''}`}
                  onClick={() => setFontset && setFontset(f.id)}
                >
                  <span className={`font-specimen font-specimen-${f.id}`}>{f.specimen}</span>
                  <span className="font-name">{f.name}</span>
                  <span className="font-sub">{f.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--hairline)',
          display: 'flex', alignItems: 'center',
        }}>
          <span className="eyebrow">clarity · v0.4.1 · sync · cloud · pro</span>
          <span style={{ flex: 1 }}></span>
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AddModal, SettingsModal });
