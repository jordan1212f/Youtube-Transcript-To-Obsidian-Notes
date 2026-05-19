import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Search, BookOpen, Sun, Moon, Settings } from 'lucide-react'
import { useTheme } from '../App'

const NAV = [
  { to: '/home',    label: 'Home',    Icon: LayoutDashboard },
  { to: '/ask',     label: 'Ask',     Icon: Search          },
  { to: '/library', label: 'Library', Icon: BookOpen        },
]

function NavItem({ to, label, Icon }) {
  const [hovered, setHovered] = useState(false)

  return (
    <NavLink
      to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={({ isActive }) => ({
        ...s.navLink,
        ...(hovered && !isActive ? s.navLinkHover : {}),
        ...(isActive ? s.navLinkActive : {}),
      })}
    >
      {({ isActive }) => (
        <>
          <Icon
            size={16}
            strokeWidth={isActive ? 2 : 1.5}
            style={{ color: isActive ? 'var(--accent)' : 'var(--text-dim)', flexShrink: 0 }}
          />
          <span style={{ flex: 1, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  const { theme, toggle } = useTheme()
  const [goals, setGoals] = useState([])
  const [settingsHovered, setSettingsHovered] = useState(false)
  const [themeHovered, setThemeHovered] = useState(false)

  useEffect(() => {
    fetch('/api/goals')
      .then(r => r.json())
      .then(data => setGoals(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  return (
    <aside style={s.sidebar}>

      {/* Logo */}
      <div style={s.logoWrap}>
        <span style={s.logoText}>Obsiditube</span>
      </div>

      <div style={s.divider} />

      {/* Primary nav */}
      <nav style={s.nav}>
        {NAV.map(item => <NavItem key={item.to} {...item} />)}
      </nav>

      <div style={s.divider} />

      {/* Goals */}
      <section style={s.goalsSection}>
        <p style={s.goalsLabel}>Goals</p>
        {goals.length === 0 ? (
          <p style={s.goalsEmpty}>No goals yet</p>
        ) : (
          <ul style={s.goalsList}>
            {goals.map((goal, i) => (
              <li key={goal.id ?? i} style={s.goalItem}>
                <span style={s.goalDot} />
                <span style={s.goalTitle}>{goal.title ?? goal.name ?? goal}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Footer */}
      <div style={s.footer}>
        <div style={s.divider} />

        <button
          onClick={toggle}
          onMouseEnter={() => setThemeHovered(true)}
          onMouseLeave={() => setThemeHovered(false)}
          style={{ ...s.footerBtn, ...(themeHovered ? s.footerBtnHover : {}) }}
          aria-label="Toggle colour scheme"
        >
          {theme === 'dark'
            ? <Sun  size={14} strokeWidth={1.5} style={s.footerIcon} />
            : <Moon size={14} strokeWidth={1.5} style={s.footerIcon} />}
          <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>

        <button
          onMouseEnter={() => setSettingsHovered(true)}
          onMouseLeave={() => setSettingsHovered(false)}
          onClick={() => console.log('open settings modal')}
          style={{ ...s.footerBtn, ...(settingsHovered ? s.footerBtnHover : {}) }}
          aria-label="Settings"
        >
          <Settings size={14} strokeWidth={1.5} style={s.footerIcon} />
          <span>Settings</span>
        </button>
      </div>

    </aside>
  )
}

const s = {
  sidebar: {
    width: 'var(--sidebar-w)',
    minWidth: 'var(--sidebar-w)',
    height: '100%',
    background: 'var(--bg-sidebar, var(--surface))',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  logoWrap: {
    padding: '22px 20px 18px',
  },

  logoText: {
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontSize: '17px',
    fontWeight: 500,
    color: 'var(--accent-text)',
    letterSpacing: '-0.2px',
  },

  divider: {
    height: '1px',
    background: 'var(--border)',
    margin: '0 16px',
    flexShrink: 0,
  },

  nav: {
    padding: '10px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  },

  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '7px 10px',
    borderRadius: '6px',
    fontFamily: 'var(--font-ui)',
    fontSize: '13px',
    fontWeight: 400,
    textDecoration: 'none',
    transition: 'background 100ms ease',
    // use box-shadow for left border so it doesn't shift padding
    boxShadow: 'inset 2px 0 0 transparent',
  },

  navLinkHover: {
    background: 'var(--bg-elevated)',
  },

  navLinkActive: {
    background: 'var(--accent-subtle)',
    fontWeight: 500,
    boxShadow: 'inset 2px 0 0 var(--accent)',
  },

  // Goals ──────────────────────────────────────────────────────
  goalsSection: {
    padding: '14px 20px 10px',
  },

  goalsLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    fontWeight: 500,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: '10px',
  },

  goalsEmpty: {
    fontFamily: 'var(--font-ui)',
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },

  goalsList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  goalItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
  },

  goalDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--accent)',
    flexShrink: 0,
  },

  goalTitle: {
    fontFamily: 'var(--font-ui)',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: 1.4,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },

  // Footer ─────────────────────────────────────────────────────
  footer: {
    paddingBottom: '8px',
    flexShrink: 0,
  },

  footerBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    width: '100%',
    padding: '8px 20px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-ui)',
    fontSize: '12px',
    letterSpacing: '0.01em',
    transition: 'color 100ms ease, background 100ms ease',
    textAlign: 'left',
  },

  footerBtnHover: {
    color: 'var(--text-secondary)',
    background: 'var(--bg-elevated)',
  },

  footerIcon: {
    flexShrink: 0,
    color: 'inherit',
  },
}
