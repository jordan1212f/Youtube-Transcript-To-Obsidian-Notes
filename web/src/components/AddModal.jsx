import { useState, useEffect, useRef } from 'react'
import { FileText } from 'lucide-react'
import { LinkIcon, UploadIcon, XIcon, ArrowIcon } from './Icons'

/* ============================================================
   AddModal — the entry point for getting content into Clarity.

   Three input modes, switched via tabs:
     • url    → POST /api/process       { url, goal_id }
     • upload → POST /api/process/upload (FormData: file + goal_id)  [.pdf only]
     • paste  → POST /api/process       { text, content_type:"paste", goal_id }

   Self-contained: owns its fetch calls, loading + error state, and goal
   picker. On success it calls onProcessed(result) with the API response and
   closes; on failure it shows the error inline.
   ============================================================ */

const MODES = [
  { id: 'url', label: 'From URL', Icon: LinkIcon },
  { id: 'upload', label: 'Upload file(s)', Icon: UploadIcon },
  { id: 'paste', label: 'Paste text', Icon: FileText },
]

function formatBytes(bytes) {
  if (!bytes) return ''
  const kb = bytes / 1024
  if (kb < 1024) return `${Math.round(kb)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

function isPdf(file) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

export default function AddModal({ isOpen, onClose, onProcessed, goals }) {
  const [mode, setMode] = useState('url')
  const [url, setUrl] = useState('')
  const [pasteText, setPasteText] = useState('')
  const [files, setFiles] = useState([])
  const [dragover, setDragover] = useState(false)
  const [goalId, setGoalId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fetchedGoals, setFetchedGoals] = useState(null)

  const fileInputRef = useRef(null)

  // Prefer goals passed in; otherwise fetch our own (self-contained).
  const goalList = goals && goals.length ? goals : fetchedGoals || []

  // Reset everything each time the modal opens, and lazily load goals.
  useEffect(() => {
    if (!isOpen) return
    setMode('url')
    setUrl('')
    setPasteText('')
    setFiles([])
    setGoalId(null)
    setError(null)
    setLoading(false)
    setDragover(false)

    if (!(goals && goals.length)) {
      let alive = true
      fetch('/api/goals')
        .then((r) => r.json())
        .then((d) => {
          if (alive) setFetchedGoals(Array.isArray(d) ? d : [])
        })
        .catch(() => {
          if (alive) setFetchedGoals([])
        })
      return () => {
        alive = false
      }
    }
  }, [isOpen, goals])

  if (!isOpen) return null

  function close() {
    if (loading) return // don't yank the modal out mid-request
    onClose?.()
  }

  function addFiles(fileList) {
    const incoming = Array.from(fileList || [])
    const pdfs = incoming.filter(isPdf)
    if (pdfs.length < incoming.length) {
      setError('Only .pdf files are supported.')
    }
    if (pdfs.length) {
      setFiles((prev) => [...prev, ...pdfs])
      setError((e) => (pdfs.length < incoming.length ? e : null))
    }
  }

  function removeFile(idx) {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  async function postJson(body) {
    const res = await fetch('/api/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      throw new Error(data?.detail || 'Something went wrong. Please try again.')
    }
    return data
  }

  async function postUpload(file) {
    const fd = new FormData()
    fd.append('file', file)
    if (goalId != null) fd.append('goal_id', String(goalId))
    const res = await fetch('/api/process/upload', { method: 'POST', body: fd })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      throw new Error(data?.detail || 'Upload failed. Please try again.')
    }
    return data
  }

  async function handleSubmit() {
    setError(null)

    if (mode === 'url' && !url.trim()) {
      setError('Please paste a URL to process.')
      return
    }
    if (mode === 'paste' && !pasteText.trim()) {
      setError('Please paste some text to process.')
      return
    }
    if (mode === 'upload' && !files.length) {
      setError('Please choose a .pdf file to upload.')
      return
    }

    setLoading(true)
    try {
      let result
      if (mode === 'url') {
        result = await postJson({ url: url.trim(), goal_id: goalId })
      } else if (mode === 'paste') {
        result = await postJson({ text: pasteText, content_type: 'paste', goal_id: goalId })
      } else {
        // Upload mode: the backend processes one file per request, so we run
        // them sequentially and hand the first result back to the caller.
        let first
        for (const file of files) {
          const r = await postUpload(file)
          if (!first) first = r
        }
        result = first
      }
      onProcessed?.(result)
      onClose?.()
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="scrim" onClick={close}>
      <div className="modal wide add-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>Add content</h2>
            <div className="add-sub">we'll summarise it &amp; suggest actions</div>
          </div>
          <button className="close" onClick={close} aria-label="Close">
            <XIcon width={14} height={14} />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="method-tabs">
          {MODES.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`method-tab ${mode === id ? 'active' : ''}`}
              onClick={() => {
                setMode(id)
                setError(null)
              }}
            >
              <Icon width={16} height={16} />
              {label}
            </button>
          ))}
        </div>

        {/* --- URL mode --- */}
        {mode === 'url' && (
          <>
            <div className="url-input">
              <LinkIcon width={14} height={14} style={{ color: 'var(--fg-3)' }} />
              <input
                placeholder="paste a youtube, twitter, or article url…"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                disabled={loading}
                autoFocus
              />
              <button onClick={handleSubmit} disabled={loading || !url.trim()}>
                {loading ? 'Processing…' : 'Process'}
                {!loading && <ArrowIcon width={13} height={13} />}
              </button>
            </div>
            <div className="add-hint">supported: youtube, x.com, or substack</div>
          </>
        )}

        {/* --- Upload mode --- */}
        {mode === 'upload' && (
          <>
            <div
              className={`dropzone ${dragover ? 'dragover' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setDragover(true)
              }}
              onDragLeave={() => setDragover(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragover(false)
                addFiles(e.dataTransfer.files)
              }}
            >
              <div className="icon">
                <UploadIcon width={18} height={18} />
              </div>
              <div className="t">Drop a PDF here</div>
              <div className="s">.pdf — or <span className="add-browse">browse files</span></div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple
              hidden
              onChange={(e) => {
                addFiles(e.target.files)
                e.target.value = '' // allow re-selecting the same file
              }}
            />

            {files.length > 0 && (
              <div className="add-filelist">
                {files.map((file, idx) => (
                  <div className="add-file" key={`${file.name}-${idx}`}>
                    <FileText width={14} height={14} style={{ color: 'var(--fg-3)' }} />
                    <span className="name">{file.name}</span>
                    <span className="size">{formatBytes(file.size)}</span>
                    <button
                      className="rm"
                      onClick={() => removeFile(idx)}
                      disabled={loading}
                      aria-label={`Remove ${file.name}`}
                    >
                      <XIcon width={12} height={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="add-actions">
              <button className="btn btn-accent" onClick={handleSubmit} disabled={loading || !files.length}>
                {loading ? 'Processing…' : 'Process'}
                {!loading && <ArrowIcon width={13} height={13} />}
              </button>
            </div>
          </>
        )}

        {/* --- Paste mode --- */}
        {mode === 'paste' && (
          <>
            <textarea
              className="add-textarea"
              placeholder="paste anything — an essay, a tweet thread, a transcript…"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <div className="add-actions">
              <button className="btn btn-accent" onClick={handleSubmit} disabled={loading || !pasteText.trim()}>
                {loading ? 'Processing…' : 'Process'}
                {!loading && <ArrowIcon width={13} height={13} />}
              </button>
            </div>
          </>
        )}

        {loading && (
          <div className="add-loading">
            <span className="add-spinner" />
            Processing — summarising &amp; matching to your goals…
          </div>
        )}

        {error && !loading && <div className="add-error">{error}</div>}

        {/* Goal picker */}
        <div className="add-goalbar">
          <span className="eyebrow">link to goal →</span>
          {goalList.map((goal) => (
            <button
              key={goal.id}
              className={`pill pill-sm ${goalId === goal.id ? 'active' : ''}`}
              onClick={() => setGoalId(goalId === goal.id ? null : goal.id)}
              disabled={loading}
            >
              <span className="dot" style={{ background: goal.area_color || 'var(--fg-4)' }} />
              {goal.title}
            </button>
          ))}
          <span style={{ flex: 1 }} />
          <button className="btn btn-ghost" onClick={close} disabled={loading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
