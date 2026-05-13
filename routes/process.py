# routes/process.py
# Processes content from URLs — YouTube videos, tweets, articles.
# Detects content type from the URL, fetches text, sends to Claude,
# saves to database and embeddings.
#
# This is where the CLI's process_single() function becomes an API endpoint.

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from urllib.parse import urlparse
 
from config import load_config
from transcript import fetch_transcript
from ai import generate_note
from embedder import store_embedding
from cost import record_usage
from database import save_content
 
router = APIRouter(tags=['process'])
 
class ProcessRequest(BaseModel):
    url: str
    goal_id: Optional[int] = None

# ── Content type detection ──

def detect_content_type(url):
    """Detect what kind of content a URL points to.
 
    Returns: 'youtube', 'tweet', 'article', or 'unknown'
 
    This is a simple URL-based check. It doesn't fetch the page
    to determine type — just looks at the domain.
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

# ── Processing endpoints ──

@router.post('/process')
def process_content(request: ProcessRequest):
    """Process a URL and save the result.
 
    Currently supports YouTube videos fully.
    Tweet and article support will use web scraping (TODO).
 
    The response includes the processed content so the frontend
    can display it immediately without a second API call.
    """

    config = load_config()
    content_type = detect_content_type(request.url)

    if content_type == 'youtube':
        return process_youtube(request.url, request.goal_id, config)
    elif content_type == 'tweet':
        #! TODO Implement processing for tweets
        raise HTTPException(status_code=501, detail='Tweet processing not implemented yet')
    elif content_type == 'article':
        #! TODO Implement processing for articles
        raise HTTPException(status_code=501, detail='Article processing not implemented yet')
    else:
        raise HTTPException(status_code=400, detail='Unsupported content type')
    
def process_youtube(url, goal_id, config):
    """Process a YouTube video — the full pipeline.
 
    1. Fetch transcript + metadata
    2. Generate note with Claude
    3. Save to database
    4. Embed for search
    5. Return the processed content
 
    This is the same flow as main.py's process_single() but
    returns JSON instead of printing to the terminal.
    """
    try:
        # Step 1: Fetch transcript
        data = fetch_transcript(url, config['youtube_api_key'])

        # Step 2: Generate note with Claude
        result = generate_note(
            api_key=config['api_key'],
            title=data['title'],
            channel=data['channel'],
            transcript=data['transcript'],
            word_count=data['word_count']
        )
        note = result['note']
        usage = result['usage']

        # Step 3: Record costs
        cost_stats = record_usage(usage['input_tokens'], usage['output_tokens'])

        content_id = save_content(
            goal_id=goal_id,
            content_type='youtube',
            url=url,
            title=data['title'],
            source=data['channel'],
            summary=note['summary'],
            key_points=note.get('keyTakeaways', []),
            raw_text=data['transcript'],
            tags=note.get('tags', []),
            cost=cost_stats['call_cost']
        )
 
        # Step 5: Embed for search
        store_embedding(str(content_id), data['title'], note['summary'])

        # Return everything the frontend needs
        return {
            'id': content_id,
            'content_type': 'youtube',
            'title': data['title'],
            'channel': data['channel'],
            'url': url,
            'summary': note['summary'],
            'key_takeaways': note.get('keyTakeaways', []),
            'analogies': note.get('analogies', []),
            'actionable_steps': note.get('actionableSteps', []),
            'chapters': note.get('chapters', []),
            'tags': note.get('tags', []),
            'cost': cost_stats['call_cost'],
            'word_count': data['word_count'],
            'goal_id': goal_id
        }

    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err))
