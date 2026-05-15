import { createContext, useContext, useState, useEffect } from 'react'
import { BrowserRouter, NavLink, Outlet, Routes, Route, Navigate } from 'react-router-dom'
import {
  BookOpen,
  Search,
  CheckSquare,
  LayoutDashboard,
  Sun,
  Moon,
  Youtube,
  ChevronRight,
} from 'lucide-react'

// ── Theme context ──────────────────────────────────────────────────────────────

const ThemeContext = createContext(null)

export function useTheme() {
  return useContext(ThemeContext)
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('yt-notes-theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('yt-notes-theme', theme)
  }, [theme])

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

// ── Navigation items ────────────────────────────────────────────────────────────

const NAV = [
  { to: '/dashboard', label: 'Dashboard',  Icon: LayoutDashboard },
  { to: '/library',   label: 'Library',    Icon: BookOpen        },
  { to: '/search',    label: 'Search',     Icon: Search          },
  { to: '/actions',   label: 'Actions',    Icon: CheckSquare     },
]

// ── Sidebar ─────────────────────────────────────────────────────────────────────

function Sidebar() {
  const { theme, toggle } = useTheme()

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>
          <Youtube size={14} strokeWidth={2.5} color="#e8a020" />
        </div>
        <span style={styles.logoText}>YT Notes</span>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Nav */}
      <nav style={styles.nav}>
        <p style={styles.navLabel}>Navigate</p>
        {NAV.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            ...styles.navLink,
            ...(isActive ? styles.navLinkActive : {}),
          })}>
            {({ isActive }) => (
              <>
                <Icon
                  size={14}
                  strokeWidth={isActive ? 2 : 1.5}
                  style={{ color: isActive ? 'var(--amber)' : 'var(--text-dim)', flexShrink: 0 }}
                />
                <span style={{ flex: 1 }}>{label}</span>
                {isActive && (
                  <ChevronRight size={10} style={{ color: 'var(--amber)', opacity: 0.7 }} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={styles.sidebarFooter}>
        <div style={styles.divider} />
        <button
          onClick={toggle}
          style={styles.themeBtn}
          aria-label="Toggle theme"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark'
            ? <Sun size={13} strokeWidth={1.5} />
            : <Moon size={13} strokeWidth={1.5} />}
          <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>
      </div>
    </aside>
  )
}

// ── Layout shell ────────────────────────────────────────────────────────────────

function Layout() {
  return (
    <div style={styles.shell}>
      <Sidebar />
      <main style={styles.main}>
        {/* Subtle top-edge ambient glow */}
        <div style={styles.ambientGlow} />
        <div style={styles.mainInner}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

// ── Placeholder pages (replace with real routes later) ──────────────────────────

function Placeholder({ title }) {
  return (
    <div style={styles.placeholder}>
      <p style={styles.placeholderLabel}>Coming soon</p>
      <h1 style={styles.placeholderTitle}>{title}</h1>
    </div>
  )
}

// ── App root ────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
            <Route path="/library"   element={<Placeholder title="Library" />} />
            <Route path="/search"    element={<Placeholder title="Search" />} />
            <Route path="/actions"   element={<Placeholder title="Actions" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

// ── Inline styles (theme-aware via CSS variables) ───────────────────────────────

const styles = {
  shell: {
    display: 'flex',
    height: '100vh',
    width: '100%',
    overflow: 'hidden',
    background: 'var(--bg)',
  },

  // ── Sidebar
  sidebar: {
    width: 'var(--sidebar-w)',
    minWidth: 'var(--sidebar-w)',
    height: '100%',
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '22px 20px 20px',
  },

  logoIcon: {
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    background: 'var(--amber-dim)',
    border: '1px solid var(--amber-glow)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  logoText: {
    fontFamily: 'var(--font-display)',
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-h)',
    letterSpacing: '-0.3px',
  },

  divider: {
    height: '1px',
    background: 'var(--border)',
    margin: '0 16px',
  },

  nav: {
    flex: 1,
    padding: '20px 10px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },

  navLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '9px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--text-dim)',
    padding: '0 10px 8px',
  },

  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    borderRadius: '6px',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    fontWeight: 400,
    color: 'var(--text)',
    textDecoration: 'none',
    transition: 'background 120ms ease, color 120ms ease',
    letterSpacing: '0.01em',
  },

  navLinkActive: {
    background: 'var(--amber-dim)',
    color: 'var(--text-h)',
    fontWeight: 500,
  },

  sidebarFooter: {
    padding: '0 0 16px',
  },

  themeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '10px 20px',
    marginTop: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-dim)',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    letterSpacing: '0.03em',
    transition: 'color 120ms ease',
    textAlign: 'left',
  },

  // ── Main
  main: {
    flex: 1,
    height: '100%',
    overflow: 'hidden auto',
    position: 'relative',
    background: 'var(--bg)',
  },

  ambientGlow: {
    position: 'sticky',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent 0%, var(--amber-glow) 50%, transparent 100%)',
    zIndex: 10,
    pointerEvents: 'none',
  },

  mainInner: {
    padding: '48px 56px',
    maxWidth: '900px',
  },

  // ── Placeholder
  placeholder: {
    paddingTop: '80px',
  },

  placeholderLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--amber)',
    marginBottom: '12px',
    opacity: 0.8,
  },

  placeholderTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '52px',
    fontWeight: 500,
    color: 'var(--text-h)',
    letterSpacing: '-1.5px',
    lineHeight: 1.05,
  },
}
