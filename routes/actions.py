# CRUD endpoints for action steps.
# Actions are tied to goals and optionally to saved content.
# They have deadlines, statuses (todo/in_progress/done), and
# power the Focus view on the homepage.

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import (
    create_action, get_actions, update_action_status, delete_action, get_today_focus, get_stats
)


router = APIRouter(tags=['actions'])

class ActionCreate(BaseModel):
    goal_id: int
    title: str
    description: str = ''
    suggested_next_step: str = ''
    deadline: Optional[str] = None
    content_id: Optional[str] = None

class ActionStatusUpdate(BaseModel):
    status: str # 'todo', 'in_progress', 'done' 

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import (
    create_action, get_actions, update_action_status,
    delete_action, skip_action, get_today_focus, get_stats
)

router = APIRouter(tags=['actions'])
 
 
class ActionCreate(BaseModel):
    goal_id: int
    title: str
    description: str = ''
    suggested_next_step: str = ''
    deadline: Optional[str] = None
    content_id: Optional[int] = None
 
 
class ActionStatusUpdate(BaseModel):
    status: str  # 'todo', 'in_progress', 'done'
 
 
# ── Actions CRUD ──

@router.get('/actions')
def list_actions(goal_id: Optional[int] = None, status: Optional[str] = None):
    """Get actions with optional filters.
 
    GET /api/actions              → all actions
    GET /api/actions?goal_id=1    → actions for goal 1
    GET /api/actions?status=todo  → only to-do actions
    """
    return get_actions(goal_id=goal_id, status=status)

@router.post('/actions')
def add_action(action: ActionCreate):
    """Creates a new action step."""
    try: 
        action_id = create_action(
            goal_id=action.goal_id,
            title=action.title,
            description=action.description,
            suggested_next_step=action.suggested_next_step,
            deadline=action.deadline,
            content_id=action.content_id
        ) 
        return {'id': action_id, 'title': action.title, 'stats': 'created'}
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))
    
@router.put('/actions/{action_id}/status')
def change_action_status(action_id: int, update: ActionStatusUpdate):
    """Updates the status of an action.
    
    Valid statuses: 'todo', 'in_progress', 'done'
    When set to 'done', completed_at timestamp is auto-set.
    """
    if update.status not in ('todo', 'in_progress', 'done'):
        raise HTTPException(
            status_code=400,
            detail='Status must be todo, in_progress, or done'
        )
    update_action_status(action_id, update.status)
    return {'id': action_id, 'new_status': update.status}

@router.put('/actions/{action_id}/skip')
def skip_action_route(action_id: int):
    """Skip an action — marks it 'skipped' so it leaves the Focus view.

    Skipped is terminal (like done) but doesn't count as a completion;
    it's excluded from the active and expired stats.
    """
    skip_action(action_id)
    return {'id': action_id, 'new_status': 'skipped'}

@router.delete('/actions/{action_id}')
def remove_action(action_id: int):
    """Delete an action."""
    delete_action(action_id)
    return {'status': 'deleted', 'id': action_id}
 
    
# ── Focus & Stats ──

@router.get('/focus')
def get_focus():
    """Get the most urgent action for the Focus view.
 
    Returns the single most important action based on:
    1. In-progress actions first
    2. Earliest deadline
    3. Most recently created
    """
    focus = get_today_focus()
    if not focus:
        return {'focus': None, 'message': 'No actions found. Add some from your digest to get started.'}
    return {'focus': focus}

@router.get('/stats')
def dashboard_stats():
    """Get dashboard statistics.
 
    Returns: total content, areas, completed/active actions,
    total cost, and current streak.
    """
    return get_stats()