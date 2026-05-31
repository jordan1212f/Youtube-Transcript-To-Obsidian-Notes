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

  const shipped = stats.completed_actions || 0
  const saved = stats.total_content || 0
  const ratio = saved > 0 ? shipped / saved : shipped
  const ratioStr = (Math.round(ratio * 10) / 10).toFixed(1)
  const isLow = ratio < 1.0

  return (
    <div className={`weekly-stats ${isLow ? 'is-low' : ''}`}>
      {isLow ? (
        <>
          You shipped <span className="num">{shipped}</span> action
          {shipped === 1 ? '' : 's'} from <span className="num">{saved}</span> save
          {saved === 1 ? '' : 's'} this week. <span className="ratio">{ratioStr}×</span>{' '}
          <span className="verdict">— room to grow.</span>
        </>
      ) : (
        <>
          You shipped <span className="num">{shipped}</span> action
          {shipped === 1 ? '' : 's'} this week from the <span className="num">{saved}</span>{' '}
          piece{saved === 1 ? '' : 's'} of content you saved.{' '}
          <span className="ratio">{ratioStr}×</span>{' '}
          <span className="verdict">momentum — nice.</span>
        </>
      )}
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
            <RecentMini key={item.id} item={item} onClick={() => openDetail(item.id)} />
          ))}
        </div>
      )}
    </section>
  )
}

function RecentMini({ item, onClick }) {
  const type = item.content_type || 'article'
  const firstTag = Array.isArray(item.tags) && item.tags.length ? item.tags[0] : null

  return (
    <button className="recent-mini" onClick={onClick}>
      <span className="rm-tags">
        <span className="tag">
          <span className="dot" style={{ background: TYPE_DOT[type] || 'var(--fg-4)' }}></span>
          {type}
        </span>
        {firstTag && <span className="tag">{firstTag}</span>}
      </span>
      <span className="rm-title rm-title-2">{item.title}</span>
      {item.summary && <span className="rm-summary">{item.summary}</span>}
      <span className="rm-foot">
        <span className="src mono">{item.source}</span>
      </span>
    </button>
  )
}
