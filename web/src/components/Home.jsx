import { useState, useEffect } from 'react'
import { SearchIcon, ArrowIcon } from './Icons'
import FocusCard from './FocusCard'

function greetingForHour(h) {
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const TYPE_DOT = {
  youtube: '#ff5a5f',
  video: '#ff5a5f',
  article: 'var(--cat-tech)',
  tweet: 'var(--fg-2)',
  pdf: '#E5B86F',
}

// Friendlier display labels for the compact recents badge.
const TYPE_LABEL = {
  youtube: 'VIDEO',
  video: 'VIDEO',
  article: 'ESSAY',
  tweet: 'TWEET',
  pdf: 'PDF',
  paste: 'NOTE',
}

// saved_content.created_at is SQLite UTC text ("YYYY-MM-DD HH:MM:SS").
function timeAgo(dateStr) {
  if (!dateStr) return ''
  const iso = dateStr.includes('T') ? dateStr : `${dateStr.replace(' ', 'T')}Z`
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''

  const mins = Math.floor((Date.now() - then) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`

  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  if (hours < 48) return 'yesterday'

  return `${Math.floor(hours / 24)}d ago`
}

export default function Home({ setRoute, openDetail, motto }) {
  return (
    <div className="main-inner home-page">
      <section className="focus-home-head">
        <div className="eyebrow">/ focus</div>
        <Greeting motto={motto} />
      </section>

      <FocusCard openDetail={openDetail} />

      <WeeklyStats />

      <SearchBar setRoute={setRoute} />

      <Recents openDetail={openDetail} setRoute={setRoute} />
    </div>
  )
}

function Greeting({ motto }) {
  const [greeting, setGreeting] = useState(() => greetingForHour(new Date().getHours()))
  const [name, setName] = useState('')

  useEffect(() => {
    const t = setInterval(
      () => setGreeting(greetingForHour(new Date().getHours())),
      60 * 1000,
    )
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    let alive = true
    fetch('/api/onboarding/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (alive && data && typeof data.name === 'string') setName(data.name.trim())
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  return (
    <h1 className="home-title welcome focus-greeting">
      <span>
        {greeting}
        {name ? (
          <>
            , <span className="ink">{name}</span>.
          </>
        ) : (
          '.'
        )}
      </span>
      {motto && <span className="motto-inline">{motto}</span>}
    </h1>
  )
}

function WeeklyStats() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let alive = true
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => {
        if (alive) setStats(data)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  if (!stats) return null

  // Prefer the backend's weekly breakdown; fall back to lifetime counts.
  const weekly = stats.weekly || {}
  const acted = weekly.acted ?? stats.completed_actions ?? 0
  const total = weekly.total ?? acted + (stats.active_actions || 0)
  const expired = weekly.expired ?? stats.expired_actions ?? 0
  const isLow = total > 0 && acted / total < 0.5

  return (
    <div className={`weekly-stats ${isLow ? 'is-low' : ''}`}>
      You acted on <span className="num">{acted}</span> of <span className="num">{total}</span> this
      week
      <span className="dot-sep"> · </span>
      <span className="muted">
        <span className="num">{expired}</span> expired
      </span>
    </div>
  )
}

function SearchBar({ setRoute }) {
  const [query, setQuery] = useState('')

  function onSubmit(e) {
    e.preventDefault()
    setRoute('ask')
  }

  return (
    <form className="search-bar focus-search" onSubmit={onSubmit}>
      <SearchIcon className="ico" width={16} height={16} />
      <input
        placeholder="Search your saved content"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <span className="kbd">⌘K</span>
    </form>
  )
}

function Recents({ openDetail, setRoute }) {
  const [items, setItems] = useState(null)
  const [goalsById, setGoalsById] = useState({})

  useEffect(() => {
    let alive = true
    fetch('/api/library?limit=4')
      .then((r) => r.json())
      .then((data) => {
        if (alive) setItems(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (alive) setItems([])
      })
    return () => {
      alive = false
    }
  }, [])

  // Library items carry goal_id but not the goal's title/colour, so build a
  // lookup to render each card's goal pill.
  useEffect(() => {
    let alive = true
    fetch('/api/goals')
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return
        const map = {}
        if (Array.isArray(data)) data.forEach((g) => { map[g.id] = g })
        setGoalsById(map)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  return (
    <section className="recents">
      <div className="recents-head">
        <span className="eyebrow">/ recently saved</span>
        <button className="link-btn" onClick={() => setRoute('library')}>
          See all in Library <ArrowIcon width={11} height={11} />
        </button>
      </div>

      {items && items.length === 0 ? (
        <p className="recents-empty">
          No content saved yet. Paste a YouTube URL to get started.
        </p>
      ) : (
        <div className="recents-row">
          {(items || []).map((item) => (
            <RecentMini
              key={item.id}
              item={item}
              goal={goalsById[item.goal_id]}
              onClick={() => openDetail(item.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function RecentMini({ item, goal, onClick }) {
  const type = item.content_type || 'article'

  return (
    <button className="recent-mini" onClick={onClick}>
      <span className="rm-top">
        <span className="rm-type">
          <span className="dot" style={{ background: TYPE_DOT[type] || 'var(--fg-4)' }}></span>
          {TYPE_LABEL[type] || type.toUpperCase()}
        </span>
        {item.created_at && <span className="rm-ts">{timeAgo(item.created_at)}</span>}
      </span>

      <span className="rm-title">{item.title}</span>

      {goal && (
        <span className="rm-goal">
          <span className="dot" style={{ background: goal.area_color || 'var(--fg-4)' }}></span>
          <span className="label">{goal.title}</span>
        </span>
      )}
    </button>
  )
}
