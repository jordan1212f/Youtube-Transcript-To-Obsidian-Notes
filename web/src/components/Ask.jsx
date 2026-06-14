import { useState, useRef, useEffect } from 'react'

/* ============================================================
   Ask — chat UI over the saved library. Each question hits
   POST /api/search with { query, synthesise: true } and renders
   the synthesised answer plus its source citations.
   ============================================================ */

const SUGGESTIONS = [
  'summarise what I saved this week',
  'what should I do first from my saves?',
  'find me 3 things to read on building habits',
]

export default function Ask() {
  const [messages, setMessages] = useState([]) // { role, text, sources?, error? }
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  // Keep the thread pinned to the latest message / typing indicator.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, busy])

  // Suggestion pills populate the input rather than sending immediately.
  function useSuggestion(text) {
    setInput(text)
    inputRef.current?.focus()
  }

  async function send(e) {
    e?.preventDefault()
    const q = input.trim()
    if (!q || busy) return

    setInput('')
    setMessages((m) => [...m, { role: 'user', text: q }])
    setBusy(true)

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, synthesise: true }),
      })
      const data = await res.json()

      let reply
      if (data.synthesis && data.synthesis.answer) {
        reply = { role: 'assistant', text: data.synthesis.answer, sources: data.synthesis.sources || [] }
      } else if (data.message) {
        // e.g. nothing embedded yet
        reply = { role: 'assistant', text: data.message }
      } else if (Array.isArray(data.results) && data.results.length === 0) {
        reply = { role: 'assistant', text: "I couldn't find anything in your library for that." }
      } else {
        reply = { role: 'assistant', text: "I couldn't synthesise an answer for that." }
      }
      setMessages((m) => [...m, reply])
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: 'Something broke on my end. Try again in a moment.', error: true },
      ])
    } finally {
      setBusy(false)
    }
  }

  const empty = messages.length === 0

  return (
    <div className="ask-screen">
      <div className="ask-scroll" ref={scrollRef}>
        <div className="ask-thread">
          {empty && (
            <div className="ask-empty">
              <div className="eyebrow">/ ask</div>
              <p className="ask-empty-h">What do you want to know about your library?</p>
            </div>
          )}

          {messages.map((m, i) =>
            m.role === 'user' ? (
              <div key={i} className="msg msg-user">
                <div className="msg-bubble">{m.text}</div>
              </div>
            ) : (
              <div key={i} className="msg msg-assistant">
                <div className="msg-avatar">
                  <span className="dot" style={{ background: 'var(--accent-bright)' }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className={`msg-bubble ${m.error ? 'is-error' : ''}`}>{m.text}</div>
                  {m.sources && m.sources.length > 0 && <Sources items={m.sources} />}
                </div>
              </div>
            ),
          )}

          {busy && (
            <div className="msg msg-assistant">
              <div className="msg-avatar">
                <span className="dot" style={{ background: 'var(--accent-bright)' }} />
              </div>
              <div className="msg-bubble">
                <span className="typing">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="ask-composer">
        <form className="ask-input-wrap" onSubmit={send}>
          <input
            ref={inputRef}
            className="ask-input"
            placeholder="Ask anything about your saved library…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
            disabled={busy}
          />
          <button type="submit" className="ask-send" disabled={!input.trim() || busy} aria-label="Send">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
              <path
                d="M8 13V3M8 3l-4 4M8 3l4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>

        {empty && (
          <div className="ask-suggestions" style={{ marginTop: 12, marginBottom: 0 }}>
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" className="pill" onClick={() => useSuggestion(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* Source citations under an assistant answer. */
function Sources({ items }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 8,
        paddingLeft: 2,
      }}
    >
      {items.map((title, i) => (
        <span key={i} className="tag" title={title}>
          <span className="dot" style={{ background: 'var(--accent-bright)' }} />
          {title}
        </span>
      ))}
    </div>
  )
}
