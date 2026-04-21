import re
from pathlib import Path

def clean_title(title):
    """Turn a video title into a safe, clean filename.
 
    'How to Build a CLI Tool! (2026 Edition)'
    becomes: 'how-to-build-a-cli-tool-2026-edition'
 
    1. Lowercase everything
    2. Strip anything that isn't a letter, number, space, or hyphen
    3. Replace spaces with hyphens
    4. Collapse multiple hyphens into one (e.g. 'a--b' → 'a-b')
    5. Trim to 80 characters max
    """

    clean = title.lower()
    clean = re.sub(r'[^a-z0-9\s-]', '', clean)
    clean = clean.strip().replace(' ', '-')
    clean = re.sub(r'-+', '-', clean)
    return clean[:80]

def category_from_tags(tags):
    if not tags:
        return 'Uncategorised'
    return tags[0].title()


def save_note(vault_path, title, tags, markdown):
    """
    Args:
        vault_path: Root path of the Obsidian vault (from config)
        title: Video title (used to generate filename)
        tags: List of tags (first one becomes the folder)
        markdown: The complete Markdown string to write
 
    Returns:
        The full file path as a string (for the console output)
    """
    category = category_from_tags(tags)
    filename = clean_title(title) + '.md'
 
    # Build the full path: vault/YouTube Notes/Python/how-to-build-a-cli.md
    folder = Path(vault_path) / 'YouTube Notes' / category
    filepath = folder / filename
 
    # Create all folders in the path if they don't exist
    folder.mkdir(parents=True, exist_ok=True)
 
    # Write the Markdown string to the file
    filepath.write_text(markdown, encoding='utf-8')
 
    return str(filepath)
