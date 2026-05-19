import { createContext, useContext, useState, useEffect } from 'react'
import { BrowserRouter, Outlet, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'

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
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="/home"    element={<Placeholder title="Home" />} />
            <Route path="/ask"     element={<Placeholder title="Ask" />} />
            <Route path="/library" element={<Placeholder title="Library" />} />
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
    height: '100dvh',
    width: '100%',
    overflow: 'hidden',
    background: 'var(--bg)',
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
    padding: '40px 48px',
    maxWidth: '100%',
    width: '100%',
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
