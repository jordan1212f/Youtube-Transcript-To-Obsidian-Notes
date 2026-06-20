import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Home from './components/Home'
import Ask from './components/Ask'
import Library from './components/Library'
import SettingsModal from './components/SettingsModal'
import AddModal from './components/AddModal'
import Onboarding from './components/Onboarding'

/* ============================================================
   Accent presets — each maps a name to the CSS custom property
   values that drive the whole accent system. Switching accent
   means writing these onto document.documentElement.style.
   ============================================================ */
export const ACCENT_PRESETS = {
  teal:   { accent: '#4A9B8E', bright: '#6FE8CC', accentRgb: '74, 155, 142',  brightRgb: '111, 232, 204' },
  sage:   { accent: '#7BAE7E', bright: '#A8E0AC', accentRgb: '123, 174, 126', brightRgb: '168, 224, 172' },
  amber:  { accent: '#C99B5C', bright: '#E5B86F', accentRgb: '201, 155, 92',  brightRgb: '229, 184, 111' },
  indigo: { accent: '#5879B9', bright: '#9CB7E8', accentRgb: '88, 121, 185',  brightRgb: '156, 183, 232' },
  rose:   { accent: '#C9788C', bright: '#F2A8BD', accentRgb: '201, 120, 140', brightRgb: '242, 168, 189' },
  mauve:  { accent: '#A68FBE', bright: '#D4B8E8', accentRgb: '166, 143, 190', brightRgb: '212, 184, 232' },
}

export const FONTSETS = ['modern', 'editorial', 'soft']

const MOTTOS = [
  'Small reps. Real progress.',
  'Turn input into action.',
  'Your library, working for you.',
  'Less saving. More doing.',
]

/* ============================================================
   Theme context — theme (dark/light), accent, fontset.
   Applied to <html> via data-theme / data-fontset attributes
   and CSS custom properties for the accent.
   ============================================================ */
const ThemeContext = createContext(null)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

function useThemeState() {
  const [theme, setTheme] = useState('dark')      // 'dark' | 'light'
  const [accent, setAccent] = useState('teal')    // key of ACCENT_PRESETS
  const [fontset, setFontset] = useState('modern') // 'modern' | 'editorial' | 'soft'

  // Theme + fontset are data attributes on <html>; CSS selectors key off them.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute('data-fontset', fontset)
  }, [fontset])

  // Accent switches by writing CSS custom properties onto the root element.
  useEffect(() => {
    const preset = ACCENT_PRESETS[accent] || ACCENT_PRESETS.teal
    const root = document.documentElement
    root.style.setProperty('--accent', preset.accent)
    root.style.setProperty('--accent-bright', preset.bright)
    root.style.setProperty('--accent-rgb', preset.accentRgb)
    root.style.setProperty('--accent-bright-rgb', preset.brightRgb)
  }, [accent])

  return { theme, setTheme, accent, setAccent, fontset, setFontset }
}

/* ============================================================
   Layout shell — sidebar + main content grid (.app provides the
   CSS grid: var(--sidebar-w) 1fr). Routes between 3 pages.
   Sidebar and page content are placeholders for now.
   ============================================================ */
export default function App() {
  const themeApi = useThemeState()

  const [route, setRoute] = useState('home')
  const [showAdd, setShowAdd] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [motto] = useState(() => MOTTOS[Math.floor(Math.random() * MOTTOS.length)])
  const [onboarded, setOnboarded] = useState(null) // null = checking

  // Gate the app behind onboarding status.
  useEffect(() => {
    fetch('/api/onboarding/status')
      .then((r) => r.json())
      .then((d) => setOnboarded(Boolean(d?.onboarded)))
      .catch(() => setOnboarded(true)) // fail open so the app is usable
  }, [])

  const closeModals = useCallback(() => {
    setShowAdd(false)
    setShowSettings(false)
  }, [])

  // Keyboard: ⌘K / Ctrl+K focuses the search input, Escape closes modals.
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        document.querySelector('.search-bar input')?.focus()
      }
      if (e.key === 'Escape') closeModals()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeModals])

  if (onboarded === null) return null // brief check before first paint

  if (!onboarded) {
    return (
      <ThemeContext.Provider value={themeApi}>
        <Onboarding
          onDone={() => setOnboarded(true)}
          setTheme={themeApi.setTheme}
          setAccent={themeApi.setAccent}
          setFontset={themeApi.setFontset}
        />
      </ThemeContext.Provider>
    )
  }

  return (
    <ThemeContext.Provider value={themeApi}>
      <div className="app">
        <Sidebar
          route={route}
          setRoute={setRoute}
          openSettings={() => setShowSettings(true)}
        />

        {/* --- Main content area --- */}
        <main className="main dot-bg" data-screen-label={`02 ${route}`}>
          {route === 'home' && (
            <Home
              setRoute={setRoute}
              openAdd={() => setShowAdd(true)}
              // No Detail route yet — fall back to Library until it exists.
              openDetail={() => setRoute('library')}
              motto={motto}
            />
          )}

          {route === 'ask' && <Ask />}

          {route === 'library' && <Library openAdd={() => setShowAdd(true)} />}
        </main>

        {/* Add content — Escape (handled above) and the scrim both close it. */}
        <AddModal
          isOpen={showAdd}
          onClose={closeModals}
          onProcessed={() => {
            closeModals()
            setRoute('library') // surface the freshly saved content
          }}
        />

        {showSettings && (
          <SettingsModal
            onClose={() => setShowSettings(false)}
            theme={themeApi.theme}
            setTheme={themeApi.setTheme}
            accent={themeApi.accent}
            setAccent={themeApi.setAccent}
            fontset={themeApi.fontset}
            setFontset={themeApi.setFontset}
          />
        )}
      </div>
    </ThemeContext.Provider>
  )
}
