import { useState, useEffect, useMemo } from 'react'
import { ArrowIcon, PlayIcon, ExternalIcon, AddIcon } from './Icons'

/* ============================================================
   Library — filterable content grid + inline detail view.
     GET /api/goals                  → filter pills
     GET /api/library[?goal_id=]     → cards
     GET /api/library/{id}           → detail
   ============================================================ */

const TYPE_DOT = {
  youtube: '#ff5a5f',
  video: '#ff5a5f',
  article: 'var(--cat-tech)',
  tweet: 'var(--fg-2)',
  pdf: '#E5B86F',
}

function parseTs(s) {
  if (!s) return null
  let v = s.includes('T') ? s : s.replace(' ', 'T')
  if (!/[zZ]|[+-]\d\d:?\d\d$/.test(v)) v += 'Z'
  const d = new Date(v)
  return isNaN(d.getTime()) ? null : d
}

function relativeTime(s) {
  const d = parseTs(s)
  if (!d) return ''
  const days = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.round(days / 7)}w ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function Library({ openAdd, initialGoalId = null }) {
  const [goals, setGoals] = useState([])
  const [filter, setFilter] = useState(initialGoalId ?? 'all') // 'all' | goalId
  const [sort, setSort] = useState('newest') // 'newest' | 'oldest'
  const [items, setItems] = useState(null) // null = loading
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    let alive = true
    fetch('/api/goals')
      .then((r) => r.json())
      .then((data) => alive && setGoals(Array.isArray(data) ? data : []))
      .catch(() => alive && setGoals([]))
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    let alive = true
    setItems(null)
    const url = filter === 'all' ? '/api/library' : `/api/library?goal_id=${filter}`
    fetch(url)
      .then((r) => r.json())
      .then((data) => alive && setItems(Array.isArray(data) ? data : []))
      .catch(() => alive && setItems([]))
    return () => {
      alive = false
    }
  }, [filter])

  // goal_id → category colour for the card dots
  const colorByGoal = useMemo(() => {
    const map = {}
    for (const g of goals) map[g.id] = g.area_color
    return map
  }, [goals])

  const sorted = useMemo(() => {
    if (!items) return []
    const withTime = items.map((c) => ({ c, t: parseTs(c.created_at)?.getTime() ?? 0 }))
    withTime.sort((a, b) => (sort === 'newest' ? b.t - a.t : a.t - b.t))
    return withTime.map((x) => x.c)
  }, [items, sort])

  if (selectedId != null) {
    return (
      <DetailView
        id={selectedId}
        colorByGoal={colorByGoal}
        onBack={() => setSelectedId(null)}
      />
    )
  }

  return (
    <div className="main-inner">
      <section className="home-hero" style={{ padding: '24px 0 8px' }}>
        <div className="eyebrow">/ library</div>
        <h1 className="home-title welcome">Everything you've saved.</h1>
      </section>

      <div className="filters">
        <button
          className={`pill ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        {goals.map((g) => (
          <button
            key={g.id}
            className={`pill ${String(filter) === String(g.id) ? 'active' : ''}`}
            onClick={() => setFilter(g.id)}
          >
            <span className="dot" style={{ background: g.area_color }} />
            {g.title}
          </button>
        ))}
        <span className="spacer" />
        <SortDropdown value={sort} onChange={setSort} />
      </div>

      <div className="lib-meta">
        <span>
          {items === null ? 'loading…' : `${sorted.length} ${sorted.length === 1 ? 'piece' : 'pieces'}`}
          {filter !== 'all' && ' · filtered'}
        </span>
        <span>· sorted {sort}</span>
        <button className="add-pill" onClick={openAdd}>
          <AddIcon width={14} height={14} />
          Add content
        </button>
      </div>

      <div className="grid">
        {items === null ? null : sorted.length === 0 ? (
          <EmptyState onAdd={openAdd} />
        ) : (
          sorted.map((c, i) => (
            <ContentCard
              key={c.id}
              item={c}
              idx={i}
              color={colorByGoal[c.goal_id]}
              onClick={() => setSelectedId(c.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

/* ---------- card ---------- */
function ContentCard({ item, idx, color, onClick }) {
  const type = item.content_type || 'article'
  const isVideo = type === 'youtube' || type === 'video'
  return (
    <article
      className="card"
      onClick={onClick}
      style={{ animationDelay: `${Math.min(idx, 8) * 40}ms` }}
    >
      <div className="row">
        <span className="tag">
          <span className="dot" style={{ background: TYPE_DOT[type] || 'var(--fg-4)' }} />
          {type}
        </span>
        {color && (
          <span className="tag">
            <span className="dot" style={{ background: color }} />
          </span>
        )}
        <span className="ts">{relativeTime(item.created_at)}</span>
      </div>

      <div className={`thumb ${isVideo ? 'video' : ''}`}>
        <span className="type-badge">{type}</span>
        {isVideo && (
          <div className="play">
            <PlayIcon width={14} height={14} />
          </div>
        )}
      </div>

      <h3 className="title">{item.title}</h3>
      {item.summary && <p className="summary">{item.summary}</p>}

      <div className="foot">
        <span className="src mono">
          <ExternalIcon width={11} height={11} />
          {item.source || hostOf(item.url)}
        </span>
        <span className="arrow">
          <ArrowIcon width={12} height={12} />
        </span>
      </div>
    </article>
  )
}

/* ---------- sort dropdown (newest / oldest) ---------- */
function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const opts = ['newest', 'oldest']
  return (
    <div style={{ position: 'relative' }}>
      <button className="sort" onClick={() => setOpen((o) => !o)}>
        <span>sort by:</span>
        <span className="val">{value}</span>
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              background: 'var(--panel)',
              border: '1px solid var(--hairline-2)',
              borderRadius: 10,
              padding: 4,
              minWidth: 140,
              zIndex: 11,
            }}
          >
            {opts.map((o) => (
              <button
                key={o}
                onClick={() => {
                  onChange(o)
                  setOpen(false)
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 10px',
                  background: 'transparent',
                  border: 0,
                  color: o === value ? 'var(--accent-bright)' : 'var(--fg-2)',
                  fontSize: 12.5,
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontFamily: 'Geist Mono, monospace',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--panel-2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {o}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ---------- inline detail ---------- */
function DetailView({ id, colorByGoal, onBack }) {
  const [content, setContent] = useState(undefined) // undefined=loading, null=error

  useEffect(() => {
    let alive = true
    fetch(`/api/library/${id}`)
      .then((r) => r.json())
      .then((data) => alive && setContent(data && !data.error ? data : null))
      .catch(() => alive && setContent(null))
    return () => {
      alive = false
    }
  }, [id])

  if (content === undefined) {
    return (
      <div className="main-inner">
        <article className="article" aria-busy="true" />
      </div>
    )
  }

  if (content === null) {
    return (
      <div className="main-inner">
        <article className="article">
          <div className="crumbs">
            <button onClick={onBack}>Library</button>
            <span className="sep">/</span>
            <span className="current">not found</span>
          </div>
          <p className="article-body">That content could not be loaded.</p>
        </article>
      </div>
    )
  }

  const type = content.content_type || 'article'
  const isVideo = type === 'youtube' || type === 'video'
  const color = colorByGoal[content.goal_id]
  const tags = Array.isArray(content.tags) ? content.tags : []
  const takeaways = Array.isArray(content.key_points) ? content.key_points : []
  const date = parseTs(content.created_at)

  return (
    <div className="main-inner">
      <article className="article">
        <div className="crumbs">
          <button onClick={onBack}>Library</button>
          <span className="sep">/</span>
          <span className="current">{type}</span>
        </div>

        <div className={`article-hero thumb ${isVideo ? 'video' : ''}`}>
          <span className="type-badge">{type}</span>
          {isVideo && (
            <div className="play">
              <PlayIcon width={18} height={18} />
            </div>
          )}
        </div>

        <h1 className="article-title">{content.title}</h1>

        <div className="article-meta">
          <span>{type}</span>
          {date && (
            <>
              <span className="dash">·</span>
              <span>{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </>
          )}
          {color && (
            <>
              <span className="dash">·</span>
              <span className="dot" style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block' }} />
            </>
          )}
        </div>

        {tags.length > 0 && (
          <div className="article-tags">
            {tags.map((t, i) => (
              <span key={i} className="tag">
                {t}
              </span>
            ))}
          </div>
        )}

        {content.summary && (
          <div className="article-body">
            <p>{content.summary}</p>
          </div>
        )}

        {takeaways.length > 0 && (
          <section className="article-section">
            <h2>Key takeaways</h2>
            <div className="takeaways">
              {takeaways.map((point, i) => (
                <div key={i} className="takeaway">
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                  <p>{point}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {content.url && (
          <a className="article-source" href={content.url} target="_blank" rel="noreferrer">
            <ExternalIcon width={13} height={13} />
            <span>{content.source || hostOf(content.url)}</span>
            <span className="dash">·</span>
            <span className="src-url">open original</span>
          </a>
        )}
      </article>
    </div>
  )
}

function EmptyState({ onAdd }) {
  return (
    <div
      style={{
        gridColumn: '1 / -1',
        padding: '60px 20px',
        textAlign: 'center',
        color: 'var(--fg-4)',
        fontFamily: 'Geist Mono, monospace',
        fontSize: 12,
        letterSpacing: '0.04em',
      }}
    >
      nothing saved here yet —{' '}
      <button
        onClick={onAdd}
        style={{ background: 'none', border: 0, color: 'var(--accent-bright)', cursor: 'pointer', font: 'inherit' }}
      >
        add your first link
      </button>
    </div>
  )
}

function hostOf(url) {
  if (!url) return ''
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
