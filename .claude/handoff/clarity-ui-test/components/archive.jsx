/* Archive — completed actions grouped into goal "folders" (dark, Clarity-styled) */

function Archive() {
  const [filter, setFilter] = React.useState('all');
  const [openId, setOpenId] = React.useState(null);

  // Only goals that actually have completed actions become folders.
  const folders = React.useMemo(
    () => GOALS
      .map(g => ({ goal: g, items: buildGoalArchive(g.id) }))
      .filter(f => f.items.length > 0),
    []
  );
  const shown = filter === 'all' ? folders : folders.filter(f => f.goal.id === filter);
  const openFolder = openId ? folders.find(f => f.goal.id === openId) : null;

  return (
    <div className="main-inner arch-page" data-screen-label="archive">
      <header className="arch-header">
        <h1 className="arch-title">Archive</h1>
        <p className="arch-sub mono">Everything you've actually done.</p>
      </header>

      {/* goal filter chips */}
      <div className="arch-filters">
        <button className={`pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All
        </button>
        {folders.map(({ goal }) => (
          <button
            key={goal.id}
            className={`pill ${filter === goal.id ? 'active' : ''}`}
            onClick={() => setFilter(goal.id)}
          >
            <span className="dot" style={{ background: goal.color }}></span>
            {goal.name}
          </button>
        ))}
      </div>

      {/* folder grid */}
      <div className="arch-grid">
        {shown.map(({ goal, items }) => (
          <ArchiveFolder key={goal.id} goal={goal} items={items} onOpen={() => setOpenId(goal.id)} />
        ))}
      </div>

      {openFolder && (
        <ArchiveDrawer folder={openFolder} onClose={() => setOpenId(null)} />
      )}
    </div>
  );
}

function ArchiveFolder({ goal, items, onOpen }) {
  const peek = items.slice(0, 2);
  return (
    <button className="arch-folder" style={{ '--cat': goal.color }} onClick={onOpen}>
      {/* folder tab — a small coloured rounded rectangle above the card's top edge */}
      <span className="arch-tab"></span>

      <div className="arch-front">
        <div className="arch-front-head">
          <span className="arch-dot" style={{ background: goal.color }}></span>
          <span className="arch-folder-title">{goal.name}</span>
        </div>

        {/* a quiet peek of contents */}
        <ul className="arch-peeklines">
          {peek.map((it) => (
            <li key={it.id}>
              <span className="arch-peek-check" style={{ borderColor: goal.color }}></span>
              <span className="arch-peek-text">{it.action}</span>
            </li>
          ))}
        </ul>

        <div className="arch-folder-foot">
          <span className="arch-count mono">{items.length} completed</span>
          <span className="arch-open mono">open →</span>
        </div>
      </div>
    </button>
  );
}

function ArchiveDrawer({ folder, onClose }) {
  const { goal, items } = folder;
  React.useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="arch-scrim" onClick={onClose}>
      <div className="arch-drawer" style={{ '--cat': goal.color }} onClick={(e) => e.stopPropagation()}>
        <div className="arch-drawer-head">
          <div className="arch-drawer-titlerow">
            <span className="arch-dot" style={{ background: goal.color }}></span>
            <h2 className="arch-drawer-title">{goal.name}</h2>
          </div>
          <span className="arch-drawer-count mono">{items.length} completed</span>
          <button className="arch-drawer-close" onClick={onClose} aria-label="Close">
            <Ico.x width={15} height={15} />
          </button>
        </div>

        <div className="arch-drawer-scroll">
          <ul className="arch-list">
            {items.map((it) => (
              <li className="arch-item" key={it.id}>
                <span className="arch-item-check" style={{ color: goal.color }}>
                  <svg viewBox="0 0 14 14" width="12" height="12">
                    <path d="m3 7 3 3 5-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div className="arch-item-body">
                  <p className="arch-item-action">{it.action}</p>
                  <div className="arch-item-foot mono">
                    <span className="arch-item-src">from {it.source}</span>
                    <span className="arch-item-date">{archiveDateLabel(it.ts)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

window.Archive = Archive;
