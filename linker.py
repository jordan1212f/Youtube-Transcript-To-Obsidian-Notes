import re
from pathlib import Path
from stopwords import STOP_WORDS
from ui import PURPLE, GREEN, RED, RESET

def scan_vault(vault_path):
    """
    Scans the vault folder for existing notes, read .mds, and return a list of dictionaries
    containing title + tags
    """
    notes_dir = Path(vault_path) / 'Youtube Notes'\
    
    if not notes_dir.exists():
        return []
    notes = []

    #rglob('*md') find all .md files in all subfolders.
    for filepath in notes_dir.rglob('*.md'):
        frontmatter = parse_frontmatter(filepath)
        if frontmatter:
            notes.append({
                'title' : frontmatter.get('title', ''),
                'tags' : frontmatter.get('tags', []),
                'filename' : filepath.name,
                'path' : str(filepath)
            })
    return notes
    
def parse_frontmatter(filepath):
    """
    Extract title + tags from a note's YAML frontmatter. Parses between the --- 
    Returns a dict with 'title' and 'tags
    """
    try:
        text = filepath.read_text(encoding = 'utf-8')
    except Exception:
        return None
                
    if not text.startswith('---'):
        return None
        
    parts = text.split('---', 2)
    if len(parts) < 3:
        return None
        
        
    frontmatter_text = parts[1]
    result = {}
    
    for line in frontmatter_text.strip().split('\n'):
        if line.startswith('title'):
            result['title'] = line.split(':', 1)[1].strip().strip('"')

        if line.startswith('tags'):
            tags_str = line.split(':', 1)[1].strip()
            tags_str = tags_str.strip('[]')
            result['tags'] = [t.strip() for t in tags_str.split(',') if t.strip()]

    return result if result else None

def keyword_filter(new_note, existing_notes, max_candidates):
    """
    Filter notes via tags and title words

    Scores each notes baed on tags + title word frequency shared with new notes.
    Returns top candidates sorted by score.

    Args:
    new_note (dict): A dictionary containing 'title' and 'tags' for the new note.
    existing_notes: list of note dicts from scan_vault()
    max_candidates (int): how many to return (from config)

    Returns:
    List of note dicts sorted via relevance scores
    Trimed to max_candidates and each dict gets a score and shared tags_field added
    """

    new_tags = set(tag.lower() for tag in new_note.get('tags', []))
    new_title_words = set(
        word.lower() for word in re.findall(r'\w+', new_note.get('title', ''))
        if word.lower() not in STOP_WORDS
    )

    scored = []

    for note in existing_notes:
        if note['title'] == new_note.get('title', ''):
            continue

        existing_tags = set(tag.lower() for tag in note.get('tags', []))  
        existing_title_words = set(
            word.lower() for word in re.findall(r'\w+', note.get('title', ''))
            if word.lower() not in STOP_WORDS
        )

        shared_tags = new_tags & existing_tags
        shared_title_words = new_title_words & existing_title_words

        score = (len(shared_tags) * 2) + len(shared_title_words)

        if score > 0:
            note_with_score = dict(note)
            note_with_score['score'] = score
            note_with_score['shared_tags'] = list(shared_tags)
            scored.append(note_with_score)

    scored.sort(key=lambda n: n['score'], reverse=True)
    return scored[:max_candidates]


def insert_inline_links(markdown, linked_titles):
    """
    Insert [[wiki links]] on the first mention of each linked note title
    Searches the note body (not frontmatter) for each title. Only replaces first occurence to avoid cluttering

    Args: 
        Markdown: full md string of new note
        Linked_titles: List of title strings to link

    Returns:
        The markdown string with [[links]] inserted 
    """

    parts = markdown.split('---', 2)
    if len(parts) < 3:
        return markdown
    
    frontmatter = parts[1]
    body = parts[2]

    for title in linked_titles:
        pattern = re.compile(re.escape(title), re.IGNORECASE)
        body = pattern.sub(f'[[{title}]]', body, count=1)

    return f'---{frontmatter}---{body}'

def build_related_section(linked_notes):
    """
    Builds a related note section under each note
    Args:
        Linked_notes: list of dicts with title and reason

    Returns: 
        A markdown string ## Related Notes

        - [[How Compound Interest Works]] — directly related concept
        - [[Building Wealth in Your 20s]] — both cover long-term finance
    """
    lines = ['## 🔗 Related Notes', '']
    for note in linked_notes:
        lines.append(f'- [[{note["title"]}]] - {note["reason"]}')
    lines.append('')
    return '\n'.join(lines)
    #! Fix: em dash is not a regular hyphen

def append_backlink(filepath, new_note_title):
    """Add a backlink to an existing note's Related Notes section.
 
    If the note already has a Related Notes section, appends to it.
    If not, adds a new section before the footer.
 
    This is append-only — it never removes existing links.
 
    Args:
        filepath: Path to the existing note file
        new_note_title: Title of the new note to link back to
    """
    path = Path(filepath)
    text = path.read_text(encoding='utf-8')

    backlink_line = f'- [[{new_note_title}]]'

    if backlink_line in text:
        return
    
    if '## Related Notes' in text:
        #Section exist == append the new link after header
        #Find the section and insert a link after final bullet

        lines = text.split('\n')
        insert_index = None

        for i, line in enumerate(lines):
            if line.startswith('## 🔗 Related Notes'):
                insert_index = i + 1
                while insert_index < len(lines) and (
                    lines[insert_index].startswith('- ') or
                    lines[insert_index].strip() == ''
                ):
                    insert_index += 1
                break
        if insert_index is not None:
            lines.insert(insert_index, backlink_line)
            text = '\n'.join(lines)
        else:

            text += f'\n\n'## 🔗 Related Notes'\n\n{backlink_line}\n'

    path.write_text(text, encoding='utf-8')

def display_proposed_links(linked_notes):
    """Show the user which notes will be linked and why.
 
    Args:
        linked_notes: List of dicts with 'title' and 'reason'
 
    Returns:
        True if user confirms, False if they decline
    """
    print(f'\n{PURPLE}🔗 Found {len(linked_notes)} related notes:{RESET}\n')
 
    for i, note in enumerate(linked_notes, start=1):
        print(f'  {i}. {note["title"]} — {note["reason"]}')
 
    print()
    confirm = input('  Apply these links? [Y/n] ').strip().lower()
    return confirm != 'n'