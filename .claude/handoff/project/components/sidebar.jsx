/* Sidebar — nav, goals, profile */

function Sidebar({ route, setRoute, openSettings, goToGoal, activeGoal }) {
  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <span className="wordmark" style={{ fontSize: "30px", textAlign: "left", fontWeight: "900", letterSpacing: "-0.2px", fontFamily: "Geist" }}>Clarity.<span className="accent" style={{ fontFamily: "Geist" }}></span></span>
      </div>

      <div className="sb-scroll">
        <nav className="sb-section" style={{ marginTop: 0 }}>
          {[
          { id: 'home', label: 'Focus', ico: Ico.goal, meta: '⌘1' },
          { id: 'ask', label: 'Ask', ico: Ico.ask, meta: '⌘K' },
          { id: 'library', label: 'Library', ico: Ico.library, meta: '⌘2' }].
          map((item) =>
          <button key={item.id}
          className={`sb-item ${route === item.id ? 'active' : ''}`}
          onClick={() => setRoute(item.id)}>
            
              <item.ico className="ico" />
              <span>{item.label}</span>
              {item.meta ? <span className="meta" style={{ fontFamily: "sans-serif" }}>{item.meta}</span> : null}
            </button>
          )}
        </nav>

        <div className="sb-section">
          <div className="sb-section-label">
            <span className="lbl">Goals</span>
            <button className="add" title="Add goal"><Ico.add width={12} height={12} /></button>
          </div>
          {GOALS.map((g) =>
          <button key={g.id}
          className={`sb-item ${route === 'library' && activeGoal === g.category ? 'active' : ''}`}
          onClick={() => goToGoal ? goToGoal(g.category) : setRoute('library')}>
              <span className="dot" style={{ background: g.color }}></span>
              <span>{g.name}</span>
              <span className="meta">{g.items}</span>
            </button>
          )}
        </div>

      </div>

      <div className="sb-foot">
        <div className="sb-avatar">J</div>
        <div style={{ minWidth: 0 }}>
          <div className="name">Jordan</div>
          <div className="email">j@clarity.app</div>
        </div>
        <button className="icon-btn" title="Settings" onClick={openSettings}>
          <Ico.settings width={14} height={14} />
        </button>
      </div>
    </aside>);

}

function BrandMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" opacity="0.4" />
      <path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4" stroke="var(--accent-bright)" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.5" fill="var(--accent-bright)" />
    </svg>);

}

window.Sidebar = Sidebar;