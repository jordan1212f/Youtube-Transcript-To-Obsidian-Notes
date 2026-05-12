# routes/goals.py
# CRUD endpoints for goal areas and specific goals.
# Goal areas are top-level categories (Career, Health, Finance).
# Goals are specific objectives under each area.

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import (
    create_goal_area, get_goal_areas, delete_goal_area,
    create_goal, get_goals, archive_goal
)

router = APIRouter(tags=['goals'])


# ── Pydantic models for request validation ──

class GoalAreaCreate(BaseModel):
    name: str
    icon: str = '🎯'
    color: str = '#818CF8'


class GoalCreate(BaseModel):
    area_id: int
    title: str
    description: str = ''


# ── Goal Areas ──

@router.get('/goal-areas')
def list_goal_areas():
    """Get all goal areas with their goal counts."""
    return get_goal_areas()


@router.post('/goal-areas')
def add_goal_area(area: GoalAreaCreate):
    """Create a new goal area."""
    try:
        area_id = create_goal_area(area.name, area.icon, area.color)
        return {'id': area_id, 'name': area.name, 'status': 'created'}
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))


@router.delete('/goal-areas/{area_id}')
def remove_goal_area(area_id: int):
    """Delete a goal area and all its goals/actions."""
    delete_goal_area(area_id)
    return {'status': 'deleted', 'id': area_id}


# ── Goals ──

@router.get('/goals')
def list_goals(area_id: Optional[int] = None):
    """Get all goals, optionally filtered by area.

    The area_id query parameter is optional:
    GET /api/goals         → all goals
    GET /api/goals?area_id=1  → goals in area 1
    """
    return get_goals(area_id=area_id)


@router.post('/goals')
def add_goal(goal: GoalCreate):
    """Create a specific goal under an area."""
    try:
        goal_id = create_goal(goal.area_id, goal.title, goal.description)
        return {'id': goal_id, 'title': goal.title, 'status': 'created'}
    except Exception as err:
        raise HTTPException(status_code=400, detail=str(err))


@router.delete('/goals/{goal_id}')
def remove_goal(goal_id: int):
    """Archive a goal (soft delete)."""
    archive_goal(goal_id)
    return {'status': 'archived', 'id': goal_id}