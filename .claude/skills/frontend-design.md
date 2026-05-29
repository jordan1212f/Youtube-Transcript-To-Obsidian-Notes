Obsiditube (Clarity) — Frontend Design System
This file is the single source of truth for all frontend code generation. Read it completely before writing any React component, CSS, or HTML. Every design decision below is final — do not deviate, improvise, or "improve" unless the user explicitly asks.


1. Design Philosophy
Aesthetic: Quiet flex. Dark, editorial productivity tool. Feels like a premium instrument, not a SaaS dashboard. Think Linear meets a well-designed reading app — not Notion, not a template.

Anti-slop rules (NEVER do these):

Never use Inter, Roboto, Arial, or system-ui as a visible font choice
Never use purple gradients, purple accents, or purple anything
Never use symmetric 3-column hero layouts
Never use generic card-border-shadow patterns (e.g. box-shadow: 0 2px 8px rgba(0,0,0,0.1))
Never use default Tailwind component aesthetics (rounded-lg bg-white shadow-md)
Never use emojis in the UI (icons only, from Lucide)
Never use gradients as backgrounds for cards or panels (except the Focus Card phase gradient, which is specifically defined below)
Never centre-align body text
Never use font-weight: 700 or 800 on body text — max is 500 for headings, 600 for Geist Mono in small labels

Animation: Minimal. Subtle hovers (150ms), smooth transitions, entry animations for cards (translateY + opacity). One easing curve everywhere: cubic-bezier(0.2, 0.7, 0.2, 1). No bouncing, no springs, no parallax, no scroll-triggered animations.


2. Design Tokens (CSS Custom Properties)
Paste these into the :root of the global stylesheet. All components reference these — never hardcode colours.
Surfaces (dark theme — default)
--bg: #0a0b0d;

--bg-2: #0e0f12;

--panel: #121316;

--panel-2: #16181c;

--panel-3: #1c1f24;

--hairline: rgba(255, 255, 255, 0.06);

--hairline-2: rgba(255, 255, 255, 0.10);

--hairline-hover: rgba(255, 255, 255, 0.16);
Surfaces (light theme — applied via [data-theme="light"])
--bg: #f6f6f4;

--bg-2: #efeeea;

--panel: #ffffff;

--panel-2: #f5f4f1;

--panel-3: #ebeae5;

--hairline: rgba(0, 0, 0, 0.07);

--hairline-2: rgba(0, 0, 0, 0.12);

--hairline-hover: rgba(0, 0, 0, 0.20);
Text hierarchy
--fg: #ededed;       /* primary text */

--fg-2: #c9ccd1;     /* secondary text, body prose */

--fg-3: #8a8e95;     /* tertiary, descriptions, placeholders */

--fg-4: #5a5e65;     /* muted labels, timestamps */

--fg-5: #3a3d43;     /* separators, disabled text */

Light theme overrides: --fg: #16181c; --fg-2: #2a2d33; --fg-3: #6a6e75; --fg-4: #9a9da3; --fg-5: #c4c7cc;
Accent system (switchable — teal is default)
--accent: #4A9B8E;

--accent-bright: #6FE8CC;

--accent-rgb: 74, 155, 142;

--accent-bright-rgb: 111, 232, 204;

--accent-soft: rgba(var(--accent-rgb), 0.14);

--accent-ring: rgba(var(--accent-bright-rgb), 0.35);

All six accent presets (applied via JS, switching CSS vars):

teal:    accent=#4A9B8E  bright=#6FE8CC

sage:    accent=#7BAE7E  bright=#A8E0AC

amber:   accent=#C99B5C  bright=#E5B86F

indigo:  accent=#5879B9  bright=#9CB7E8

rose:    accent=#C9788C  bright=#F2A8BD

mauve:   accent=#A68FBE  bright=#D4B8E8
Category colours (for goal dots)
--cat-tech: #5BA3D0;

--cat-ai: #6FE8CC;

--cat-lifestyle: #E5B86F;

--cat-career: #4A9B8E;

--cat-other: #8a8e95;
Other tokens
--danger: #ff5a5f;

--danger-soft: rgba(255, 90, 95, 0.12);

--radius-sm: 6px;

--radius: 10px;

--radius-lg: 14px;

--radius-pill: 999px;

--sidebar-w: 240px;

--ease: cubic-bezier(0.2, 0.7, 0.2, 1);


3. Typography
Font stacks
Default (Modern fontset):

Body & headings: "Geist", ui-sans-serif, system-ui, sans-serif
Mono (metadata, eyebrows, tags, timestamps, code): "Geist Mono", ui-monospace, monospace

Editorial fontset ([data-fontset="editorial"]):

Display headings swap to "Instrument Serif", "Geist", serif at font-weight: 400
Section headings (h2) get font-style: italic
Body and mono stay the same

Soft fontset ([data-fontset="soft"]):

Body swaps to "DM Sans", "Geist", ui-sans-serif, system-ui, sans-serif
Display headings swap to "DM Serif Display", "Geist", serif at font-weight: 400
Border radii increase to 18px on cards, panels, modals
Font sizing rules
Element
Font
Size
Weight
Letter-spacing
Colour
Page title (greeting)
Geist
26px
500
-0.01em
--fg
Focus Card title
Geist
38px
500
-0.018em
--fg
Article/detail title
Geist Mono
34px
600
-0.005em
--fg
Section heading (h2)
Geist
22px
500
-0.01em
--fg
Modal heading
Geist
22px
500
-0.01em
--fg
Card title
Geist
14.5px
500
-0.005em
--fg
Body text
Geist
14px–14.5px
400
-0.005em
--fg-2
Card summary
Geist
12.5px
400
0
--fg-3
Eyebrow label
Geist Mono
10.5px
400
0.12em
--fg-4, uppercase
Tag
Geist Mono
10.5px
400
0.04em
--fg-2, lowercase
Timestamp / meta
Geist Mono
10.5px
400
0.04em
--fg-4
Sidebar item
Geist
13.5px
400
0
--fg-3 (active: --fg)
Button text
Geist
13px
400–500
0
varies
Keyboard shortcut
Geist Mono
10.5px
400
0
--fg-4

The .mono class
Apply font-family: "Geist Mono", monospace; font-feature-settings: "ss01" 1; letter-spacing: 0; — used on any element that should render in mono.
The .eyebrow class
font-family: "Geist Mono"; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--fg-4); — used for section labels like / focus, / recently saved, / ask.


4. Layout
App shell
.app {

  display: grid;

  grid-template-columns: var(--sidebar-w) 1fr;

  height: 100vh;

  width: 100vw;

  background: var(--bg);

}
Sidebar (240px)
Fixed left column, full height
Border-right: 1px solid var(--hairline)
Background: var(--bg)
Contains: Brand wordmark (top), nav section (Focus/Ask/Library), goals section (with coloured dots), user footer (avatar + settings)
Active nav item: background: var(--panel-2); border: 1px solid var(--hairline-2); color: var(--fg)
Nav item icon: 16×16, opacity 0.9
Goal dots: 8×8 circle with category colour
Main content area
.main-inner {

  max-width: 1180px;

  margin: 0 auto;

  padding: 36px 48px 80px;

}

For article/detail views, content narrows to max-width: 760px. For the Ask screen, content is max-width: 760px with padding: 0 32px.


5. Component Patterns
Cards (Library grid)
- Grid: repeat(auto-fill, minmax(310px, 1fr)), gap 16px

- Background: var(--panel)

- Border: 1px solid var(--hairline)

- Border-radius: var(--radius-lg) (14px)

- Padding: 14px

- Hover: border-color var(--hairline-hover), background var(--panel-2)

- Entry animation: translateY(8px) + opacity 0 → 0, 500ms, staggered by 40ms per card (max 8)

- Contains: tag row (type + category dots), thumbnail (16:9, rounded 8px), title (2-line clamp), summary (3-line clamp), footer (source mono + arrow icon)
Pills
- Padding: 6px 12px

- Border-radius: 999px

- Border: 1px solid var(--hairline-2)

- Background: var(--panel)

- Font: 12.5px, --fg-2

- Active state: background var(--accent-soft), border rgba(accent-bright, 0.40), colour var(--accent-bright)
Tags
- Padding: 3px 9px 3px 8px

- Border-radius: 999px

- Background: var(--panel-2)

- Border: 1px solid var(--hairline)

- Font: Geist Mono, 10.5px, lowercase, letter-spacing 0.04em, --fg-2

- Contains a 6×6 coloured dot before the label
Buttons
.btn — base: padding 9px 16px, radius 999px, border 1px var(--hairline-2), bg var(--panel), 13px

.btn-primary — bg var(--fg), colour var(--bg), font-weight 500

.btn-accent — bg var(--accent), colour #0a1311, font-weight 500

.btn-ghost — bg transparent, border var(--hairline)
Search bar
- Padding: 12px 18px

- Border-radius: 999px

- Background: var(--panel)

- Border: 1px solid var(--hairline-2)

- Focus: border-color var(--accent-ring)

- Contains: search icon (Lucide), input, keyboard shortcut badge (⌘K)
Modals
- Scrim: fixed inset 0, background rgba(0,0,0,0.55), backdrop-filter blur(6px)

- Modal panel: width min(620px, 92vw), bg var(--panel), border 1px var(--hairline-2), radius var(--radius-lg), padding 24px

- Wide variant: min(760px, 94vw)

- Entry animation: translateY(12px) + scale(0.98) → 0, 260ms

- Header: flex between, h2 at 22px Geist weight 500, close button (30×30, radius 8px, X icon)


6. Focus Card (Hero Component)
The Focus Card is the most important component. It dominates the home screen.

- min-height: 40vh

- Padding: 26px 28px 24px

- Border-radius: 18px

- Border: 1px solid color-mix(in srgb, var(--phase-color) 28%, var(--hairline))

- Background: radial-gradient at top-left using phase-color at 8% opacity, plus linear-gradient mixing phase-color at 3.5% into panel

- Dot pattern overlay (::before) using phase-color at 30% opacity, masked to top-right corner

- Transition: border-color and background 400ms
Phase system
The card changes colour based on remaining time:

Green phase (>24h): --phase-color: #4ADE80

Amber phase (12-24h): --phase-color: #FBBF24

Red phase (<12h): --phase-color: #F87171

Phase colour drives: border tint, background gradient, progress bar fill, label text, pulse dot.
Rescue moment (amber/red phase)
When time drops below 24h, the "More time" button gets a pulsing glow animation and a rescue label appears: "running low — extend your window?" in the phase colour. This is a retention mechanic.
Contents (top to bottom)
Top row: phase label with pulsing dot + source metadata (mono)
Title: 38px Geist, weight 500
Description: 14.5px, --fg-3
Progress bar: 8px tall, 999px radius, track uses phase-color at 12% + panel-3, fill is phase-color
Countdown: Geist Mono, HH:MM:SS format with faint separators, "left in window" label
Action buttons: Done (accent on completion), Skip, More time (disabled after one use)
Chain dots: 7 dots for current week, representing daily streaks. Done = filled accent, Current = pulsing, Todo = empty with hairline border, Broken = dashed connector. Label: "this week"


7. Processing Overlay
Full-screen overlay shown when a URL is being processed. z-index 300.

- Background: var(--bg) with dot pattern overlay at 55% opacity

- Centred content card, max-width 540px

- Source card: video thumbnail (64px wide, 16:9) + title + domain in mono

- 4 staged steps, each a row with: numbered circle, label text, animated progress bar

- States: inactive (opacity 0.45), active (accent border/bg, animated bar), done (opacity 0.65, accent checkmark)

- After all stages: reveal animation — heading + subtitle + first action card sliding up (460ms ease)

Stage labels for YouTube: "Fetching transcript..." → "Reading content..." → "Matching to your goals..." → "Generating your first actions..."


8. Onboarding Flow
Full-screen overlay (z-index 200), centred content max-width 640px.
Steps:
Problem picker — "Which of these sounds like you?" with single-column tappable cards. Same styling as goal category cards but padding 14px 16px, font-size 15px, weight 400.
Goal category picker — 2-column grid of categories with checkmarks. Pick 2-3.
Goal typing — rows with category label + text input for specific goal.
Preview — shows a 60%-scaled version of their Focus screen with chosen goal names, inside a bordered frame with a "preview" badge.
First URL — paste input + processing animation (same as section 7).
Briefing time — "When should we send your daily briefing?" with 3 pill buttons (Morning 8am / Afternoon 1pm / Evening 7pm), same styling as briefing-pill class.
Shared onboarding styling:
Heading: 38px Geist, weight 500, letter-spacing -0.018em
Subheading: 12.5px, --fg-3, letter-spacing 0.04em
Step pips at top: 18×2px bars, active = accent-bright, inactive = hairline-2
Entry animation per step: translateY(6px) + opacity, 280ms
Footer: flex row with back button (btn-ghost) and next button (btn-primary)


9. Ask Screen (Chat UI)
Fills the full height of the main area.

- Chat thread: flex column, gap 14px, scrollable

- Empty state: "What do you want to know about your library?" at 28px Geist, weight 500

- Suggestion pills below input when thread is empty

- User bubbles: right-aligned, accent-soft bg, accent-bright border at 22% opacity, bottom-right radius 4px

- Assistant bubbles: left-aligned, panel bg, hairline border, top-left radius 4px, with a 22px avatar (7px accent dot inside)

- Typing indicator: 3 dots with staggered bounce animation

- Input bar: sticky bottom, 24px radius, panel bg, hairline-2 border, focus ring using accent-ring + accent-bright border

- Send button: 34px circle, bg var(--fg), colour var(--bg), hover swaps to accent-bright


10. Detail View (Article Layout)
Single-column article layout, max-width 760px.

- Breadcrumbs: Geist Mono 12px, dashed underline on hover, accent-bright colour on hover

- Hero: 16:7.2 aspect ratio, rounded 12px, video gets mock player, articles get pattern banner

- Title: Geist Mono 34px, weight 600 (this is the one place mono is used large)

- Meta row: Geist Mono 12px, --fg-3, date / read time

- Tags row: standard tag pills

- Body: Geist Mono 14.5px, line-height 1.7, --fg-2. Bold text (**word**) renders as --fg with weight 700.

- Key takeaways: numbered cards (01, 02...) with mono 10.5px numbers, 13.5px body

- Analogy: left-bordered block (2px accent), italic heading in accent-bright

- End-of-summary divider: line — "end of summary" mono label — line

- Actionable steps: grid rows with checkbox (18px, radius 5px, accent fill when checked), difficulty badge (easy=accent-bright, medium=#E5B86F, hard=danger), deadline mono label, title + description

- Share card at bottom: dark panel with accent radial gradient at top-right, preview of Focus Card miniature, "Copy to clipboard" ghost button


11. Settings Modal
Inside the standard modal shell.

- API keys: rows with label (100px min), masked input (Geist Mono 12px), status indicator (accent-bright "● live")

- Goals list: rows with coloured dot, name, item count (mono), delete button (24px, danger on hover)

- Add goal: input + "Add" primary button

- Theme toggle: inline pill toggle (Dark/Light), mono 11px uppercase

- Accent picker: row of 28px colour circles, selected gets a double-ring outline (bg gap + fg border)

- Font picker: 3 cards in a grid, each with specimen text (Aa), font name, font family sub-label. Selected gets accent border + accent-soft background.


12. Weekly Stats
Sits below the Focus Card on the home screen.

- Border: 1px dashed var(--hairline)

- Border-radius: 10px

- Padding: 14px 18px

- Font: Geist 13.5px, --fg-3

- Narrative format, NOT just numbers

- Action count and ratio number use accent-bright colour + Geist Mono 13px weight 500

- When ratio >= 1.0: celebratory tone ("nice", "keep it up")

- When ratio < 1.0: neutral nudge ("room to grow") — numbers use --fg-2 instead of accent


13. Dormant Content Indicator
Applied to library cards where content was saved 5+ days ago with no actions taken.

- Position: bottom of card footer, below source line

- Border-top: 1px dashed var(--hairline)

- Padding-top: 6px, margin-top: 4px

- Font: Geist Mono 10px, letter-spacing 0.10em, lowercase, --fg-4

- Preceded by a 5px --fg-5 dot

- Text: "no actions taken · Xd ago"


14. Dot Pattern Background
Used on the main content area and processing overlay.

.dot-bg::before {

  content: "";

  position: absolute;

  inset: 0;

  background-image:

    radial-gradient(circle at 1px 1px, var(--dot-color) 1px, transparent 1.4px),

    radial-gradient(circle at 1px 1px, var(--dot-color-2) 1px, transparent 1.4px);

  background-size: 18px 18px, 18px 18px;

  background-position: 0 0, 9px 9px;

  mask-image: radial-gradient(ellipse at 50% 60%, #000 0%, transparent 70%);

  opacity: var(--dot-intensity, 0.9);

  pointer-events: none;

  z-index: 0;

}

Dot colours: --dot-color: rgba(var(--accent-bright-rgb), 0.16); --dot-color-2: rgba(255, 90, 95, 0.10);


15. Scrollbar Styling
::-webkit-scrollbar { width: 10px; height: 10px; }

::-webkit-scrollbar-thumb {

  background: var(--hairline-2);

  border-radius: 999px;

  border: 2px solid transparent;

  background-clip: content-box;

}

::-webkit-scrollbar-thumb:hover { background: var(--hairline-hover); background-clip: content-box; }

::-webkit-scrollbar-track { background: transparent; }


16. Fonts to Install
These must be available in the project (via npm, CDN, or local files):

Geist — primary sans-serif (body, headings, buttons)
Geist Mono — monospace (metadata, eyebrows, tags, timestamps, code, article body)
Instrument Serif — editorial fontset display headings only
DM Sans — soft fontset body only
DM Serif Display — soft fontset display headings only

CDN example for index.html:

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/geist@1.3.0/dist/fonts/geist-sans/style.css">

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/geist@1.3.0/dist/fonts/geist-mono/style.css">

<link rel="preconnect" href="https://fonts.googleapis.com">

<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=DM+Serif+Display&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">


17. Icons
Use Lucide React for all icons. Common icons used in the prototype:

Navigation: Home (Focus), MessageCircle (Ask), Library (Library), Settings, Plus, X
Actions: Check, ArrowRight, ArrowLeft, ChevronDown, ExternalLink
Content: Play, Search, Upload, Link, FileText, Clipboard
Status: Trash2

Import as: import { Search, ArrowRight, ... } from 'lucide-react'; Default icon size in sidebar: 16×16. In buttons: 12-14px. In cards: 11-12px.


18. File Structure for React Components
web/src/

├── App.jsx              # Shell: sidebar + main routing + theme context

├── components/

│   ├── Sidebar.jsx       # Nav + goals + user footer

│   ├── Home.jsx          # Focus Card + weekly stats + search + recents

│   ├── FocusCard.jsx     # Extracted: countdown, phase system, chain dots, actions

│   ├── Ask.jsx           # Chat UI with synthesis

│   ├── Library.jsx       # Filterable card grid + detail routing

│   ├── Detail.jsx        # Article-style content view

│   ├── ProcessingOverlay.jsx  # Staged animation overlay

│   ├── Onboarding.jsx    # Multi-step onboarding flow

│   ├── SettingsModal.jsx # Settings + goals CRUD + theme/accent/font pickers

│   └── AddModal.jsx      # URL input + file upload + paste

├── styles/

│   └── globals.css       # All CSS variables + base styles + component styles

├── data/

│   └── constants.js      # Accent presets, category colours, mottos, onboarding categories

└── hooks/

    └── useTheme.js       # Theme/accent/fontset state management


19. API Integration Notes
All API calls go to /api/... (Vite proxy forwards to FastAPI at localhost:8000).

Key endpoints for frontend:

POST /api/process          — process a YouTube URL (triggers ProcessingOverlay)

GET  /api/focus             — current focus action (drives FocusCard)

GET  /api/stats             — dashboard stats (drives WeeklyStats)

GET  /api/library           — content list with optional ?goal_id filter

GET  /api/library/{id}      — single content detail

GET  /api/actions           — list actions with optional ?status= filter

PUT  /api/actions/{id}/status — mark done/in_progress

POST /api/search            — semantic search + optional synthesis (drives Ask)

GET  /api/digest            — daily digest

GET  /api/goals             — goals list for sidebar

POST /api/goals             — create goal

GET  /api/settings          — get settings (masked keys)

PUT  /api/settings          — update settings


20. Critical Implementation Notes
Theme is applied via data attributes on <html>: data-theme="dark|light" and data-fontset="modern|editorial|soft". CSS overrides use these selectors.

Accent is applied via JS setting CSS custom properties on document.documentElement.style. The accent presets object maps each name to {accent, bright, accentRgb, brightRgb}.

The Focus Card phase colour is NOT an accent colour. It uses a separate --phase-color custom property set based on remaining time. Don't confuse it with the accent system.

All timestamps and metadata use Geist Mono. If you're unsure whether something should be mono, ask: "Is this a label, a measurement, a category, or a timestamp?" If yes → mono.

Cards never have box-shadow. They use border only (1px solid var(--hairline)). Elevation is communicated through background colour stepping (panel → panel-2 → panel-3), not shadow.

Hover states are border-colour changes, not background changes (except sidebar items which do both). Transitions are always 150ms with var(--ease).

The sidebar wordmark is "Clarity." in Geist 30px weight 900. The dot after "Clarity" is part of the brand. (Note: app name may change — keep the wordmark easy to update.)

User avatar in sidebar footer: 32px circle with gradient from accent to darker accent, single letter initial, Geist Mono 12px weight 600, colour #0a0b0d.

Responsive behaviour: The prototype is desktop-first. No mobile breakpoints in V1. The only media query is @media (max-width: 1100px) which collapses the recents grid from 4 columns to 2 and the detail view from 2 columns to 1.

Tailwind usage: Tailwind is installed but use it sparingly — primarily for utility spacing (mt-4, gap-3, etc.) and flexbox shortcuts. All visual styling (colours, borders, typography, radii) MUST use the CSS custom properties defined above, not Tailwind colour classes. Never use Tailwind's default colour palette.

