# routes/process.py
# Processes content from URLs or pasted text — YouTube, X/Twitter, Substack
# articles, PDFs, and pasted text. Extraction is delegated to the extractors/
# module so this endpoint stays source-agnostic: extract → summarise → save →
# embed → return.

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from urllib.parse import urlparse

from config import load_config
from extractors import extract
from ai import generate_summary
from embedder import store_embedding
from cost import record_usage
from database import save_content

router = APIRouter(tags=['process'])


class ProcessRequest(BaseModel):
    url: Optional[str] = None
    text: Optional[str] = None
    content_type: Optional[str] = None
    goal_id: Optional[int] = None


# ── Content type detection ──

def detect_content_type(url):
    """Detect what kind of content a URL points to (domain-based).

    Returns: 'youtube', 'tweet', or 'article' (the default).
    """
    parsed = urlparse(url)
    hostname = parsed.hostname or ''

    if 'youtube.com' in hostname or 'youtu.be' in hostname:
        return 'youtube'

    if 'twitter.com' in hostname or 'x.com' in hostname:
        return 'tweet'

    if 'substack.com' in hostname:
        return 'article'

    # Default: treat as a generic article
    return 'article'


# ── Processing endpoint ──

@router.post('/process')
def process_content(request: ProcessRequest):
    """Process a URL or pasted text and save the result.

    Accepts either:
      { "url": "...", "goal_id": 1 }                     — fetch from a URL
      { "text": "...", "goal_id": 1, "content_type": "paste" }  — pasted text

    The response includes the processed content so the frontend can display
    it immediately without a second API call.
    """
    config = load_config()

    # Pasted-text path takes precedence when text is supplied.
    if request.text is not None and request.text.strip():
        content_type = request.content_type or 'paste'
        try:
            data = extract(content_type, text=request.text)
        except NotImplementedError as err:
            raise HTTPException(status_code=501, detail=str(err))
        except ValueError as err:
            raise HTTPException(status_code=400, detail=str(err))

    elif request.url:
        content_type = request.content_type or detect_content_type(request.url)
        try:
            data = extract(content_type, url=request.url)
        except NotImplementedError as err:
            raise HTTPException(status_code=501, detail=str(err))
        except ValueError as err:
            raise HTTPException(status_code=400, detail=str(err))

    else:
        raise HTTPException(
            status_code=400,
            detail='Provide either a url or text to process.'
        )

    return process_extracted(data, request.goal_id, config)


def process_extracted(data, goal_id, config):
    """Run the shared pipeline on a normalised extractor dict.

    1. Summarise with Claude (framed for the content type)
    2. Record costs
    3. Save to database
    4. Embed for search
    5. Return the processed content
    """
    try:
        result = generate_summary(
            api_key=config['api_key'],
            title=data['title'],
            source=data['source'],
            text=data['text'],
            word_count=data['word_count'],
            content_type=data['content_type'],
        )
        note = result['note']
        usage = result['usage']

        cost_stats = record_usage(usage['input_tokens'], usage['output_tokens'])

        content_id = save_content(
            goal_id=goal_id,
            content_type=data['content_type'],
            url=data['url'],
            title=data['title'],
            source=data['source'],
            summary=note['summary'],
            key_points=note.get('keyTakeaways', []),
            raw_text=data['text'],
            tags=note.get('tags', []),
            cost=cost_stats['call_cost'],
        )

        # Embed for semantic search
        store_embedding(str(content_id), data['title'], note['summary'])

        return {
            'id': content_id,
            'content_type': data['content_type'],
            'title': data['title'],
            'source': data['source'],
            # 'channel' kept as an alias for backwards compatibility
            'channel': data['source'],
            'url': data['url'],
            'summary': note['summary'],
            'key_takeaways': note.get('keyTakeaways', []),
            'analogies': note.get('analogies', []),
            'actionable_steps': note.get('actionableSteps', []),
            'chapters': note.get('chapters', []),
            'tags': note.get('tags', []),
            'cost': cost_stats['call_cost'],
            'word_count': data['word_count'],
            'goal_id': goal_id,
        }

    except HTTPException:
        raise
    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err))
