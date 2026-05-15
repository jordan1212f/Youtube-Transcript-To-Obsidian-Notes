# Obsiditube — Frontend Design Skill
# Place this file at: .claude/skills/frontend-design.md

---
name: frontend-design
description: >
  Obsiditube-specific frontend design system. Use this skill for EVERY component
  and page you build in this project. It encodes the exact design system, layout
  rules, colour tokens, typography, and component patterns for this app.
  Read it fully before writing any code.
---

## What This App Is

Obsiditube turns YouTube content into actionable steps tied to personal goals.
It is a **single-user, local-first productivity app** — not a marketing site,
not a SaaS dashboard. The feeling it should evoke: *calm clarity*. The user's
chaotic content consumption — finally organised and made sense of.

Target users: university students, self-learners, professionals. Mixed gender.
The design must appeal equally to all — no harsh masculinity, no soft pinks.

---

## Design Direction

**Tone:** Warm minimal. Notion meets a well-designed journal. Clean but not cold.
**Aesthetic:** Content-first. The UI is a frame, not the focus.
**Feeling:** Calm, organised, intentional. Like a clean desk after a messy week.
**Complexity:** Minimal. Restrained animations, no flashy effects, no noise textures.
  Every element earns its place. If it doesn't need to be there, remove it.

---

## Typography

### Fonts (import both from Google Fonts)
```css
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');
```

- **UI font (everything):** `Geist` — weights 300, 400, 500, 600
- **Display accent (app name, section headers):** `Lora` — adds warmth, avoids
  the all-sans-serif AI app aesthetic

### Type scale (use these exactly, do not invent new sizes)
```css
--text-xs:   0.75rem;   /* 12px — meta, timestamps, badges */
--text-sm:   0.875rem;  /* 14px — secondary labels, sidebar items */
--text-base: 1rem;      /* 16px — body, card text */
--text-lg:   1.125rem;  /* 18px — card titles */
--text-xl:   1.25rem;   /* 20px — section headings */
--text-2xl:  1.5rem;    /* 24px — page title */
--text-3xl:  1.875rem;  /* 30px — app name display */
```

### Typography rules
- App name "Obsiditube": `Lora`, italic, `--text-3xl`, accent colour
- Page titles: `Geist` 500, `--text-2xl`
- Section headings: `Geist` 500, `--text-xl`, muted colour
- Card titles: `Geist` 500, `--text-lg`
- Body / descriptions: `Geist` 400, `--text-base`
- Meta (timestamps, tags, counts): `Geist` 400, `--text-xs`, muted colour
- Input fields: MINIMUM 16px to prevent mobile zoom
- Never use font-weight 700+ (bold) — it clashes with the calm aesthetic
- Never use all-caps headings

---

## Colour System

### Dark theme (PRIMARY — build dark first)
```css
:root[data-theme="dark"] {
  /* Backgrounds */
  --bg-base:      #0f1117;  /* main canvas — near-black with blue undertone */
  --bg-surface:   #161b27;  /* cards, panels */
  --bg-elevated:  #1e2535;  /* modals, dropdowns, hover states */
  --bg-sidebar:   #13161f;  /* sidebar — slightly darker than base */

  /* Borders */
  --border:       #252d3d;  /* subtle dividers */
  --border-focus: #4A9B8E;  /* teal on focus */

  /* Text */
  --text-primary:   #e8eaf0;  /* main text — warm off-white, not harsh white */
  --text-secondary: #8892a4;  /* secondary labels, descriptions */
  --text-muted:     #4f5a6e;  /* timestamps, placeholders */

  /* Accent — muted teal */
  --accent:         #4A9B8E;  /* primary teal */
  --accent-dim:     #3a7a6f;  /* hover state for accent elements */
  --accent-subtle:  rgba(74, 155, 142, 0.12);  /* bg tint for active states */
  --accent-text:    #7ec8be;  /* teal text on dark backgrounds */

  /* Status colours — kept muted, not neon */
  --status-green:   #4a9b6f;  /* done / completed */
  --status-amber:   #b8862a;  /* in progress / warning */
  --status-red:     #9b4a4a;  /* expired / urgent */
  --status-blue:    #4a6b9b;  /* info */

  /* Countdown bar gradient */
  --countdown-full:   #4A9B8E;  /* green-teal — plenty of time */
  --countdown-mid:    #b8862a;  /* amber — getting close */
  --countdown-urgent: #9b4a4a;  /* muted red — nearly expired */

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.4);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.5);
}
```

### Light theme (secondary — toggled by user)
```css
:root[data-theme="light"] {
  --bg-base:      #f7f8fa;
  --bg-surface:   #ffffff;
  --bg-elevated:  #f0f2f5;
  --bg-sidebar:   #eef0f4;

  --border:       #dde1e9;
  --border-focus: #4A9B8E;

  --text-primary:   #1a1d26;
  --text-secondary: #5a6275;
  --text-muted:     #9aa0b0;

  --accent:         #4A9B8E;
  --accent-dim:     #3a7a6f;
  --accent-subtle:  rgba(74, 155, 142, 0.10);
  --accent-text:    #2d7a70;

  --status-green:   #2d7a50;
  --status-amber:   #8a6020;
  --status-red:     #8a3030;
  --status-blue:    #3060a0;

  --countdown-full:   #4A9B8E;
  --countdown-mid:    #d4962e;
  --countdown-urgent: #c04040;

  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.12);
}
```

### Colour rules
- NEVER use pure `#000000` or `#ffffff`
- NEVER use purple, violet, or indigo — they test as "generic AI app"
- The teal accent is used sparingly: active nav items, CTAs, focus rings,
  countdown bars, progress indicators. Not backgrounds, not text blocks.
- Status colours (green/amber/red) are for the countdown timer only, not decorative

---

## Layout

### Overall shell
```
┌─────────────────────────────────────────────────────┐
│  Sidebar (220px fixed) │  Main content area (flex-1) │
│                        │                             │
│  Logo                  │  [Page content]             │
│  Nav items             │                             │
│  ─────────             │                             │
│  Goals list            │                             │
│  ─────────             │                             │
│  Theme toggle          │                             │
│  Settings              │                             │
└─────────────────────────────────────────────────────┘
```

- Sidebar: `width: 220px`, fixed, `--bg-sidebar`, right border `1px solid --border`
- Main area: `flex: 1`, `overflow-y: auto`, `--bg-base`
- No top navigation bar — sidebar IS the navigation
- Sidebar is NOT collapsible in V1

### Main content area inner layout (all pages)
```
Padding: 32px 40px (desktop), 24px 20px (mobile)
Max content width: 760px (centred within the main area, not full-width)
```

### Page structure (Home page — reference for all pages)
Inspired by Janus's Links layout but adapted for dark theme and sidebar:
```
App name (Lora italic, large)
Subtitle / tagline (muted, small)
──────────────────────────────
Search / Add content bar
──────────────────────────────
Content type filter pills (YouTube, Article, PDF...)
──────────────────────────────
Recently saved content cards (vertical list, NOT grid)
```

---

## Component Patterns

### Sidebar nav item
```
Default:   text-secondary, no background, left padding 16px
Hover:     text-primary, bg: --bg-elevated, smooth 150ms transition
Active:    text-primary, left border 2px solid --accent, bg: --accent-subtle
           font-weight 500
```
Never use coloured backgrounds for active items — the left border + subtle
tint is the signal.

### Content cards (Library + Home recents)
```
Background:     --bg-surface
Border:         1px solid --border
Border-radius:  8px
Padding:        16px 20px
Hover:          border-color: --border-focus, shadow: --shadow-sm
                transition: 150ms ease
```
Cards are stacked vertically (NOT a grid). Each card shows:
- Content title (--text-lg, Geist 500)
- Source / channel name (--text-xs, --text-muted)
- Tags (pills, see Tag pill spec below)
- Summary snippet (--text-sm, --text-secondary, 2-line clamp)
- Timestamp (--text-xs, --text-muted, right-aligned)

NEVER add box-shadow decoratively — only on hover. The border does the work.

### Tag / filter pills
```
Background:     --bg-elevated
Border:         1px solid --border
Border-radius:  999px (fully rounded)
Padding:        4px 12px
Font:           --text-xs, Geist 400
Color:          --text-secondary

Active pill:
Background:     --accent-subtle
Border-color:   --accent
Color:          --accent-text
```

### Search / URL input bar
```
Background:     --bg-surface
Border:         1px solid --border
Border-radius:  8px
Padding:        12px 16px
Font:           --text-base, Geist 400 (MINIMUM 16px — prevents mobile zoom)
Placeholder:    --text-muted

Focus:
Border-color:   --accent (--border-focus)
Box-shadow:     0 0 0 3px rgba(74,155,142,0.15)
Outline:        none
```

### Focus action card (Home page — most important component)
The 48-hour countdown card is the centrepiece of the Home page.
```
Background:     --bg-surface
Border:         1px solid --border
Border-radius:  10px
Padding:        24px
Margin-bottom:  32px

Header row:
  "Today's Focus" label  →  --text-xs, --text-muted, uppercase, letter-spacing 0.08em
  Time remaining         →  --text-xs, --accent-text, right-aligned

Action title:   --text-xl, Geist 500, --text-primary
Action desc:    --text-sm, --text-secondary, margin-top 8px
Goal tag:       pill style, --accent-subtle bg, --accent-text

Countdown bar:
  Height:        4px
  Border-radius: 2px
  Background:    --bg-elevated (track)
  Fill colour:   dynamic based on time remaining:
    > 24hrs remaining → --countdown-full (teal)
    8–24hrs remaining → --countdown-mid (amber)
    < 8hrs remaining  → --countdown-urgent (muted red)
  Transition:    width 1s ease

"More time" button:  text button, --text-muted, hover: --accent-text
                     Only shown once (one extension allowed)
```

### Weekly stats row (Home page, below focus card)
```
Three inline stat items:
  [X completed] / [Y total]    →  --accent-text / --text-secondary
  [Z expired]                  →  --status-red / --text-secondary

Layout: horizontal flex, gap 32px, --text-sm
Numbers: Geist 600, slightly larger (--text-lg)
Labels:  Geist 400, --text-xs, --text-muted
```

### Settings modal
```
Overlay:        rgba(0,0,0,0.6) backdrop
Modal:          --bg-surface, border: 1px solid --border, border-radius: 12px
                max-width: 520px, padding: 32px
                box-shadow: --shadow-md
Close button:   top-right, --text-muted, hover: --text-primary
```

### Buttons
```
Primary (CTA):
  Background:     --accent
  Color:          #ffffff
  Border-radius:  7px
  Padding:        10px 20px
  Font:           Geist 500, --text-sm
  Hover:          --accent-dim
  Transition:     150ms ease

Secondary / ghost:
  Background:     transparent
  Border:         1px solid --border
  Color:          --text-secondary
  Hover:          bg: --bg-elevated, color: --text-primary

Destructive:
  Color:          --status-red
  Background:     transparent on default, subtle red tint on hover
```

---

## Animation & Motion

**Philosophy:** Minimal. One well-executed transition is better than ten scattered ones.

### Allowed animations
- Nav item hover: `background 150ms ease, color 150ms ease`
- Card hover: `border-color 150ms ease, box-shadow 150ms ease`
- Modal open: `opacity 0→1, translateY 8px→0, duration 200ms ease-out`
- Page load: Single staggered fade-in on content cards
  (`opacity 0→1, translateY 12px→0`) with `animation-delay` increments of 60ms
- Countdown bar: `width` transition `1s ease` (updates every minute)
- Input focus ring: `box-shadow 150ms ease`

### Forbidden animations
- No spinning loaders (use skeleton placeholders instead)
- No bouncing or elastic effects
- No parallax
- No perpetual animations (breathing glows, rotating elements)
- No page transition slide animations in V1

---

## Spacing System

Use multiples of 4px:
```
4px  — tight (icon gaps, tag internal)
8px  — small (between related elements)
12px — compact
16px — default component padding
20px — card padding horizontal
24px — section internal padding
32px — between sections
40px — page padding
```

---

## Sidebar Content Structure

```
Sidebar top:
  ▶ Obsiditube          ← Lora italic, --accent-text, 18px

Nav items (with Lucide icons, 16px, --text-muted):
  ◉ Home
  ◉ Ask
  ◉ Library

Divider: 1px solid --border, margin: 12px 0

Goals section:
  "GOALS" label  ← --text-xs, --text-muted, uppercase, letter-spacing 0.1em
  Goal items:    --text-sm, --text-secondary, hover: --text-primary
                 Left dot: 6px circle, colour = goal area colour or --accent
                 No folder icons — just the dot + label

Sidebar bottom (pinned):
  Theme toggle   ← sun/moon icon, --text-muted
  Settings       ← gear icon, --text-muted
```

---

## Anti-Patterns (never do these in this project)

**Typography**
- ❌ Inter, Roboto, Arial, system-ui
- ❌ font-weight 700+ for headings
- ❌ All-caps section headers (use small-caps style with letter-spacing instead)
- ❌ Gradient text on headings

**Colour**
- ❌ Purple, violet, indigo — anything in that family
- ❌ Neon or saturated accent colours
- ❌ Pure black (#000) or pure white (#fff)
- ❌ Multiple accent colours — teal only

**Layout**
- ❌ 3-column equal card grids
- ❌ Full-width cards (max content width is 760px)
- ❌ Top navigation bar (sidebar only)
- ❌ `h-screen` — use `min-h-screen` or `100dvh`

**Components**
- ❌ Generic card-border-shadow pattern (border does the work, no decorative shadows)
- ❌ Default unstyled shadcn components — always customise
- ❌ Checkbox lists that look like todo apps — this is not a todo app
- ❌ Avatar/profile pictures in V1
- ❌ Notification badges or dot indicators on nav items

**Effects**
- ❌ Neon glows or outer glow effects
- ❌ Noise/grain textures (too busy for this calm aesthetic)
- ❌ Glassmorphism / frosted glass panels
- ❌ Gradient mesh backgrounds

---

## App Screen Inventory (V1)

These are the ONLY screens being built. Do not add screens.

### 1. Home (`/`)
Content: Focus action card (48hr countdown) + URL input + content type
filter pills + recently saved content list + weekly stats row

### 2. Ask (`/ask`)
Content: Search input (large, centred) + suggested question pills +
search results with relevance indicators + synthesis card (collapsible)

### 3. Library (`/library`)
Content: Filter pills (by goal) + content card list + click-to-expand
detail view (slides in from right OR expands inline)

### 4. Settings (modal, not a page)
Content: API key fields (masked) + goals CRUD list + theme toggle

---

## API Endpoints Used by Frontend

```
GET    /api/focus           → Home: focus action card data
GET    /api/library         → Home: recent content + Library: full list
GET    /api/library/{id}    → Library: detail view
GET    /api/goals           → Sidebar: goals list + Settings: goals CRUD
GET    /api/stats           → Home: weekly stats row
POST   /api/process         → Home: URL input submission
POST   /api/search          → Ask: search + synthesis
GET    /api/settings        → Settings modal
PUT    /api/settings        → Settings modal save
POST   /api/goals           → Settings: create goal
DELETE /api/goals/{id}      → Settings: delete goal
PUT    /api/actions/{id}/status  → Home: mark action done
```

All requests go to `/api/*` — Vite proxies these to FastAPI on port 8000.
No authentication headers needed (single-user local app).

---

## Code Conventions

- React functional components only, no class components
- CSS custom properties (variables) for ALL colours and spacing — no hardcoded hex values in component code
- Tailwind utility classes are acceptable but CSS variables must be used for theme tokens
- Component files: PascalCase (`Sidebar.jsx`, `Home.jsx`)
- No default export + named export mixing — use default exports for pages, named for utilities
- Fetch calls: use `async/await` with try/catch, show loading state, handle empty state
- Empty states: always show a helpful empty state (not just blank space)
- Loading states: skeleton placeholder divs, NOT spinners

---

## Skeleton Placeholder Pattern (loading state)
```jsx
// Use this pattern for loading states — no spinners
<div className="skeleton" style={{
  height: '20px',
  borderRadius: '4px',
  background: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-surface) 50%, var(--bg-elevated) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite'
}} />
```
Add the `@keyframes shimmer` to your global CSS.

---

## Reference Layout (Home page wireframe)

```
┌─ Sidebar (220px) ──────┬─ Main Content (flex-1, max-w 760px centred) ───┐
│                        │                                                 │
│ ▶ Obsiditube           │  Obsiditube                    [week: 3/5 ✓]   │
│                        │  Turn what you consume into                    │
│ ◉ Home         ←active │  what you become.                               │
│   Ask                  │                                                 │
│   Library              │  ┌─ Today's Focus ──────────────── 18h left ─┐ │
│                        │  │  "Implement portfolio optimisation         │ │
│ ──────────────         │  │   algorithm from Markowitz video"          │ │
│ GOALS                  │  │  Goal: Quant Finance                       │ │
│ · Quant Finance        │  │  ████████████████░░░░░░  (amber bar)       │ │
│ · Run marathon         │  │  [Mark done]  [More time]                  │ │
│                        │  └───────────────────────────────────────────┘ │
│ ──────────────         │                                                 │
│ ☀ Theme  ⚙ Settings   │  ┌─ Add content ──────────────────────────────┐ │
│                        │  │  Paste a YouTube URL...                    │ │
└────────────────────────┘  └───────────────────────────────────────────┘ │
                            │                                              │
                            │  [YouTube] [Article] [PDF]  ← filter pills  │
                            │                                              │
                            │  ┌─ Card ─────────────────────────────────┐ │
                            │  │  How to build a quant strategy         │ │
                            │  │  3Blue1Brown · 2h ago                  │ │
                            │  │  Summary snippet here...               │ │
                            │  └───────────────────────────────────────┘ │
                            └─────────────────────────────────────────────┘
```
