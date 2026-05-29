# routes/digest.py
# Generates the daily digest — summarises what the user saved today
# and suggests actionable steps based on their goals.
#
# The digest is the "magic moment" — it connects content to goals
# and tells the user what to DO, not just what they saved.
 
from fastapi import APIRouter, HTTPException
from datetime import date, datetime
 
from config import load_config
from database import get_saved_content, get_goals, get_goal_areas
from ai import generate_note  # reusing for now, will add digest-specific prompt
from anthropic import Anthropic
from cost import record_usage
import json

router = APIRouter(tags=['digest'])

