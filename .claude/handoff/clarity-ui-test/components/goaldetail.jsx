/* Goal journal — Bear-style free-form writing page with a full formatting toolbar */

/* ---------- light markdown helpers ---------- */
function countOcc(s, sub) { let n = 0, i = 0; while ((i = s.indexOf(sub, i)) >= 0) { n++; i += sub.length; } return n; }

// Which format controls are "active" given the textarea value + caret/selection.
function activeFormats(value, caret) {
  const set = new Set();
  if (value == null || !caret) return set;
  const start = caret.start;
  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  let lineEnd = value.indexOf('\n', start); if (lineEnd === -1) lineEnd = value.length;
  const line = value.slice(lineStart, lineEnd);
  const toCol = value.slice(lineStart, start);

  if (countOcc(toCol, '**') % 2 === 1) set.add('bold');
  const singleStars = countOcc(toCol, '*') - 2 * countOcc(toCol, '**');
  if (((singleStars % 2) + 2) % 2 === 1) set.add('italic');
  if (countOcc(toCol, '__') % 2 === 1) set.add('underline');
  if (countOcc(toCol, '~~') % 2 === 1) set.add('strike');
  if (countOcc(toCol, '==') % 2 === 1) set.add('highlight');

  if (/^###\s/.test(line)) set.add('subheading');
  else if (/^##\s/.test(line)) set.add('heading');
  else if (/^#\s/.test(line)) set.add('title');
  if (/^-\s\[[ xX]\]\s/.test(line)) set.add('check');
  else if (/^-\s/.test(line)) set.add('bullet');
  else if (/^\d+\.\s/.test(line)) set.add('number');
  return set;
}

function grow(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

const INLINE_MARK = { bold: '**', italic: '*', underline: '__', strike: '~~', highlight: '==' };
const BLOCK_PREFIX = { title: '# ', heading: '## ', subheading: '### ', body: '', bullet: '- ', number: '1. ', check: '- [ ] ' };
const BLOCK_STRIP = /^(#{1,3}\s|-\s\[[ xX]\]\s|-\s|\d+\.\s)/;

function applyFormat(el, value, setValue, setCaret, token) {
  if (!el) return;
  const s = el.selectionStart, e = el.selectionEnd;
  const place = (ns, ne) => requestAnimationFrame(() => {
    el.focus();
    try { el.setSelectionRange(ns, ne); } catch (_) {}
    setCaret && setCaret({ start: ns, end: ne });
    grow(el);
  });

  if (token === 'link') {
    const sel = value.slice(s, e) || 'link';
    const ins = `[${sel}](url)`;
    setValue(value.slice(0, s) + ins + value.slice(e));
    const urlStart = s + sel.length + 3;
    place(urlStart, urlStart + 3);
    return;
  }

  if (INLINE_MARK[token]) {
    const m = INLINE_MARK[token];
    const sel = value.slice(s, e);
    const outside = value.slice(s - m.length, s) === m && value.slice(e, e + m.length) === m;
    const inside = sel.length >= 2 * m.length && sel.startsWith(m) && sel.endsWith(m);
    let next, ns, ne;
    if (outside) { next = value.slice(0, s - m.length) + sel + value.slice(e + m.length); ns = s - m.length; ne = e - m.length; }
    else if (inside) { const inner = sel.slice(m.length, sel.length - m.length); next = value.slice(0, s) + inner + value.slice(e); ns = s; ne = s + inner.length; }
    else { next = value.slice(0, s) + m + sel + m + value.slice(e); ns = s + m.length; ne = ns + sel.length; }
    setValue(next);
    place(ns, ne);
    return;
  }

  // block-level (operate on the line/lines spanning the selection)
  const prefix = BLOCK_PREFIX[token];
  const lineStart = value.lastIndexOf('\n', s - 1) + 1;
  let lineEnd = value.indexOf('\n', e); if (lineEnd === -1) lineEnd = value.length;
  const block = value.slice(lineStart, lineEnd);
  const lines = block.split('\n');
  const newLines = lines.map((ln, ix) => {
    const cur = (ln.match(BLOCK_STRIP) || [''])[0];
    const stripped = ln.replace(BLOCK_STRIP, '');
    if (token === 'body') return stripped;
    if (token === 'number') return (ix + 1) + '. ' + stripped;
    if (cur === prefix) return stripped; // toggle off
    return prefix + stripped;
  });
  const nextBlock = newLines.join('\n');
  setValue(value.slice(0, lineStart) + nextBlock + value.slice(lineEnd));
  const np = Math.max(lineStart, e + (nextBlock.length - block.length));
  place(np, np);
}

/* ---------- the page ---------- */
function GoalDetail({ goalId, back, goToGoal, openDetail }) {
  const goal = GOALS.find(g => g.id === goalId) || GOALS[0];

  const [entries, setEntries] = React.useState(() => buildGoalJournal(goal));
  const [draft, setDraft] = React.useState('');
  const [composing, setComposing] = React.useState(false);
  const [composeCaret, setComposeCaret] = React.useState(null);
  const [editingId, setEditingId] = React.useState(null);
  const [editText, setEditText] = React.useState('');
  const [editCaret, setEditCaret] = React.useState(null);
  const composeRef = React.useRef(null);
  const editRef = React.useRef(null);

  React.useEffect(() => {
    setEntries(buildGoalJournal(goal));
    setDraft(''); setComposing(false); setEditingId(null);
  }, [goal.id]);

  function startCompose() {
    setComposing(true);
    requestAnimationFrame(() => composeRef.current && composeRef.current.focus());
  }
  function commitDraft() {
    const t = draft.trim();
    if (t) setEntries(es => [...es, { id: 'u' + Date.now(), ts: Date.now(), text: t }]);
    setDraft(''); setComposing(false);
  }
  function startEdit(entry) {
    setEditingId(entry.id); setEditText(entry.text); setEditCaret(null);
  }
  function saveEdit(id) {
    const t = editText.trim();
    setEntries(es => t ? es.map(e => e.id === id ? { ...e, text: t } : e) : es.filter(e => e.id !== id));
    setEditingId(null); setEditText('');
  }

  const captureCaret = (setter) => (ev) => setter({ start: ev.target.selectionStart, end: ev.target.selectionEnd });

  const count = entries.length;
  const last = count ? entries[count - 1].ts : null;
  const lastLabel = last ? goalAgoLabel((Date.now() - last) / 1000) : null;

  return (
    <div className="main-inner gj-page" data-screen-label={`goal · ${goal.name}`}>
      <button className="detail-back" onClick={back}>
        <Ico.arrowLeft width={12} height={12} /> back to focus
      </button>

      <header className="gj-header">
        <div className="gj-title-row">
          <span className="gj-dot" style={{ background: goal.color }}></span>
          <h1 className="gj-title">{goal.name}</h1>
        </div>
        <div className="gj-meta mono">
          {count > 0
            ? <span>{count} {count === 1 ? 'entry' : 'entries'} · last written {lastLabel}</span>
            : <span>no entries yet</span>}
        </div>
      </header>

      <div className="gj-sheet">
        {count === 0 && !composing && (
          <button className="gj-empty" onClick={startCompose}>
            <span className="gj-empty-head">Start your first entry.</span>
            <span className="gj-empty-sub">What did you try? How did it go?</span>
          </button>
        )}

        {entries.map((e) => (
          <article className="gj-entry" key={e.id}>
            <div className="gj-datestamp mono">
              <span>{journalDateLabel(e.ts)}</span>
              {editingId !== e.id && (
                <span className="gj-entry-tools">
                  <button className="gj-tool" onClick={() => startEdit(e)}>edit</button>
                  <button className="gj-tool" onClick={() => setEntries(es => es.filter(x => x.id !== e.id))}>delete</button>
                </span>
              )}
            </div>

            {editingId === e.id ? (
              <div className="gj-compose">
                <textarea
                  className="gj-write"
                  value={editText}
                  autoFocus
                  ref={(el) => { editRef.current = el; grow(el); }}
                  onChange={(ev) => { setEditText(ev.target.value); grow(ev.target); }}
                  onSelect={captureCaret(setEditCaret)}
                  onClick={captureCaret(setEditCaret)}
                  onKeyUp={captureCaret(setEditCaret)}
                  onKeyDown={(ev) => { if ((ev.metaKey || ev.ctrlKey) && ev.key === 'Enter') saveEdit(e.id); }}
                />
                <JournalToolbar
                  value={editText} caret={editCaret}
                  onFormat={(tok) => applyFormat(editRef.current, editText, setEditText, setEditCaret, tok)}
                  onDone={() => saveEdit(e.id)} doneLabel="Save"
                />
              </div>
            ) : (
              <JournalProse text={e.text} />
            )}
          </article>
        ))}

        {composing ? (
          <article className="gj-entry gj-entry-new">
            <div className="gj-datestamp mono"><span>{journalDateLabel(Date.now())}</span></div>
            <div className="gj-compose">
              <textarea
                ref={composeRef}
                className="gj-write"
                placeholder="What did you try? How did it go?"
                value={draft}
                rows={1}
                onChange={(e) => { setDraft(e.target.value); grow(e.target); }}
                onSelect={captureCaret(setComposeCaret)}
                onClick={captureCaret(setComposeCaret)}
                onKeyUp={captureCaret(setComposeCaret)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') commitDraft();
                  if (e.key === 'Escape' && !draft.trim()) setComposing(false);
                }}
              />
              <JournalToolbar
                value={draft} caret={composeCaret}
                onFormat={(tok) => applyFormat(composeRef.current, draft, setDraft, setComposeCaret, tok)}
                onDone={commitDraft} doneLabel="Done"
              />
            </div>
          </article>
        ) : count > 0 && (
          <button className="gj-newentry" onClick={startCompose}>
            <Ico.plus width={13} height={13} /> New entry
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- render written notes ---------- */
function JournalProse({ text }) {
  const lines = (text || '').split('\n');
  const out = []; let i = 0, k = 0;
  const classify = (l) => {
    let m;
    if (/^###\s/.test(l)) return ['h3', l.replace(/^###\s+/, '')];
    if (/^##\s/.test(l)) return ['h2', l.replace(/^##\s+/, '')];
    if (/^#\s/.test(l)) return ['h1', l.replace(/^#\s+/, '')];
    if ((m = l.match(/^-\s\[( |x|X)\]\s?(.*)$/))) return ['check', m[2], m[1].toLowerCase() === 'x'];
    if ((m = l.match(/^-\s+(.*)$/))) return ['bullet', m[1]];
    if ((m = l.match(/^\d+\.\s+(.*)$/))) return ['number', m[1]];
    if (l.trim() === '') return ['blank', ''];
    return ['para', l];
  };
  while (i < lines.length) {
    const c = classify(lines[i]);
    const type = c[0];
    if (type === 'blank') { i++; continue; }
    if (type === 'h1') { out.push(<h2 className="gj-h1" key={k++}>{inlineFmt(c[1])}</h2>); i++; continue; }
    if (type === 'h2') { out.push(<h3 className="gj-h2" key={k++}>{inlineFmt(c[1])}</h3>); i++; continue; }
    if (type === 'h3') { out.push(<h4 className="gj-h3" key={k++}>{inlineFmt(c[1])}</h4>); i++; continue; }
    if (type === 'check') {
      const items = []; while (i < lines.length) { const cc = classify(lines[i]); if (cc[0] !== 'check') break; items.push(cc); i++; }
      out.push(<ul className="gj-list" key={k++}>{items.map((it, ix) => (
        <li className={`gj-check ${it[2] ? 'is-done' : ''}`} key={ix}>
          <span className="gj-check-box">{it[2] && <Ico.check width={10} height={10} />}</span>
          <span className="gj-check-label">{inlineFmt(it[1])}</span>
        </li>
      ))}</ul>); continue;
    }
    if (type === 'bullet') {
      const items = []; while (i < lines.length) { const cc = classify(lines[i]); if (cc[0] !== 'bullet') break; items.push(cc[1]); i++; }
      out.push(<ul className="gj-list" key={k++}>{items.map((t, ix) => <li className="gj-bullet" key={ix}>{inlineFmt(t)}</li>)}</ul>); continue;
    }
    if (type === 'number') {
      const items = []; while (i < lines.length) { const cc = classify(lines[i]); if (cc[0] !== 'number') break; items.push(cc[1]); i++; }
      out.push(<ol className="gj-ol" key={k++}>{items.map((t, ix) => <li key={ix}>{inlineFmt(t)}</li>)}</ol>); continue;
    }
    out.push(<p className="gj-para" key={k++}>{inlineFmt(c[1])}</p>); i++;
  }
  return <div className="gj-prose">{out}</div>;
}

// Inline: **bold** *italic* __underline__ ~~strike~~ ==highlight== [text](url)
function inlineFmt(s) {
  const re = /(\*\*[^*]+\*\*)|(==[^=]+==)|(~~[^~]+~~)|(__[^_]+__)|(\*[^*\n]+\*)|(\[[^\]]+\]\([^)]+\))/g;
  const out = []; let last = 0, m, k = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(<React.Fragment key={k++}>{s.slice(last, m.index)}</React.Fragment>);
    const t = m[0];
    if (t.startsWith('**')) out.push(<strong key={k++}>{t.slice(2, -2)}</strong>);
    else if (t.startsWith('==')) out.push(<mark className="gj-mark" key={k++}>{t.slice(2, -2)}</mark>);
    else if (t.startsWith('~~')) out.push(<s key={k++}>{t.slice(2, -2)}</s>);
    else if (t.startsWith('__')) out.push(<u key={k++}>{t.slice(2, -2)}</u>);
    else if (t.startsWith('[')) { const lm = t.match(/^\[([^\]]+)\]\(([^)]+)\)$/); out.push(<a className="gj-link" href={lm[2]} key={k++} onClick={(e) => e.preventDefault()}>{lm[1]}</a>); }
    else out.push(<em key={k++}>{t.slice(1, -1)}</em>);
    last = m.index + t.length;
  }
  if (last < s.length) out.push(<React.Fragment key={k++}>{s.slice(last)}</React.Fragment>);
  return out;
}

/* ---------- the formatting toolbar ---------- */
function FmtBtn({ icon: Icon, label, active, onApply }) {
  return (
    <button
      className={`gj-fmt-btn ${active ? 'is-active' : ''}`}
      title={label} aria-label={label} aria-pressed={!!active}
      onMouseDown={(e) => { e.preventDefault(); onApply(); }}
    >
      <Icon width={17} height={17} />
    </button>
  );
}

const STRUCTURE = [['title', 'Title'], ['heading', 'Heading'], ['subheading', 'Subheading'], ['body', 'Body']];

function JournalToolbar({ value, caret, onFormat, onDone, doneLabel }) {
  const [structOpen, setStructOpen] = React.useState(false);
  const active = React.useMemo(() => activeFormats(value, caret), [value, caret]);
  const structLabel = active.has('title') ? 'Title' : active.has('heading') ? 'Heading' : active.has('subheading') ? 'Subheading' : 'Body';

  return (
    <div className="gj-toolbar">
      <div className="gj-tb-scroll">
        <div className="gj-tb-struct">
          <button className="gj-struct-btn" onMouseDown={(e) => { e.preventDefault(); setStructOpen(o => !o); }}>
            <span className="gj-struct-label">{structLabel}</span>
            <Ico.chevDown width={12} height={12} />
          </button>
          {structOpen && (
            <div className="gj-struct-menu">
              {STRUCTURE.map(([tok, label]) => (
                <button key={tok}
                  className={`gj-struct-item gj-si-${tok} ${structLabel === label ? 'is-active' : ''}`}
                  onMouseDown={(e) => { e.preventDefault(); onFormat(tok); setStructOpen(false); }}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="gj-tb-div"></span>

        <div className="gj-tb-group">
          <FmtBtn icon={Ico.fmtBold} label="Bold" active={active.has('bold')} onApply={() => onFormat('bold')} />
          <FmtBtn icon={Ico.fmtItalic} label="Italic" active={active.has('italic')} onApply={() => onFormat('italic')} />
          <FmtBtn icon={Ico.fmtUnderline} label="Underline" active={active.has('underline')} onApply={() => onFormat('underline')} />
          <FmtBtn icon={Ico.fmtStrike} label="Strikethrough" active={active.has('strike')} onApply={() => onFormat('strike')} />
          <FmtBtn icon={Ico.fmtHighlight} label="Highlight" active={active.has('highlight')} onApply={() => onFormat('highlight')} />
        </div>

        <span className="gj-tb-div"></span>

        <div className="gj-tb-group">
          <FmtBtn icon={Ico.fmtBullet} label="Bulleted list" active={active.has('bullet')} onApply={() => onFormat('bullet')} />
          <FmtBtn icon={Ico.fmtCheck} label="Checklist" active={active.has('check')} onApply={() => onFormat('check')} />
          <FmtBtn icon={Ico.fmtNumber} label="Numbered list" active={active.has('number')} onApply={() => onFormat('number')} />
        </div>

        <span className="gj-tb-div"></span>

        <div className="gj-tb-group">
          <FmtBtn icon={Ico.link} label="Link" onApply={() => onFormat('link')} />
        </div>
      </div>

      <div className="gj-compose-foot">
        <span className="gj-hint mono">⌘↵</span>
        <button className="btn btn-accent gj-done" onMouseDown={(e) => e.preventDefault()} onClick={onDone}>{doneLabel}</button>
      </div>
    </div>
  );
}

window.GoalDetail = GoalDetail;
