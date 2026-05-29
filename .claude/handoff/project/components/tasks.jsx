/* Tasks screen */

function Tasks({ openDetail }) {
  const [tasks, setTasks] = React.useState(TASKS);
  const [expanded, setExpanded] = React.useState(null);
  const [filter, setFilter] = React.useState('open');

  const deadlineHours = (d) => {
    if (!d) return Infinity;
    const m = String(d).trim().match(/^(\d+(?:\.\d+)?)\s*([hdwm])$/i);
    if (!m) return Infinity;
    const n = parseFloat(m[1]);
    const unit = m[2].toLowerCase();
    if (unit === 'h') return n;
    if (unit === 'd') return n * 24;
    if (unit === 'w') return n * 24 * 7;
    if (unit === 'm') return n * 24 * 30;
    return Infinity;
  };

  const sortTasks = (list) => [...list].sort((a, b) => {
    // Done tasks always last
    if (!!a.done !== !!b.done) return a.done ? 1 : -1;
    // Urgent (not done) first
    const au = a.urgent && !a.done ? 1 : 0;
    const bu = b.urgent && !b.done ? 1 : 0;
    if (au !== bu) return bu - au;
    // Then by least time left (smallest deadline first)
    return deadlineHours(a.deadline) - deadlineHours(b.deadline);
  });

  const visible = React.useMemo(() => {
    let list;
    if (filter === 'all') list = tasks;
    else if (filter === 'done') list = tasks.filter(t => t.done);
    else if (filter === 'urgent') list = tasks.filter(t => t.urgent && !t.done);
    else list = tasks.filter(t => !t.done);
    return sortTasks(list);
  }, [tasks, filter]);

  const toggleDone = id => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done, progress: t.done ? t.progress : 1 } : t));

  const openCount = tasks.filter(t => !t.done).length;
  const doneCount = tasks.filter(t => t.done).length;
  const urgentCount = tasks.filter(t => t.urgent && !t.done).length;

  return (
    <div className="main-inner">
      <div className="eyebrow" style={{ marginBottom: 22 }}>/ actionable tasks</div>

      <div className="tasks-head">
        <div className="stat">
          <div className="num">{openCount}</div>
          <div className="lbl">open</div>
        </div>
        <div className="stat">
          <div className="num" style={{ color: 'var(--danger)' }}>{urgentCount}</div>
          <div className="lbl">urgent</div>
        </div>
        <div className="stat">
          <div className="num">{doneCount}</div>
          <div className="lbl">done · this week</div>
        </div>
        <div className="stat">
          <div className="num"><span style={{ color: 'var(--accent-bright)' }}>1.4</span><span style={{ fontSize: 14, color: 'var(--fg-4)', marginLeft: 4 }}>×</span></div>
          <div className="lbl">momentum</div>
        </div>
      </div>

      <div className="filters" style={{ marginBottom: 18, marginTop: 0 }}>
        {[
          { id: 'open', label: 'Open' },
          { id: 'urgent', label: 'Urgent' },
          { id: 'done', label: 'Done' },
          { id: 'all', label: 'All' },
        ].map(f => (
          <button key={f.id}
            className={`pill ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >{f.label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {visible.map(t => (
          <TaskCard key={t.id} t={t}
            expanded={expanded === t.id}
            onExpand={() => setExpanded(e => e === t.id ? null : t.id)}
            onToggleDone={() => toggleDone(t.id)}
            openSource={() => openDetail(t.sourceId)}
          />
        ))}
        {!visible.length && (
          <div style={{
            padding: '40px 20px', textAlign: 'center',
            color: 'var(--fg-4)', fontFamily: 'Geist Mono, monospace', fontSize: 12,
          }}>nothing here. inbox zero ✓</div>
        )}
      </div>
    </div>
  );
}

function TaskCard({ t, expanded, onExpand, onToggleDone, openSource }) {
  return (
    <div className={`task ${t.done ? 'done' : ''} ${t.urgent ? 'urgent' : ''}`}>
      <button className={`step-check ${t.done ? 'checked' : ''}`}
        onClick={(e) => { e.stopPropagation(); onToggleDone(); }}
        style={{ marginTop: 2 }}>
        <svg viewBox="0 0 14 14" width={11} height={11}><path d="m3 7 3 3 5-7" fill="none" stroke="#0a0b0d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      <div className="task-row" onClick={onExpand}>
        <div>
          {t.urgent && !t.done && <span className="badge badge-urgent" style={{ marginRight: 8 }}>urgent</span>}
          <h3 className="task-title" style={{ display: 'inline' }}>{t.title}</h3>
        </div>
        <p className="task-desc">{t.desc}</p>

        {expanded && (
          <div style={{
            marginTop: 10, padding: '12px 14px', borderRadius: 10,
            background: 'var(--bg-2)', border: '1px solid var(--hairline)',
            animation: 'previewIn 200ms var(--ease)',
          }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>where it came from</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'var(--panel-2)', border: '1px solid var(--hairline)',
                display: 'grid', placeItems: 'center', color: 'var(--fg-3)',
              }}><Ico.play width={14} height={14} /></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, color: 'var(--fg)' }}>{t.source}</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)' }}>video · 23m · saved 3h ago</div>
              </div>
              <button className="btn btn-ghost" onClick={(e) => { e.stopPropagation(); openSource(); }}>
                Open source <Ico.arrow width={12} height={12} />
              </button>
            </div>

            <div style={{ marginTop: 12 }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>subtasks · 3 / 5</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[
                  { d: true, t: 'Pick the goal you keep avoiding' },
                  { d: true, t: 'Write the next physical action on paper' },
                  { d: true, t: 'Put 90 minutes on the calendar tomorrow' },
                  { d: false, t: 'Phone in another room before starting' },
                  { d: false, t: 'Publish or send the v1 — no fourth re-read' },
                ].map((x, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: x.d ? 'var(--fg-4)' : 'var(--fg-2)' }}>
                    <span style={{
                      width: 12, height: 12, borderRadius: 3,
                      border: `1.5px solid ${x.d ? 'var(--accent)' : 'var(--hairline-hover)'}`,
                      background: x.d ? 'var(--accent)' : 'transparent',
                      flexShrink: 0,
                    }}></span>
                    <span style={{ textDecoration: x.d ? 'line-through' : 'none' }}>{x.t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="task-foot">
          <span className="src-link">
            <Ico.link width={10} height={10} />
            {t.source.length > 32 ? t.source.slice(0, 32) + '…' : t.source}
          </span>
          <span>· {Math.round(t.progress * 100)}% complete</span>
          <span style={{ marginLeft: 'auto', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onExpand(); }}>
            {expanded ? '— collapse' : '+ expand'}
          </span>
        </div>
      </div>

      <div className="task-deadline">
        <span className="val">{t.deadline}</span>
        <span className="lbl">deadline</span>
      </div>

      <div className="task-progress"><div className="fill" style={{ width: `${t.progress * 100}%` }}></div></div>
    </div>
  );
}

window.Tasks = Tasks;
