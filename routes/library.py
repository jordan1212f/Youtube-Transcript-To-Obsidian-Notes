from fastapi import APIRouter
from typing import Optional
from database import get_saved_content, get_content_by_id

router = APIRouter(tags=['library'])

@router.get('/library')
def list_content(goal_id: Optional[int] = None, content_type: Optional[str] = None, limit: int = 25):
    """Get all saved content with optional filters.
 
    GET /api/library                          → all content
    GET /api/library?goal_id=1                → content for goal 1
    GET /api/library?content_type=youtube     → only YouTube videos
    GET /api/library?limit=10                 → only 10 most recent
    """
    return get_saved_content(goal_id=goal_id, content_type=content_type, limit=limit)

@router.get('/library/{content_id}')
def get_content(content_id: int):
    """Get a single piece of content by ID with full details."""
    content = get_content_by_id(content_id)
    if not content:
        return {'error': 'Content not found'}
    return content