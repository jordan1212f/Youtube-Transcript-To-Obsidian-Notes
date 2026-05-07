# yt-note — Development Log

A CLI tool that fetches YouTube transcripts and saves them as formatted Obsidian notes.

This is also a project built to help me get better at working with Claude Code

---

## Architecture

```
yt-note/
├── main.py           # CLI entry point — wires all modules together
├── config.py         # Read/write ~/.yt-note/config.json
├── transcript.py     # Fetch transcript + video metadata
├── ai.py             # Call Claude API, return structured JSON
├── format.py         # Build the final Markdown string
├── save.py           # Write note to correct vault folder
├── requirements.txt  # Python dependencies
├── CLAUDE.md         # Claude Code instructions
├── DEVLOG.md         # This file — running build documentation
└── .claude/
    └── skills/
        ├── python-cli.md     # Code style rules
        └── obsidian-note.md  # Note format rules
```

## Data flow

```
YouTube URL
    │
    ▼
transcript.py ──► extract_video_id() ──► fetch_video_metadata() ──► fetch_transcript()
    │                                     (YouTube Data API v3)      (youtube-transcript-api)
    │
    ▼
    Returns: { video_id, title, channel, transcript, segments, word_count }
    │
    ▼
ai.py ──► generate_note() ──► Claude Sonnet 4.6
    │
    ▼
    Returns: { tags, summary, keyTakeaways, analogies, actionableSteps, chapters }
    │
    ▼
format.py ──► formatNote() ──► builds Markdown string
    │
    ▼
save.py ──► save_note() ──► writes .md file to vault
    │
    ▼
    ~/MyVault/YouTube Notes/<Tag>/video-title.md
```

## Dependencies

| Package | Purpose | Why? |
|---------|---------|---------------|
| `anthropic` | Claude API SDK | Official Anthropic SDK, handles auth and API calls |
| `youtube-transcript-api` | Fetch video transcripts | No API key needed, scrapes YouTube directly |
| `google-api-python-client` | Fetch video title + channel | Official Google SDK, reliable and stable |

## Config

Stored at `~/.yt-note/config.json`. Created on first run via interactive prompts.

```json
{
  "vault_path": "/Users/.../MyVault",
  "api_key": "sk-ant-...",
  "youtube_api_key": "AIza..."
}
```

Three keys required:
- **vault_path** — absolute path to Obsidian vault root
- **api_key** — Anthropic API key from console.anthropic.com
- **youtube_api_key** — YouTube Data API v3 key from console.cloud.google.com

## Decisions log

### 1. Prompt design (ai.py)
- **Tags**: free-form, not limited. First tag becomes the folder name.
- **Summary**: scales to video length — 1 paragraph per 10 mins, min 2, max 6.
- **Chapters**: topic names only, no timestamps. Transcript text doesn't carry reliable timing info.
- **Analogies + actionable steps**: conditional — only included when genuinely relevant, empty array otherwise.
- **Title + channel**: not in Claude's JSON output. We fetch them from YouTube Data API and add them ourselves in format.py.

### 2. Video metadata
- Chose `google-api-python-client` over `yt-dlp` or `pytube` for reliability.
- Requires a YouTube Data API key (free, generous quota).
- Only fetches the `snippet` part — minimises API usage.

### 3. Config storage
- Single JSON file at `~/.yt-note/config.json`.
- First run prompts for all three values, validates vault path exists.
- No env vars — keeps it simple, everything in one place.


### 4. File structure decisions
- `main.py` is the only file that imports all other modules — no circular dependencies.
- Each module has a single responsibility and could be tested independently.
- Error handling happens at one place: the `try/except` in `main.py`. Individual modules raise exceptions with clear messages, `main.py` catches and prints them.

### 5. CLI design
- Uses `sys.argv` directly instead of `argparse` — only one argument (the URL), so argparse would be overkill.
- `KeyboardInterrupt` caught separately so Ctrl+C exits cleanly without a traceback.
- Emoji-prefixed console output shows progress at each step.
---