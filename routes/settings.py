from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from config import config_exists, load_config, save_config

router = APIRouter(tags=['settings'])


class SettingsUpdate(BaseModel):
    vault_path: Optional[str] = None
    api_key: Optional[str] = None
    youtube_api_key: Optional[str] = None
    link_candidates: Optional[int] = None
    search_results: Optional[int] = None
    digest_time: Optional[str] = None


@router.get('/settings')
def get_settings():
    if not config_exists():
        return {'configured': False}

    config = load_config()
    masked = dict(config)
    if 'api_key' in masked and masked['api_key']:
        key = masked['api_key']
        masked['api_key'] = key[:10] + '•' * 10
    if 'youtube_api_key' in masked and masked['youtube_api_key']:
        key = masked['youtube_api_key']
        masked['youtube_api_key'] = key[:6] + '•' * 10

    masked['configured'] = True
    return masked


@router.put('/settings')
def update_settings(updates: SettingsUpdate):
    if config_exists():
        config = load_config()
    else:
        config = {}

    changes = updates.model_dump(exclude_none=True)
    config.update(changes)
    save_config(config)
    return {'status': 'updated', 'fields': list(changes.keys())}