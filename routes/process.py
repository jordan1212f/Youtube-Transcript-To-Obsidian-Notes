# routes/process.py
# Processes content from URLs or pasted text — YouTube, X/Twitter, Substack
# articles, PDFs, and pasted text. Extraction is delegated to the extractors/
# module so this endpoint stays source-agnostic: extract → summarise → save →
# embed → return.

import os
import tempfile

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
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

# Reasonable cap for V1 uploads.
MAX_UPLOAD_BYTES = 20 * 1024 * 1024  # 20 MB


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
        except RuntimeError as err:
            # extractor couldn't fetch or parse the content
            raise HTTPException(status_code=502, detail=str(err))

    elif request.url:
        content_type = request.content_type or detect_content_type(request.url)
        try:
            data = extract(content_type, url=request.url)
        except NotImplementedError as err:
            raise HTTPException(status_code=501, detail=str(err))
        except ValueError as err:
            raise HTTPException(status_code=400, detail=str(err))
        except RuntimeError as err:
            # extractor couldn't fetch or parse the content
            raise HTTPException(status_code=502, detail=str(err))

    else:
        raise HTTPException(
            status_code=400,
            detail='Provide either a url or text to process.'
        )

    return process_extracted(data, request.goal_id, config)


@router.post('/process/upload')
async def process_upload(
    file: UploadFile = File(...),
    goal_id: Optional[int] = Form(None),
):
    """Process an uploaded PDF and save the result.

    Multipart form: a `file` (PDF) and an optional `goal_id`. The file is
    written to a temp file, run through the PDF extractor, then the same
    extract → summarise → save → embed pipeline as the URL/text endpoint.
    """
    # 1. Validate it's a PDF (by extension or content type).
    filename = file.filename or ''
    is_pdf = filename.lower().endswith('.pdf') or file.content_type == 'application/pdf'
    if not is_pdf:
        raise HTTPException(
            status_code=400,
            detail='Only PDF files are supported. Please upload a .pdf file.',
        )

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail='The uploaded file is empty.')
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail='File too large. The maximum upload size is 20MB.',
        )

    config = load_config()

    # 2. Save to a temp file, keeping the original name so the extractor can
    #    use it for the title.
    tmpdir = tempfile.mkdtemp(prefix='clarity_pdf_')
    tmp_path = os.path.join(tmpdir, os.path.basename(filename) or 'document.pdf')
    try:
        with open(tmp_path, 'wb') as out:
            out.write(contents)

        # 3. Extract.
        try:
            data = extract('pdf', file=tmp_path)
        except ValueError as err:
            raise HTTPException(status_code=400, detail=str(err))
        except RuntimeError as err:
            # encrypted, corrupt, or image-only PDF
            raise HTTPException(status_code=422, detail=str(err))

        # 4. Same pipeline as the URL/text endpoint.
        return process_extracted(data, goal_id, config)
    finally:
        # 5. Clean up the temp file + dir.
        try:
            os.remove(tmp_path)
        except OSError:
            pass
        try:
            os.rmdir(tmpdir)
        except OSError:
            pass


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
