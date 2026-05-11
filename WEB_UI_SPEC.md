# Obsiditube — Web UI Feature Spec & Design Brief

*For use with design tools, AI models, and frontend development*

---

## Product overview

Obsiditube is an AI-powered study tool that turns YouTube videos into a searchable, interconnected knowledge base. Users paste YouTube URLs, get structured notes with summaries/takeaways/chapters, and can ask questions across their entire library of processed videos.

Target audience: University students, self-learners, researchers.
Vibe: Clean, minimal, modern. Between Notion/Linear and Apple. Gender-neutral.
Modes: Light + Dark (toggle).

---

## What's already built (backend)

These features exist as a Python CLI and need web UI equivalents:

1. **Single video processing** — paste a URL, get a structured note
2. **Batch processing** — paste multiple URLs or a playlist, process all at once
3. **Semantic search + synthesis** — ask a question, get a synthesised answer from your notes
4. **Note linking** — notes auto-link to related notes (bidirectional)
5. **Cost tracking** — per-note and cumulative API cost visibility
6. **Embedding on save** — every note is embedded for semantic search

---

## App structure

Sidebar navigation (Notion/YouLearn style) + main content area.

### Sidebar

```
Logo: Obsiditube
──────────────────
+ New                    (process a video)
🔍 Search               (ask your knowledge base)
📚 Library              (browse all notes)
📊 Dashboard            (stats + costs)
⚙️ Settings             (API keys, preferences)
──────────────────
Recents:
  · [Note title 1]
  · [Note title 2]
  · [Note title 3]
──────────────────
Spaces:                  (topic folders)
  · Finance (12)
  · Tech (8)
  · Life (3)
  + Create Space
──────────────────
Footer:
  47 notes · $1.24 spent
  [Light/Dark toggle]
```

---

## Page specs

### Page 1: Home / New (default landing)

**Purpose:** The first thing users see. Process a new video.

**Layout:**
- Hero text: "What do you want to learn?"
- Three input cards in a row:
  - 🔗 Paste URL — YouTube link input
  - 📋 Batch — paste multiple URLs or upload a .txt file
  - 📂 Import — drag and drop files (future: PDFs, audio)
- Below: "Ask your knowledge base" search bar (routes to Search page)
- Below: "My Spaces" grid — topic folders with note counts and thumbnail/icon
- Below: "Recent notes" horizontal scroll — last 5-10 processed notes

**Interactions:**
- Paste URL → shows video thumbnail + title preview (fetched from YouTube API)
- Click "Process" → shows real-time progress stepper:
  1. ✅ Transcript fetched (1,243 words)
  2. ⏳ Generating note with Claude...
  3. ○ Saving to library
  4. ○ Embedding for search
  5. ○ Finding related notes
- Estimated cost shown before processing starts
- "Cancel" button available during processing
- On completion → "View Note" button appears

**States:**
- Empty state (new user, no notes): "Process your first video to get started"
- Loading state: progress stepper with animated indicators
- Success state: note preview card with "View Note" CTA
- Error state: clear error message with retry button

---

### Page 2: Search / Ask

**Purpose:** Ask questions across the entire knowledge base.

**Layout:**
- Large search bar at top: "Ask your knowledge base anything..."
- Below search bar: suggested questions based on existing notes (optional)
- Results area (appears after search):
  - "Top matches" section — list of relevant notes with relevance % scores
  - Each result shows: title, relevance %, topic tag, 1-line snippet
  - Clicking a result opens the note
  - "Synthesise answer" button below results
- Synthesis area (appears after clicking synthesise):
  - Claude's synthesised answer in a clean card
  - Source notes listed with [[wiki link]] formatting
  - Cost of this search displayed subtly

**Interactions:**
- Type query → hit Enter or click search icon
- Results appear with animated entrance
- "Synthesise" is a separate step (costs money, user confirms)
- Cost estimate shown before synthesis
- Answer streams in (typewriter effect if possible)

**States:**
- Empty state: "Process some videos first, then ask questions here"
- Searching: spinner/skeleton loading
- Results only: list of matched notes
- Synthesised: full answer with sources
- No results: "No matching notes found. Try a different question."

---

### Page 3: Library

**Purpose:** Browse, filter, and read all notes.

**Layout:**
- Header: "Your Library" + filter/sort controls
- Filters: by topic/space, by date, by tag
- Sort: newest first, oldest first, most linked
- View toggle: list view / grid view (cards)
- Note list/grid:
  - Each note card shows:
    - Title
    - Topic tag (colour-coded pill)
    - Channel name
    - Date processed
    - Number of related links
    - 2-line summary preview
  - Click to open full note

**Note detail view (opens in main content area or modal):**
- Full rendered markdown note with all sections:
  - Summary
  - Key Takeaways
  - Analogies (if present)
  - Actionable Steps (if present)
  - Chapters
  - Related Notes (with clickable [[wiki links]])
- Metadata bar: channel, date, tags, YouTube link, processing cost
- "Open in Obsidian" button (if vault path configured)
- "Delete" button (with confirmation)
- "Reprocess" button (re-run with latest prompt)

**States:**
- Empty: "No notes yet. Process your first video."
- Populated: grid/list of note cards
- Filtered: show active filters with clear button
- Note open: full note rendered in main area

---

### Page 4: Dashboard

**Purpose:** Stats, costs, and knowledge base health.

**Layout:**
- Top row — key metrics cards:
  - Total notes processed
  - Total topics/spaces
  - Total API cost (all time)
  - Average cost per note
- Chart: notes processed over time (bar chart, by week/month)
- Chart: cost over time (line chart)
- Chart: topic distribution (pie/donut chart)
- Table: recent processing history
  - Date, video title, channel, cost, status
- Knowledge base health:
  - "Most connected note" (most links)
  - "Isolated notes" (no links — suggests they need more context)
  - "Topics with fewest notes" (knowledge gaps)

---

### Page 5: Settings

**Purpose:** Configure the app.

**Layout:**
- Sections with clear labels:

**API Keys:**
- Claude API key (masked, show/hide toggle)
- YouTube Data API key (masked, show/hide toggle)
- Status indicator: ✅ Valid / ❌ Invalid / ⚠️ Not set

**Storage:**
- Obsidian vault path (file picker or text input)
- Export format: Obsidian / Notion / Markdown / PDF

**Search & Linking:**
- Search results count (slider or number input, default 5)
- Link candidates (slider or number input, default 15)
- Auto-link new notes: on/off toggle

**Appearance:**
- Theme: Light / Dark / System
- Accent colour (optional future feature)

**Account (future):**
- Email
- Subscription tier
- Usage limits

**Danger zone:**
- Reset all settings
- Clear embedding database
- Delete all notes (with triple confirmation)

---

## Design system

### Colours

**Light mode:**
| Token | Value | Usage |
|---|---|---|
| bg-primary | #FAFAFA | Page background |
| bg-secondary | #F0F0F0 | Sidebar, card hover |
| bg-surface | #FFFFFF | Cards, modals, inputs |
| text-primary | #1A1A1A | Headings, body text |
| text-secondary | #6B6B6B | Captions, metadata |
| text-tertiary | #9CA3AF | Placeholders |
| border | #E5E5E5 | Card borders, dividers |
| accent | #7C3AED | Buttons, links, active states |
| accent-hover | #6D28D9 | Button hover |
| success | #16A34A | Checkmarks, success states |
| error | #DC2626 | Error messages, destructive actions |
| warning | #F59E0B | Cost warnings, cautions |

**Dark mode:**
| Token | Value | Usage |
|---|---|---|
| bg-primary | #0F0F0F | Page background |
| bg-secondary | #1A1A1A | Sidebar |
| bg-surface | #242424 | Cards, modals, inputs |
| text-primary | #E8E8E8 | Headings, body text |
| text-secondary | #999999 | Captions, metadata |
| text-tertiary | #555555 | Placeholders |
| border | #2E2E2E | Card borders, dividers |
| accent | #9F67FF | Buttons, links, active states |
| accent-hover | #B388FF | Button hover |
| success | #4ADE80 | Checkmarks |
| error | #F87171 | Errors |
| warning | #FBBF24 | Warnings |

### Typography

- Font family: Inter (primary), system-ui (fallback)
- Heading 1: 28px / 700 weight
- Heading 2: 22px / 600 weight
- Heading 3: 18px / 600 weight
- Body: 15px / 400 weight
- Caption: 13px / 400 weight
- Mono (code/costs): JetBrains Mono or SF Mono, 13px

### Spacing

- Base unit: 4px
- Card padding: 20px
- Section gap: 32px
- Sidebar width: 240px (collapsible to 64px on mobile)
- Content max-width: 960px (centered)
- Border radius: 12px (cards), 8px (buttons, inputs), 20px (pills/tags)

### Components

**Button styles:**
- Primary: accent bg, white text, rounded-8
- Secondary: transparent bg, accent border, accent text
- Ghost: transparent bg, text-secondary, no border
- Destructive: error bg, white text

**Input fields:**
- Height: 44px
- Border: 1px border colour
- Focus: accent border + subtle accent shadow
- Placeholder: text-tertiary

**Cards:**
- bg-surface background
- 1px border
- border-radius 12px
- Subtle shadow on hover (light mode)
- Slight border-lightening on hover (dark mode)

**Tags/pills:**
- Rounded-20
- Small text (12px)
- Colour-coded by topic:
  - Finance: #818CF8 (indigo)
  - Tech: #34D399 (emerald)
  - Life: #FB923C (orange)
  - Science: #38BDF8 (sky)
  - Auto-assign colours for new topics

**Progress stepper:**
- Vertical steps with icons
- ✅ completed (green), ⏳ in progress (accent, animated), ○ pending (grey)
- Connecting line between steps

**Relevance score:**
- Percentage in a circular badge or horizontal bar
- Colour gradient: green (80%+), yellow (50-80%), grey (<50%)

---

## Animations & micro-interactions

- Page transitions: subtle fade (150ms)
- Card hover: slight lift (translateY -2px) + shadow
- Button press: scale(0.98) for 100ms
- Progress stepper: smooth transitions between states
- Search results: stagger entrance (50ms delay per item)
- Synthesis text: typewriter/streaming effect
- Theme toggle: smooth colour transition (200ms)
- Sidebar collapse: smooth width animation (200ms)
- Note cards: fade in on scroll (intersection observer)

---

## Responsive behaviour

- Desktop (>1024px): full sidebar + content area
- Tablet (768-1024px): collapsible sidebar (hamburger menu)
- Mobile (<768px): bottom nav bar replaces sidebar, full-width content

---

## Empty states

Every section needs a well-designed empty state:

- **Home (no notes):** "Process your first video to start building your knowledge base" + illustration
- **Search (no notes):** "Nothing to search yet. Add some videos first."
- **Library (no notes):** "Your library is empty. Start by processing a YouTube video."
- **Dashboard (no data):** "Process some videos to see your stats here."

---

## API endpoints (FastAPI backend)

The web UI will call these endpoints:

```
POST   /api/process          — process a single YouTube URL
POST   /api/process/batch    — process multiple URLs
POST   /api/search           — semantic search + optional synthesis
GET    /api/notes            — list all notes (with filters)
GET    /api/notes/{id}       — get a single note's full content
DELETE /api/notes/{id}       — delete a note
GET    /api/stats            — dashboard stats and cost data
GET    /api/settings         — get current settings
PUT    /api/settings         — update settings
GET    /api/spaces           — list topic spaces with note counts
```

---

## Tech stack

| Layer | Choice |
|---|---|
| Backend | FastAPI (Python) |
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| State | React useState + useContext |
| Charts | Recharts |
| Icons | Lucide React |
| Font | Inter (Google Fonts) |
| Dark mode | Tailwind dark: classes + context toggle |

---

## Design references

- **YouLearn** — sidebar + spaces layout, "What do you want to learn?" hero
- **Notion** — clean card design, sidebar navigation, typography
- **Linear** — minimal aesthetic, progress indicators, keyboard shortcuts
- **Apple.com** — whitespace usage, typography scale, subtle animations
- **Vercel Dashboard** — dark mode execution, stats cards, clean tables

---

## Priority for V1

Must ship:
1. Home page with URL input + processing progress
2. Library page with note cards + full note view
3. Search page with results + synthesis
4. Settings page with API keys + preferences
5. Light/dark mode toggle
6. Responsive sidebar

Nice to have (V1.1):
- Dashboard with charts
- Spaces/topic folders
- Batch processing UI
- Suggested questions in search
- Note reprocessing
