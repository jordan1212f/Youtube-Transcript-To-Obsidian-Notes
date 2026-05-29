# routes/onboarding.py
# Endpoints for the first-run onboarding flow.
# V1 is single-user, so all reads/writes target user_profile id=1.

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from database import is_onboarded, get_user_profile, save_onboarding

router = APIRouter(tags=['onboarding'])

VALID_DIGEST_TIMES = {'morning', 'afternoon', 'evening'}


# ── Pydantic models for request validation ──

class OnboardingPayload(BaseModel):
    name: str
    problem_statements: List[str]
    goal_ids: List[int]
    digest_time: str


# ── Static presets (drives the onboarding UI) ──

ONBOARDING_PRESETS = {
    'problem_statements': [
        'I save videos but never act on them',
        'I have goals but no clear system to reach them',
        'I consume a lot of content but don\'t retain anything',
        'I start things but struggle to finish them',
    ],
    'goal_categories': [
        {'id': 'career',   'name': 'Career & Skills',     'icon': 'briefcase'},
        {'id': 'health',   'name': 'Health & Fitness',    'icon': 'heart'},
        {'id': 'finance',  'name': 'Money & Finance',     'icon': 'trending-up'},
        {'id': 'learning', 'name': 'Learning & Growth',   'icon': 'book-open'},
        {'id': 'creative', 'name': 'Creative Projects',   'icon': 'palette'},
        {'id': 'mindset',  'name': 'Mindset & Habits',    'icon': 'brain'},
    ],
    'digest_times': [
        {'id': 'morning',   'label': 'Morning',   'time': '8:00 AM'},
        {'id': 'afternoon', 'label': 'Afternoon', 'time': '1:00 PM'},
        {'id': 'evening',   'label': 'Evening',   'time': '7:00 PM'},
    ],
}


# ── Endpoints ──

@router.get('/onboarding/presets')
def onboarding_presets():
    """Return the static option lists used to render the onboarding flow."""
    return ONBOARDING_PRESETS


@router.get('/onboarding/status')
def onboarding_status():
    """Check whether the user has completed onboarding."""
    return {'onboarded': is_onboarded()}


@router.get('/onboarding/profile')
def onboarding_profile():
    """Get the saved user profile, or 404 if not onboarded."""
    profile = get_user_profile()
    if profile is None:
        raise HTTPException(status_code=404, detail='User has not onboarded')
    return profile


@router.post('/onboarding')
def submit_onboarding(payload: OnboardingPayload):
    """Save the onboarding response and mark the user as onboarded."""
    if payload.digest_time not in VALID_DIGEST_TIMES:
        raise HTTPException(
            status_code=400,
            detail=f'digest_time must be one of {sorted(VALID_DIGEST_TIMES)}'
        )

    save_onboarding(payload.model_dump())
    return {'status': 'ok', 'onboarded': True}
