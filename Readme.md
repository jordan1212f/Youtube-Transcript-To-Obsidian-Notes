# yt-note

A Python CLI tool that turns YouTube videos into structured Obsidian notes — so you can learn from videos without watching them twice.

Paste a YouTube URL, get a Markdown note with a summary, key takeaways, analogies, actionable steps, and chapter breakdowns. Notes are automatically organised by topic in your Obsidian vault.

## How it works

```
python main.py https://www.youtube.com/watch?v=abc123
```

```
🔍 Fetching transcript for: https://www.youtube.com/watch?v=abc123
✅ Transcript fetched (1,243 words)
🤖 Generating note with Claude...
✅ Note generated
💾 Saving to vault...
✅ Done! Saved to: /Users/.../YouTube Notes/Python/how-to-build-a-cli-tool.md
```

## What the notes look like

```markdown
---
title: "How to Build a CLI Tool"
channel: "Fireship"
url: "https://youtube.com/..."
date: "2026-04-21"
tags: [python, cli, tutorial]
---

## 📝 Summary
## 💡 Key Takeaways
## 🧠 Analogies          ← only when relevant
## 🚀 Actionable Steps   ← only when relevant
## 📖 Chapters
```

Notes are saved to `YouTube Notes/<Topic>/` inside your vault, organised by the primary tag.

## Setup

**Requirements:** Python 3, a [Claude API key](https://console.anthropic.com), and a [YouTube Data API key](https://console.cloud.google.com).

```bash
git clone https://github.com/yourusername/yt-note.git
cd yt-note
pip install -r requirements.txt
python main.py <youtube-url>
```

On first run you'll be prompted for your Obsidian vault path and API keys. These are saved to `~/.yt-note/config.json` and reused automatically.

## Built with

- [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-python) — Claude Sonnet 4.6 for summarisation
- [youtube-transcript-api](https://github.com/jdepoix/youtube-transcript-api) — transcript fetching
- [Google API Python Client](https://github.com/googleapis/google-api-python-client) — video metadata