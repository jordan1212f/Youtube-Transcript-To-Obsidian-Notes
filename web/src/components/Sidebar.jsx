import { useState, useEffect } from 'react'
import { Home, MessageCircle, Library, Plus, Settings } from 'lucide-react'


const NAV = [
  { id: 'home', label: 'Focus', Icon: Home, meta: '⌘1' },
  { id: 'ask', label: 'Ask', Icon: MessageCircle, meta: '⌘K' },
  { id: 'library', label: 'Library', Icon: Library, meta: '⌘2' },
]

export default function Sidebar({ route, setRoute, goToGoal, activeGoal, openSettings }) {
  const [goals, setGoals] = useState(null)

  useEffect(() => {
    let alive = true
    fetch('/api/goals')
      .then((r) => r.json())
      .then((data) => {
        if (alive) setGoals(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (alive) setGoals([])
      })
    return () => {
      alive = false
    }
  }, [])

  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <span
          className="wordmark"
          style={{ fontSize: '30px', fontWeight: 900, letterSpacing: '-0.2px', fontFamily: 'Geist' }}
        >
          Clarity.
        </span>
      </div>

      <div className="sb-scroll">
        <nav className="sb-section" style={{ marginTop: 0 }}>
          {NAV.map(({ id, label, Icon, meta }) => (
            <button
              key={id}
              className={`sb-item ${route === id ? 'active' : ''}`}
              onClick={() => setRoute(id)}
            >
              <Icon className="ico" width={16} height={16} />
              <span>{label}</span>
              <span className="meta">{meta}</span>
            </button>
          ))}
        </nav>

        <div className="sb-section">
          <div className="sb-section-label">
            <span className="lbl">Goals</span>
            <button className="add" title="Add goal">
              <Plus width={12} height={12} />
            </button>
          </div>

          {goals !== null && goals.length === 0 && (
            <div style={{ padding: '8px 10px', fontSize: '13px', color: 'var(--fg-4)' }}>
              No goals yet
            </div>
          )}

          {goals !== null &&
            goals.map((goal) => (
              <button
                key={goal.id}
                className={`sb-item ${route === 'library' && String(activeGoal) === String(goal.id) ? 'active' : ''}`}
                onClick={() => goToGoal(goal.id)}
              >
                <span className="dot" style={{ background: goal.area_color }}></span>
                <span>{goal.title}</span>
                <span className="meta">{goal.content_count}</span>
              </button>
            ))}
        </div>
      </div>

      <div className="sb-foot">
        <div className="sb-avatar">J</div>
        <div style={{ minWidth: 0 }}>
          <div className="name">Jordan</div>
          <div className="email">j@clarity.app</div>
        </div>
        <button className="icon-btn" title="Settings" onClick={openSettings}>
          <Settings width={14} height={14} />
        </button>
      </div>
    </aside>
  )
}
