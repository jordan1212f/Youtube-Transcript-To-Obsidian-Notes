/* Progress screen — heatmap, stats, momentum */

// Pool of real things the user has been working on.
// Drawn from TASKS (main tasks) and DETAIL_C1.steps (subtasks).
const ACTIVITY_POOL = [
{ kind: 'task', title: "Time-block tomorrow's first 90-min deep-work session" },
{ kind: 'task', title: "Write your '5 types of wealth' check-in" },
{ kind: 'task', title: "Set up the automated $200/mo brokerage transfer" },
{ kind: 'task', title: "Run 5K three times this week" },
{ kind: 'task', title: "Publish your first 'building in public' post" },
{ kind: 'subtask', title: "Pick tomorrow's top 3 priorities tonight", parent: "deep-work session" },
{ kind: 'subtask', title: "Phone in another room before starting", parent: "deep-work session" },
{ kind: 'subtask', title: "Write the one-sentence outcome for the block", parent: "deep-work session" },
{ kind: 'subtask', title: "Draft the 'time' wealth paragraph", parent: "5 types of wealth check-in" },
{ kind: 'subtask', title: "Draft the 'physical' wealth paragraph", parent: "5 types of wealth check-in" },
{ kind: 'subtask', title: "Open brokerage account in Vanguard", parent: "$200/mo brokerage transfer" },
{ kind: 'subtask', title: "Pick the day after payday for the transfer", parent: "$200/mo brokerage transfer" },
{ kind: 'subtask', title: "Add one set on Monday's squat session", parent: "Run 5K three times this week" },
{ kind: 'task', title: "Re-read Atomic Habits ch.3, mark identity quotes" },
{ kind: 'subtask', title: "Pick one Naval thread idea to write about", parent: "building in public post" }];


const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Stable hash for a Date → integer (used as seed for activity picks)
function dateSeed(d) {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate() >>> 0;
}

function activitiesForDate(date, level) {
  if (level <= 0 || !date) return [];
  let count = level;
  if (level >= 4) {
    const lvlSeed = dateSeed(date) * 2246822519 >>> 0;
    count = 4 + lvlSeed % 3; // 4, 5 or 6
  }
  const baseSeed = dateSeed(date);
  const taken = new Set();
  const out = [];
  let k = 0;
  while (out.length < count && k < ACTIVITY_POOL.length * 3) {
    const seed = (baseSeed + 1) * 1103515245 + (k + 1) * 2654435761 + 7 >>> 0;
    const i = seed % ACTIVITY_POOL.length;
    if (!taken.has(i)) {
      taken.add(i);
      out.push(ACTIVITY_POOL[i]);
    }
    k++;
  }
  return out;
}

function formatDate(d) {
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
  return `${weekday} · ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function Progress() {
  const data = React.useMemo(() => generateYearHeatmap(), []);
  const { cells, start, today } = data;
  const weeks = cells.length / 7; // 53 weeks typically
  const activeDays = cells.filter((c) => c.date && c.level > 0).length;

  const [tip, setTip] = React.useState(null);

  const onHeatEnter = (e, i, cell) => {
    if (!cell.date) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTip({
      idx: i,
      x: rect.left + rect.width / 2,
      y: rect.top,
      level: cell.level,
      activities: activitiesForDate(cell.date, cell.level),
      dateLabel: formatDate(cell.date)
    });
  };
  const onHeatLeave = () => setTip(null);

  // Month labels: for each week column, look at the first cell's date.
  // Place the label at the first column where that month appears, and
  // skip if the column would overlap a previous label (too tight).
  const monthLabels = [];
  let lastMonth = -1;
  for (let w = 0; w < weeks; w++) {
    const firstCellDate = cells[w * 7].date || cells[Math.min(w * 7 + 6, cells.length - 1)].date;
    if (!firstCellDate) continue;
    const m = firstCellDate.getMonth();
    if (m !== lastMonth) {
      // Only label if there's at least 2 weeks of room until the next month change
      monthLabels.push({ week: w, month: m });
      lastMonth = m;
    }
  }

  return (
    <div className="main-inner">
      <div className="eyebrow" style={{ marginBottom: 22 }}>/ progress</div>

      <div className="progress-grid">
        <div className="panel">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <h3>Activity</h3>
              <div className="sub">last year · {activeDays} active days</div>
            </div>
          </div>

          <YearHeatmap
            cells={cells}
            weeks={weeks}
            monthLabels={monthLabels}
            tip={tip}
            onEnter={onHeatEnter}
            onLeave={onHeatLeave} />
          

          <div className="heatmap-legend">
            <span>less</span>
            <div className="swatches">
              <span className="sw"></span>
              <span className="sw" style={{ background: 'rgba(var(--accent-rgb), 0.20)' }}></span>
              <span className="sw" style={{ background: 'rgba(var(--accent-rgb), 0.42)' }}></span>
              <span className="sw" style={{ background: 'rgba(var(--accent-rgb), 0.70)' }}></span>
              <span className="sw" style={{ background: 'var(--accent-bright)' }}></span>
            </div>
            <span>more</span>
            <span style={{ marginLeft: 'auto' }}>longest streak · <span style={{ color: 'var(--fg)' }}>14 days</span></span>
          </div>
        </div>

        <div className="panel">
          <h3>Momentum</h3>
          <div className="sub">this week · saved vs done</div>

          <Momentum actions={14} saved={10} />
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <div className="panel" style={{ borderRadius: "10px" }}>          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <h3>By category</h3>
              <div className="sub">what you've been consuming · this month</div>
            </div>
          </div>

          <CategoryDonut data={CATEGORY_BREAKDOWN} />

          <div style={{
            marginTop: 22, paddingTop: 18,
            borderTop: '1px solid var(--hairline)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 14
          }}>
            {[
            { v: '23', unit: 'projects shipped', sub: '+4 vs last month' },
            { v: '187', unit: 'items saved', sub: '−12% — that\'s good' },
            { v: '68%', unit: 'conversion', sub: 'saved → action taken' }].
            map((s, i) =>
            <div key={i} className="big-stat" style={{ minWidth: 0 }}>
                <div className="v" style={{
                fontSize: 26,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                  {s.v}
                  <span className="unit" style={{
                  fontSize: 12,
                  marginLeft: 6,
                  display: 'block',
                  marginTop: 2,
                  color: 'var(--fg-3)'
                }}>{s.unit}</span>
                </div>
                <div className="l" style={{ marginTop: 8 }}>{s.sub}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {tip &&
      <HeatTooltip tip={tip} />
      }
    </div>);

}

function HeatTooltip({ tip }) {
  const { x, y, activities, dateLabel, level } = tip;
  const style = { left: `${x}px`, top: `${y}px` };
  return (
    <div className="heat-tooltip is-on" style={style}>
      <div className="ht-date">
        <span>{dateLabel}</span>
        {activities.length > 0 &&
        <span className="ht-count">{activities.length} done</span>
        }
      </div>
      {activities.length === 0 ?
      <div className="ht-empty">No tasks completed</div> :
      activities.map((a, i) =>
      <div key={i} className="ht-row">
            <span className={`ht-check${a.kind === 'subtask' ? ' sub' : ''}`} aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="ht-title">
              {a.title}
              {a.parent &&
          <span style={{ display: 'block', color: 'var(--fg-4)', fontSize: 11, marginTop: 2 }}>
                  ↳ {a.parent}
                </span>
          }
            </span>
          </div>
      )
      }
    </div>);

}

function YearHeatmap({ cells, weeks, monthLabels, tip, onEnter, onLeave }) {
  const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
  return (
    <div className="year-heatmap">
      {/* Top: month labels row, indented past the day-of-week column */}
      <div className="yh-months">
        <div className="yh-day-col" />
        <div className="yh-months-grid" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}>
          {monthLabels.map((m) =>
          <span key={`${m.week}-${m.month}`} style={{ gridColumn: `${m.week + 1} / span 1` }}>
              {MONTHS[m.month]}
            </span>
          )}
        </div>
      </div>

      {/* Body: weekday labels + grid */}
      <div className="yh-body">
        <div className="yh-day-col">
          {DAY_LABELS.map((l, i) =>
          <span key={i} className="yh-day-label">{l}</span>
          )}
        </div>
        <div
          className="yh-grid"
          style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}>
          
          {cells.map((c, i) => {
            const week = Math.floor(i / 7);
            const day = i % 7;
            const isEmpty = !c.date;
            return (
              <div
                key={i}
                className={`heat l${c.level}${tip?.idx === i ? ' is-hover' : ''}${isEmpty ? ' is-empty' : ''}`}
                style={{ gridColumn: week + 1, gridRow: day + 1 }}
                onMouseEnter={(e) => onEnter(e, i, c)}
                onMouseLeave={onLeave} />);


          })}
        </div>
      </div>
    </div>);

}

function Momentum({ actions, saved }) {
  const ratio = saved > 0 ? actions / saved : actions;
  const positive = ratio >= 1.0;
  const color = positive ? 'var(--accent-bright)' : '#E07A6B';
  const glow = positive ?
  '0 0 18px rgba(var(--accent-bright-rgb), 0.55), 0 0 36px rgba(var(--accent-rgb), 0.35)' :
  '0 0 18px rgba(224, 122, 107, 0.55), 0 0 36px rgba(224, 122, 107, 0.30)';

  const message = positive ?
  ratio >= 1.5 ?
  "Strong week — you're shipping faster than you're saving." :
  "Nice progress! Keep it up." :
  "You're saving more than you're acting on. Pick one thing to ship.";

  return (
    <div style={{
      marginTop: 18,
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      gap: 28,
      alignItems: 'center'
    }}>
      <div style={{

        fontSize: 92,
        lineHeight: 1,
        letterSpacing: '-0.03em',
        color,
        textShadow: glow,
        fontWeight: 500, fontFamily: "Geist"
      }}>
        {ratio.toFixed(1)}<span style={{ fontSize: 56, marginLeft: 2 }}>×</span>
      </div>

      <div style={{ minWidth: 0 }}>
        <p style={{
          fontSize: 17,
          lineHeight: 1.45,
          color: 'var(--fg)',
          margin: '0 0 10px',
          fontWeight: 400
        }}>
          You shipped <span style={{ color, fontWeight: 500 }}>{actions} actions</span> this week from the <span style={{ color: 'var(--fg)', fontWeight: 500 }}>{saved} pieces</span> of content you saved.
        </p>
        <p style={{
          fontSize: 13.5,
          color: 'var(--fg-3)',
          margin: 0,
          lineHeight: 1.5,
          fontStyle: 'italic'
        }}>
          {message}
        </p>
      </div>
    </div>);

}

function RingChart({ value, max = 2 }) {
  const r = 48;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, value / max);
  return (
    <div className="ring-wrap">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} stroke="var(--panel-3)" strokeWidth="6" fill="none" />
        <circle cx="55" cy="55" r={r}
        stroke="var(--accent-bright)" strokeWidth="6" fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        transform="rotate(-90 55 55)"
        style={{ transition: 'stroke-dashoffset 1s var(--ease)' }} />
        
      </svg>
      <div className="ring-val">{value.toFixed(1)}×</div>
    </div>);

}

function Sparkline() {
  const data = [0.3, 0.5, 0.4, 0.7, 0.6, 0.85, 1.0, 0.9, 1.2, 1.05, 1.3, 1.4];
  const max = 1.5;
  const w = 360,h = 60,pad = 4;
  const stepX = (w - pad * 2) / (data.length - 1);
  const points = data.map((v, i) => [pad + i * stepX, h - pad - v / max * (h - pad * 2)]);
  const path = 'M ' + points.map((p) => p.join(',')).join(' L ');
  const area = path + ` L ${points[points.length - 1][0]},${h} L ${pad},${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="spkG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(var(--accent-bright-rgb), 0.22)" />
          <stop offset="100%" stopColor="rgba(var(--accent-bright-rgb), 0)" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spkG)" />
      <path d={path} fill="none" stroke="var(--accent-bright)" strokeWidth="1.6" strokeLinecap="round" />
      {points.map((p, i) =>
      <circle key={i} cx={p[0]} cy={p[1]} r={i === points.length - 1 ? 3 : 1.8}
      fill={i === points.length - 1 ? 'var(--accent-bright)' : 'var(--accent)'} />
      )}
    </svg>);

}

function CategoryDonut({ data }) {
  const [hover, setHover] = React.useState(null);
  const size = 180;
  const cx = size / 2,cy = size / 2;
  const r = 64;
  const stroke = 22;
  const C = 2 * Math.PI * r;
  const total = data.reduce((a, b) => a + b.pct, 0);

  // build segments with a tiny gap between
  const gapDeg = 1.6;
  let cursor = 0;
  const segs = data.map((d) => {
    const pct = d.pct / total;
    const len = pct * C;
    const seg = {
      ...d,
      offset: -(cursor / total * C),
      dash: `${Math.max(0, len - gapDeg / 360 * C)} ${C}`
    };
    cursor += d.pct;
    return seg;
  });

  const active = hover ?? data.reduce((a, b) => a.pct > b.pct ? a : b);

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: `${size + 8}px 1fr`,
      gap: 22, alignItems: 'center', marginTop: 8
    }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* track ring */}
          <circle cx={cx} cy={cy} r={r}
          fill="none" stroke="var(--panel-3)" strokeWidth={stroke} />

          {segs.map((s, i) =>
          <circle key={s.name}
          cx={cx} cy={cy} r={r}
          fill="none" stroke={s.dot} strokeWidth={stroke}
          strokeDasharray={s.dash}
          strokeDashoffset={s.offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          strokeLinecap="butt"
          style={{
            opacity: hover && hover.name !== s.name ? 0.32 : 1,
            cursor: 'pointer',
            transition: 'opacity 200ms var(--ease)'
          }}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(null)} />

          )}
        </svg>

        {/* center label — appears only on hover */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', textAlign: 'center',
          opacity: hover ? 1 : 0,
          transition: 'opacity 180ms var(--ease)'
        }}>
          <div style={{
            fontFamily: 'Geist Mono, monospace',
            fontSize: 9.5, letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--fg-4)',
            marginBottom: 2
          }}>{hover?.name}</div>
          <div style={{
            fontSize: 26, color: 'var(--fg)',
            letterSpacing: '-0.01em'
          }}>
            <span style={{ color: hover?.dot }}>{hover?.pct}</span>
            <span style={{ fontSize: 14, color: 'var(--fg-4)', marginLeft: 2 }}>%</span>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        columnGap: 18
      }}>
        {[data.slice(0, 5), data.slice(5, 10)].map((col, ci) =>
        <div key={ci} style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          columnGap: 8,
          rowGap: 2,
          alignContent: 'start',
          alignItems: 'center'
        }}>
            {col.map((d) => {
            const cellStyle = {
              padding: '5px 0',
              cursor: 'default',
              display: 'flex', alignItems: 'center'
            };
            return (
              <React.Fragment key={d.name}>
                  <div
                  style={{ ...cellStyle, paddingLeft: 8, gap: 8 }}>
                  
                    <span style={{
                    width: 8, height: 8, borderRadius: 2,
                    background: d.dot,
                    flexShrink: 0,
                  }}></span>
                  </div>
                  <div
                  style={{ ...cellStyle, fontSize: 12.5, color: 'var(--fg-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', lineHeight: '20px' }}>
                  
                    {d.name}
                  </div>
                  <div
                  style={{ ...cellStyle, paddingRight: 8, justifyContent: 'flex-end' }}>
                  
                    <span style={{
                    fontFamily: 'Geist Mono, monospace',
                    fontSize: 11, color: 'var(--fg-4)',
                    letterSpacing: '0.02em',
                    fontVariantNumeric: 'tabular-nums'
                  }}>{d.pct}%</span>
                  </div>
                </React.Fragment>);

          })}
          </div>
        )}
      </div>
    </div>);

}

window.Progress = Progress;