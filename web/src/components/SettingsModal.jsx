import { useState, useEffect } from 'react'
import { XIcon, TrashIcon, AddIcon } from './Icons'

/* ============================================================
   Settings modal — API keys, goals CRUD, appearance.
     GET/PUT /api/settings
     GET /api/goals · POST /api/goals · DELETE /api/goals/{id}
     GET /api/goal-areas  (to attach new goals to an area)
   Theme / accent / fontset are owned by App and passed in.
   ============================================================ */

const ACCENTS = [
  { id: 'teal', color: '#6FE8CC' },
  { id: 'sage', color: '#A8E0AC' },
  { id: 'amber', color: '#E5B86F' },
  { id: 'indigo', color: '#9CB7E8' },
  { id: 'rose', color: '#F2A8BD' },
  { id: 'mauve', color: '#D4B8E8' },
]

const FONTS = [
  { id: 'modern', name: 'Modern', sub: 'Geist' },
  { id: 'editorial', name: 'Editorial', sub: 'Instrument Serif' },
  { id: 'soft', name: 'Soft', sub: 'DM Serif + DM Sans' },
]

export default function SettingsModal({
  onClose,
  theme,
  setTheme,
  accent,
  setAccent,
  fontset,
  setFontset,
}) {
  // Close on Escape (the modal owns this; App also closes on Escape).
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Settings</h2>
          <button className="close" onClick={onClose} aria-label="Close">
            <XIcon width={14} height={14} />
          </button>
        </div>

        <ApiKeys />
        <Goals />

        <div className="set-section">
          <h4>Appearance</h4>

          <div className="theme-toggle">
            <button className={theme === 'dark' ? 'on' : ''} onClick={() => setTheme('dark')}>
              Dark
            </button>
            <button className={theme === 'light' ? 'on' : ''} onClick={() => setTheme('light')}>
              Light
            </button>
          </div>

          <div className="set-sub">
            <span className="set-sub-lbl">Accent</span>
            <div className="swatch-row">
              {ACCENTS.map((s) => (
                <button
                  key={s.id}
                  className={`swatch ${accent === s.id ? 'on' : ''}`}
                  style={{ background: s.color }}
                  aria-label={s.id}
                  title={s.id}
                  onClick={() => setAccent(s.id)}
                />
              ))}
            </div>
          </div>

          <div className="set-sub">
            <span className="set-sub-lbl">Fonts</span>
            <div className="font-row">
              {FONTS.map((f) => (
                <button
                  key={f.id}
                  className={`font-card ${fontset === f.id ? 'on' : ''}`}
                  onClick={() => setFontset(f.id)}
                >
                  <span className={`font-specimen font-specimen-${f.id}`}>Aa</span>
                  <span className="font-name">{f.name}</span>
                  <span className="font-sub">{f.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            paddingTop: 14,
            borderTop: '1px solid var(--hairline)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span className="eyebrow">clarity · settings</span>
          <span style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------- API keys ---------- */
function ApiKeys() {
  const [live, setLive] = useState({ api_key: false, youtube_api_key: false })
  const [claude, setClaude] = useState('')
  const [youtube, setYoutube] = useState('')
  const [show, setShow] = useState({ claude: false, youtube: false })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function loadSettings() {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) =>
        setLive({ api_key: Boolean(d?.api_key), youtube_api_key: Boolean(d?.youtube_api_key) }),
      )
      .catch(() => {})
  }

  useEffect(loadSettings, [])

  async function save() {
    const body = {}
    if (claude.trim()) body.api_key = claude.trim()
    if (youtube.trim()) body.youtube_api_key = youtube.trim()
    if (Object.keys(body).length === 0) return

    setSaving(true)
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      setClaude('')
      setYoutube('')
      setShow({ claude: false, youtube: false })
      setSaved(true)
      setTimeout(() => setSaved(false), 1800)
      loadSettings()
    } catch {
      /* ignore */
    } finally {
      setSaving(false)
    }
  }

  const dirty = Boolean(claude.trim() || youtube.trim())

  return (
    <div className="set-section">
      <h4>API keys</h4>

      <KeyRow
        label="Claude"
        value={claude}
        onChange={setClaude}
        show={show.claude}
        onToggle={() => setShow((s) => ({ ...s, claude: !s.claude }))}
        isLive={live.api_key}
      />
      <KeyRow
        label="YouTube"
        value={youtube}
        onChange={setYoutube}
        show={show.youtube}
        onToggle={() => setShow((s) => ({ ...s, youtube: !s.youtube }))}
        isLive={live.youtube_api_key}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
        <button className="btn btn-primary" onClick={save} disabled={!dirty || saving}>
          {saving ? 'Saving…' : 'Save keys'}
        </button>
        {saved && (
          <span className="status">● saved</span>
        )}
      </div>
    </div>
  )
}

function KeyRow({ label, value, onChange, show, onToggle, isLive }) {
  return (
    <div className="api-row">
      <span className="lbl">{label}</span>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isLive ? '•••••••••••• key set' : 'paste key…'}
        autoComplete="off"
        spellCheck={false}
      />
      <button
        onClick={onToggle}
        style={{
          background: 'none',
          border: 0,
          color: 'var(--fg-4)',
          fontFamily: 'Geist Mono, monospace',
          fontSize: 10.5,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          padding: '2px 4px',
        }}
      >
        {show ? 'hide' : 'show'}
      </button>
      {isLive ? (
        <span className="status">● live</span>
      ) : (
        <span className="status" style={{ color: 'var(--fg-5)' }}>
          ○ not set
        </span>
      )}
    </div>
  )
}

/* ---------- Goals ---------- */
function Goals() {
  const [goals, setGoals] = useState([])
  const [areas, setAreas] = useState([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)

  function loadGoals() {
    fetch('/api/goals')
      .then((r) => r.json())
      .then((d) => setGoals(Array.isArray(d) ? d : []))
      .catch(() => setGoals([]))
  }

  useEffect(() => {
    loadGoals()
    fetch('/api/goal-areas')
      .then((r) => r.json())
      .then((d) => setAreas(Array.isArray(d) ? d : []))
      .catch(() => setAreas([]))
  }, [])

  async function addGoal() {
    const title = draft.trim()
    if (!title || busy) return
    // New goals attach to the first goal area; the API requires an area_id.
    const areaId = areas[0]?.id ?? goals[0]?.area_id
    if (areaId == null) return
    setBusy(true)
    try {
      await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area_id: areaId, title }),
      })
      setDraft('')
      loadGoals()
    } catch {
      /* ignore */
    } finally {
      setBusy(false)
    }
  }

  async function delGoal(id) {
    setGoals((g) => g.filter((x) => x.id !== id)) // optimistic
    try {
      await fetch(`/api/goals/${id}`, { method: 'DELETE' })
    } catch {
      loadGoals() // restore on failure
    }
  }

  const canAdd = areas.length > 0 || goals.length > 0

  return (
    <div className="set-section">
      <h4>Goals</h4>
      <div className="goals-list">
        {goals.length === 0 && (
          <div style={{ padding: '8px 10px', fontSize: 12.5, color: 'var(--fg-4)' }}>
            No goals yet.
          </div>
        )}
        {goals.map((g) => (
          <div className="row" key={g.id}>
            <span
              className="dot"
              style={{ width: 8, height: 8, borderRadius: '50%', background: g.area_color }}
            />
            <span className="name">{g.title}</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)' }}>
              {g.content_count ?? 0} items
            </span>
            <button className="del" onClick={() => delGoal(g.id)} aria-label="Delete goal">
              <TrashIcon width={11} height={11} />
            </button>
          </div>
        ))}
      </div>
      <div className="add-goal">
        <input
          placeholder={canAdd ? 'add a new goal…' : 'create a goal area first…'}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addGoal()}
          disabled={!canAdd}
        />
        <button className="btn btn-primary" onClick={addGoal} disabled={!canAdd || !draft.trim() || busy}>
          <AddIcon width={12} height={12} /> Add
        </button>
      </div>
    </div>
  )
}
