# database.py
# SQLite database for goals, actions, and saved content.
# Stored at ~/.yt-note/obsiditube.db alongside config and embeddings.
#
# Tables:
#   goal_areas    — top-level categories (Career, Health, Finance, etc.)
#   goals         — specific goals under each area
#   saved_content — processed content (YouTube, tweets, articles, PDFs)
#   actions       — actionable steps linked to goals and content
#   digests       — daily digest history

import sqlite3
import json
from pathlib import Path
from datetime import datetime, date

DB_PATH = Path.home() / '.yt-note' / 'obsiditube.db'

def get_db():
    """Get a database connection with sensible defaults.
 
    row_factory = sqlite3.Row makes query results behave like dicts
    so you can do row['title'] instead of row[1].
 
    PRAGMA foreign_keys = ON enforces relationships between tables.
    Without this, SQLite silently allows orphaned rows.
    """
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA foreign_keys = ON')
    return conn

def init_db():
    """
    Called once when the server starts. Safe to call multiple times
    because of IF NOT EXISTS.
    """
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS goal_areas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            icon TEXT DEFAULT '🎯',
            color TEXT DEFAULT '#818CF8',
            created_at TEXT DEFAULT (datetime('now'))
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            area_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            archived INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (area_id) REFERENCES goal_areas(id) ON DELETE CASCADE
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS saved_content (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            goal_id INTEGER,
            content_type TEXT NOT NULL,
            url TEXT,
            title TEXT NOT NULL,
            source TEXT DEFAULT '',
            summary TEXT DEFAULT '',
            key_points TEXT DEFAULT '[]',
            raw_text TEXT DEFAULT '',
            tags TEXT DEFAULT '[]',
            cost REAL DEFAULT 0.0,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE SET NULL
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS actions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            goal_id INTEGER NOT NULL,
            content_id INTEGER,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            suggested_next_step TEXT DEFAULT '',
            deadline TEXT,
            status TEXT DEFAULT 'todo',
            created_at TEXT DEFAULT (datetime('now')),
            completed_at TEXT,
            FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
            FOREIGN KEY (content_id) REFERENCES saved_content(id) ON DELETE SET NULL
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS digests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            digest_date TEXT NOT NULL UNIQUE,
            content TEXT DEFAULT '{}',
            created_at TEXT DEFAULT (datetime('now'))
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_profile (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT DEFAULT '',
            problem_statements TEXT DEFAULT '[]',
            goal_ids TEXT DEFAULT '[]',
            digest_time TEXT DEFAULT 'evening',
            onboarded_at TEXT DEFAULT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        )
    ''')

    conn.commit()
    conn.close()

# ──────────────────────────────────────────
# Goal Areas
# ──────────────────────────────────────────

def create_goal_area(name, icon='🎯', color='#818CF8'):
    """Create a new goal area (e.g. Career, Health, Finance)."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO goal_areas (name, icon, color) VALUES (?, ?, ?)',
        (name, icon, color)
    )
    conn.commit()
    area_id = cursor.lastrowid
    conn.close()
    return area_id

def get_goal_areas():
    """Get all goal areas with their goal counts."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT ga.*, COUNT(g.id) as goal_count
        FROM goal_areas ga
        LEFT JOIN goals g ON g.area_id = ga.id AND g.archived = 0
        GROUP BY ga.id
        ORDER BY ga.created_at
    ''')
    areas = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return areas

def delete_goal_area(area_id):
    """Delete a goal area and all its goals/actions (CASCADE)."""
    conn = get_db()
    conn.execute('DELETE FROM goal_areas WHERE id = ?', (area_id,))
    conn.commit()
    conn.close()

# ──────────────────────────────────────────
# Goals
# ──────────────────────────────────────────

def create_goal(area_id, title, description=''):
    """Create a specific goal under an area."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO goals (area_id, title, description) VALUES (?, ?, ?)',
        (area_id, title, description)
    )
    conn.commit()
    goal_id = cursor.lastrowid
    conn.close()
    return goal_id

def get_goals(area_id=None):
    """Get goals, optionally filtered by area."""
    conn = get_db()
    cursor = conn.cursor()

    if area_id:
        cursor.execute('''
            SELECT g.*, ga.name as area_name, ga.color as area_color,
                   COUNT(DISTINCT sc.id) as content_count,
                   COUNT(DISTINCT a.id) as action_count
            FROM goals g
            JOIN goal_areas ga ON ga.id = g.area_id
            LEFT JOIN saved_content sc ON sc.goal_id = g.id
            LEFT JOIN actions a ON a.goal_id = g.id
            WHERE g.area_id = ? AND g.archived = 0
            GROUP BY g.id
            ORDER BY g.created_at
        ''', (area_id,))

    else:
        cursor.execute('''
            SELECT g.*, ga.name as area_name, ga.color as area_color,
                   COUNT(DISTINCT sc.id) as content_count,
                   COUNT(DISTINCT a.id) as action_count
            FROM goals g
            JOIN goal_areas ga ON ga.id = g.area_id
            LEFT JOIN saved_content sc ON sc.goal_id = g.id
            LEFT JOIN actions a ON a.goal_id = g.id
            WHERE g.archived = 0
            GROUP BY g.id
            ORDER BY g.created_at
        ''')

    goals = [dict(row) for row in cursor.fetchall()]
    conn.close
    return goals

def archive_goal(goal_id):
    """Soft-delete a goal by archiving it."""
    conn = get_db()
    conn.execute('UPDATE goals SET archived = 1 WHERE id = ?', (goal_id,))
    conn.commit()
    conn.close()

# ──────────────────────────────────────────
# Saved Content
# ──────────────────────────────────────────

def save_content(goal_id, content_type, url, title, source, summary, key_points, raw_text, tags, cost):
    """Save a processed piece of content to the database."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO saved_content
        (goal_id, content_type, url, title, source, summary, key_points, raw_text, tags, cost)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        goal_id, content_type, url, title, source, summary,
        json.dumps(key_points), raw_text, json.dumps(tags), cost
    ))
    conn.commit()
    content_id = cursor.lastrowid
    conn.close()
    return content_id

def get_saved_content(goal_id=None, content_type=None, limit=50):
    """Get saved content with optimal filters."""
    conn = get_db()
    cursor = conn.cursor()

    query = 'SELECT * FROM saved_content where 1=1'
    params = []

    if goal_id:
        query += ' AND goal_id = ?'
        params.append(goal_id)
    if content_type:
        query += ' AND content_type = ?'
        params.append(content_type)

    query += ' ORDER BY created_at DESC LIMIT ?'
    params.append(limit)

    cursor.execute(query, params)
    content = [dict(row) for row in cursor.fetchall()]

    for item in content:
        item['key_points'] = json.loads(item.get('key_points', '[]'))
        item['tags'] = json.loads(item.get('tags', '[]'))

    conn.close()
    return content

def get_content_by_id(content_id):
    """Get a single piece of content by ID."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM saved_content WHERE id = ?', (content_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None
    
    item = dict(row)
    item['key_points'] = json.loads(item.get('key_points', '[]'))
    item['tags'] = json.loads(item.get('tags', '[]'))
    return item

# ──────────────────────────────────────────
# Actions
# ──────────────────────────────────────────

def create_action(goal_id, title, description='', suggested_next_step='', deadline=None, content_id=None):
    """Create an action step linked to a goal."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO actions
        (goal_id, content_id, title, description, suggested_next_step, deadline)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (goal_id, content_id, title, description, suggested_next_step, deadline))
    conn.commit()
    action_id = cursor.lastrowid
    conn.close()
    return action_id

def get_actions(goal_id=None, status=None):
    """Get actions with optional filters."""
    conn = get_db()
    cursor = conn.cursor()
 
    query = '''
        SELECT a.*, g.title as goal_title, ga.name as area_name, ga.color as area_color
        FROM actions a
        JOIN goals g ON g.id = a.goal_id
        JOIN goal_areas ga ON ga.id = g.area_id
        WHERE 1=1
    '''
    params = []
 
    if goal_id:
        query += ' AND a.goal_id = ?'
        params.append(goal_id)
    if status:
        query += ' AND a.status = ?'
        params.append(status)
 
    query += ' ORDER BY a.deadline ASC NULLS LAST, a.created_at DESC'
 
    cursor.execute(query, params)
    actions = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return actions

def update_action_status(action_id, status):
    """Update an action's status (todo, in_progress, done)."""
    conn = get_db()
    completed_at = datetime.now().isoformat() if status == 'done' else None
    conn.execute(
        'UPDATE actions SET status = ?, completed_at = ? WHERE id = ?',
        (status, completed_at, action_id)
    )
    conn.commit()
    conn.close()

def delete_action(action_id):
    """Delete an action."""
    conn = get_db()
    conn.execute('DELETE FROM actions WHERE id = ?', (action_id,))
    conn.commit()
    conn.close()

def get_today_focus():
    """Get the most urgent incomplete action for the focus view.
 
    Priority order:
    1. Actions with deadlines, soonest first
    2. In-progress actions before to-do actions
    3. Most recently created
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT a.*, g.title as goal_title, ga.name as area_name, ga.color as area_color
        FROM actions a
        JOIN goals g ON g.id = a.goal_id
        JOIN goal_areas ga ON ga.id = g.area_id
        WHERE a.status != 'done'
        ORDER BY
            CASE WHEN a.status = 'in_progress' THEN 0 ELSE 1 END,
            CASE WHEN a.deadline IS NOT NULL THEN 0 ELSE 1 END,
            a.deadline ASC,
            a.created_at DESC
        LIMIT 1
    ''')
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

# ──────────────────────────────────────────
# Stats
# ──────────────────────────────────────────

def get_stats():
    """Get dashboard statistics."""
    conn = get_db()
    cursor = conn.cursor()
 
    stats = {}
 
    cursor.execute('SELECT COUNT(*) FROM saved_content')
    stats['total_content'] = cursor.fetchone()[0]
 
    cursor.execute('SELECT COUNT(*) FROM goal_areas')
    stats['total_areas'] = cursor.fetchone()[0]
 
    cursor.execute('SELECT COUNT(*) FROM actions WHERE status = "done"')
    stats['completed_actions'] = cursor.fetchone()[0]
 
    cursor.execute('SELECT COUNT(*) FROM actions WHERE status != "done"')
    stats['active_actions'] = cursor.fetchone()[0]
 
    cursor.execute('SELECT COALESCE(SUM(cost), 0) FROM saved_content')
    stats['total_cost'] = round(cursor.fetchone()[0], 4)
 
    # Streak calculation — consecutive days with at least one action completed
    cursor.execute('''
        SELECT DISTINCT date(completed_at) as d
        FROM actions
        WHERE status = 'done' AND completed_at IS NOT NULL
        ORDER BY d DESC
    ''')
    dates = [row[0] for row in cursor.fetchall()]
    stats['streak'] = calculate_streak(dates)
 
    conn.close()
    return stats


def calculate_streak(date_strings):
    """Calculate consecutive day streak from a list of date strings.
 
    ['2026-05-12', '2026-05-11', '2026-05-10', '2026-05-08']
    → streak of 3 (today, yesterday, day before — gap on the 8th breaks it)
    """
    if not date_strings:
        return 0
 
    today = date.today()
    streak = 0
 
    for d_str in date_strings:
        d = date.fromisoformat(d_str)
        expected = today - __import__('datetime').timedelta(days=streak)
        if d == expected:
            streak += 1
        else:
            break

    return streak

# ──────────────────────────────────────────
# User Profile
# ──────────────────────────────────────────

def save_onboarding(data):
    """Insert or replace the single user profile row.

    V1 is single-user, so we always write to id=1. `data` is a dict with
    keys: name, problem_statements (list), goal_ids (list), digest_time.
    Lists are stored as JSON strings. onboarded_at is set to now.
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT OR REPLACE INTO user_profile
        (id, name, problem_statements, goal_ids, digest_time, onboarded_at)
        VALUES (1, ?, ?, ?, ?, datetime('now'))
    ''', (
        data.get('name', ''),
        json.dumps(data.get('problem_statements', [])),
        json.dumps(data.get('goal_ids', [])),
        data.get('digest_time', 'evening'),
    ))
    conn.commit()
    conn.close()

def get_user_profile():
    """Get the user profile row, or None if not onboarded.

    Parses problem_statements and goal_ids from JSON strings back to lists.
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM user_profile WHERE id = 1')
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    profile = dict(row)
    profile['problem_statements'] = json.loads(profile.get('problem_statements', '[]'))
    profile['goal_ids'] = json.loads(profile.get('goal_ids', '[]'))
    return profile

def is_onboarded():
    """Return True if a user profile row exists with onboarded_at set."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        'SELECT 1 FROM user_profile WHERE id = 1 AND onboarded_at IS NOT NULL'
    )
    row = cursor.fetchone()
    conn.close()
    return row is not None
