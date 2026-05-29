/* Inline SVG icons — small, monoline 1.5px stroke */

const _icoProps = {
  width: 16, height: 16, viewBox: '0 0 24 24',
  fill: 'none', stroke: 'currentColor', strokeWidth: 1.6,
  strokeLinecap: 'round', strokeLinejoin: 'round',
};

const Ico = {
  home: (p) => <svg {..._icoProps} {...p}><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/></svg>,
  ask: (p) => <svg {..._icoProps} {...p}><path d="M21 12a9 9 0 1 0-3.5 7.1L21 21l-1.5-3.5A8.96 8.96 0 0 0 21 12Z"/><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-.9.7-1.5 1.2-1.5 2.5"/><circle cx="12" cy="17" r="0.8" fill="currentColor"/></svg>,
  library: (p) => <svg {..._icoProps} {...p}><rect x="3" y="4" width="4" height="16" rx="1"/><rect x="9" y="4" width="4" height="16" rx="1"/><path d="m16 5 4 14"/></svg>,
  tasks: (p) => <svg {..._icoProps} {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m8 11 2 2 4-4"/><path d="M14 16h4"/></svg>,
  progress: (p) => <svg {..._icoProps} {...p}><path d="M3 17V8M9 17v-6M15 17v-9M21 17V5"/></svg>,
  goal: (p) => <svg {..._icoProps} {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/></svg>,
  homework: (p) => <svg {..._icoProps} {...p}><path d="M4 5h16v14H4z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>,
  folder: (p) => <svg {..._icoProps} {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/></svg>,
  add: (p) => <svg {..._icoProps} {...p}><path d="M12 5v14M5 12h14"/></svg>,
  search: (p) => <svg {..._icoProps} {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  filter: (p) => <svg {..._icoProps} {...p}><path d="M3 5h18M6 12h12M10 19h4"/></svg>,
  arrow: (p) => <svg {..._icoProps} {...p}><path d="M5 12h14m-5-5 5 5-5 5"/></svg>,
  arrowLeft: (p) => <svg {..._icoProps} {...p}><path d="M19 12H5m5 5-5-5 5-5"/></svg>,
  play: (p) => <svg {..._icoProps} {...p} fill="currentColor" stroke="none"><path d="M8 5v14l12-7z"/></svg>,
  pdf: (p) => <svg {..._icoProps} {...p}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></svg>,
  link: (p) => <svg {..._icoProps} {...p}><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/></svg>,
  twitter: (p) => <svg {..._icoProps} {...p}><path d="M4 4 20 20M20 4 4 20" /></svg>,
  external: (p) => <svg {..._icoProps} {...p}><path d="M14 5h5v5"/><path d="m19 5-9 9"/><path d="M19 13v6H5V5h6"/></svg>,
  check: (p) => <svg {..._icoProps} {...p} stroke="currentColor" strokeWidth="2"><path d="m5 12 5 5 9-11"/></svg>,
  x: (p) => <svg {..._icoProps} {...p}><path d="M6 6l12 12M18 6 6 18"/></svg>,
  upload: (p) => <svg {..._icoProps} {...p}><path d="M12 16V4m-5 5 5-5 5 5"/><path d="M4 20h16"/></svg>,
  url: (p) => <svg {..._icoProps} {...p}><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/></svg>,
  paste: (p) => <svg {..._icoProps} {...p}><rect x="6" y="4" width="12" height="16" rx="2"/><path d="M9 4h6v3H9z"/></svg>,
  settings: (p) => <svg {..._icoProps} {...p}><circle cx="12" cy="12" r="3"/><path d="M19 12c0 .6-.1 1.1-.2 1.6l1.7 1.4-2 3.5-2.1-.8c-.8.6-1.7 1-2.7 1.3l-.4 2.2h-4l-.4-2.2c-1-.3-1.9-.7-2.7-1.3l-2.1.8-2-3.5L4.2 13.6c-.1-.5-.2-1-.2-1.6s.1-1.1.2-1.6L2.5 9l2-3.5 2.1.8c.8-.6 1.7-1 2.7-1.3l.4-2.2h4l.4 2.2c1 .3 1.9.7 2.7 1.3l2.1-.8 2 3.5-1.7 1.4c.1.5.2 1 .2 1.6Z"/></svg>,
  sun: (p) => <svg {..._icoProps} {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/></svg>,
  trash: (p) => <svg {..._icoProps} {...p}><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/></svg>,
  flame: (p) => <svg {..._icoProps} {...p}><path d="M12 3c2 4 5 5 5 9a5 5 0 1 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-8Z"/></svg>,
  more: (p) => <svg {..._icoProps} {...p}><circle cx="12" cy="6" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="18" r="1.2" fill="currentColor"/></svg>,
  chevDown: (p) => <svg {..._icoProps} {...p}><path d="m6 9 6 6 6-6"/></svg>,
};

window.Ico = Ico;
