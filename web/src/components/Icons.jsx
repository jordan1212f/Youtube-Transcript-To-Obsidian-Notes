const icoProps = {
  width: 16, height: 16, viewBox: '0 0 24 24',
  fill: 'none', stroke: 'currentColor', strokeWidth: 1.6,
  strokeLinecap: 'round', strokeLinejoin: 'round',
};

export const GoalIcon = (p) => <svg {...icoProps} {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/></svg>;

export const AskIcon = (p) => <svg {...icoProps} {...p}><path d="M21 12a9 9 0 1 0-3.5 7.1L21 21l-1.5-3.5A8.96 8.96 0 0 0 21 12Z"/><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-.9.7-1.5 1.2-1.5 2.5"/><circle cx="12" cy="17" r="0.8" fill="currentColor"/></svg>;

export const LibraryIcon = (p) => <svg {...icoProps} {...p}><rect x="3" y="4" width="4" height="16" rx="1"/><rect x="9" y="4" width="4" height="16" rx="1"/><path d="m16 5 4 14"/></svg>;

export const SettingsIcon = (p) => <svg {...icoProps} {...p}><circle cx="12" cy="12" r="3"/><path d="M19 12c0 .6-.1 1.1-.2 1.6l1.7 1.4-2 3.5-2.1-.8c-.8.6-1.7 1-2.7 1.3l-.4 2.2h-4l-.4-2.2c-1-.3-1.9-.7-2.7-1.3l-2.1.8-2-3.5L4.2 13.6c-.1-.5-.2-1-.2-1.6s.1-1.1.2-1.6L2.5 9l2-3.5 2.1.8c.8-.6 1.7-1 2.7-1.3l.4-2.2h4l.4 2.2c1 .3 1.9.7 2.7 1.3l2.1-.8 2 3.5-1.7 1.4c.1.5.2 1 .2 1.6Z"/></svg>;

export const AddIcon = (p) => <svg {...icoProps} {...p}><path d="M12 5v14M5 12h14"/></svg>;

export const SearchIcon = (p) => <svg {...icoProps} {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;

export const ArrowIcon = (p) => <svg {...icoProps} {...p}><path d="M5 12h14m-5-5 5 5-5 5"/></svg>;

export const CheckIcon = (p) => <svg {...icoProps} {...p} strokeWidth="2"><path d="m5 12 5 5 9-11"/></svg>;

export const PlayIcon = (p) => <svg {...icoProps} {...p} fill="currentColor" stroke="none"><path d="M8 5v14l12-7z"/></svg>;

export const XIcon = (p) => <svg {...icoProps} {...p}><path d="M6 6l12 12M18 6 6 18"/></svg>;

export const TrashIcon = (p) => <svg {...icoProps} {...p}><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/></svg>;

export const UploadIcon = (p) => <svg {...icoProps} {...p}><path d="M12 16V4m-5 5 5-5 5 5"/><path d="M4 20h16"/></svg>;

export const ExternalIcon = (p) => <svg {...icoProps} {...p}><path d="M14 5h5v5"/><path d="m19 5-9 9"/><path d="M19 13v6H5V5h6"/></svg>;