import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Home from './components/Home'
import Library from './components/Library'
import Ask from './components/Ask'
import Detail from './components/Detail'
import Onboarding from './components/Onboarding'
import ProcessingOverlay from './components/ProcessingOverlay'
import SettingsModal from './components/SettingsModal'
import AddModal from './components/AddModal'
import { useTheme } from './hooks/useTheme'
import './styles/globals.css'

const MOTTOS = [
  'Small reps. Real progress.',
  'Turn input into action.',
  'Your library, working for you.',
  'Less saving. More doing.',
]

export default function App() {
  const { theme, setTheme, accent, setAccent, fontset, setFontset } = useTheme()

  const [route, setRoute] = useState('home')
  const [detailId, setDetailId] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [processingSrc, setProcessingSrc] = useState(null)
  const [goalFilter, setGoalFilter] = useState('all')
  const [onboarded, setOnboarded] = useState(null)
  const [motto] = useState(() => MOTTOS[Math.floor(Math.random() * MOTTOS.length)])

  useEffect(() => {
    fetch('/api/onboarding/status')
      .then(r => r.json())
      .then(data => setOnboarded(Boolean(data?.onboarded)))
      .catch(() => setOnboarded(true))
  }, [])

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.querySelector('.search-bar input')?.focus()
      }
      if (e.key === 'Escape') {
        if (showAdd) setShowAdd(false)
        else if (showSettings) setShowSettings(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showAdd, showSettings])

  function goToGoal(catId) {
    setGoalFilter(catId || 'all')
    setRoute('library')
    setDetailId(null)
  }

  function openDetail(id) {
    setDetailId(id)
    setRoute('detail')
  }

  function back() {
    setDetailId(null)
    setRoute('home')
  }

  if (onboarded === null) return null

  if (!onboarded) {
    return <Onboarding onDone={() => setOnboarded(true)} />
  }

  return (
    <div className="app">
      <Sidebar
        route={route === 'detail' ? 'home' : route}
        setRoute={setRoute}
        goToGoal={goToGoal}
        activeGoal={goalFilter}
        openSettings={() => setShowSettings(true)}
      />
      <main className="main">
        {route === 'home' && (
          <Home
            setRoute={setRoute}
            openDetail={openDetail}
            openAdd={() => setShowAdd(true)}
            motto={motto}
          />
        )}
        {route === 'library' && (
          <Library
            openDetail={openDetail}
            openAdd={() => setShowAdd(true)}
            initialFilter={goalFilter}
            onFilterChange={setGoalFilter}
          />
        )}
        {route === 'ask' && <Ask />}
        {route === 'detail' && (
          <Detail contentId={detailId} back={back} goToGoal={goToGoal} />
        )}
      </main>

      {showAdd && (
        <AddModal
          onClose={() => setShowAdd(false)}
          onAdd={() => setRoute('home')}
          onProcess={(src) => {
            setShowAdd(false)
            setProcessingSrc(src || { title: 'Your saved content', source: 'youtube.com', type: 'video' })
          }}
        />
      )}

      {processingSrc && (
        <ProcessingOverlay
          source={processingSrc}
          onComplete={() => {
            setProcessingSrc(null)
            openDetail('c1')
          }}
        />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          theme={theme}
          setTheme={setTheme}
          accent={accent}
          setAccent={setAccent}
          fontset={fontset}
          setFontset={setFontset}
        />
      )}
    </div>
  )
}
