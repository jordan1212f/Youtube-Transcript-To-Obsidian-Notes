# extractors/paste.py — pasted-text extractor.
#
# No fetching or parsing: the user already gave us the text. We just derive
# a short title and return the normalised shape.

TITLE_MAX = 60


def extract_paste(text):
    """Turn raw pasted text into the normalised extractor dict.

    The title is the first line (or the text) trimmed to ~60 chars.
    """
    clean = (text or '').strip()
    if not clean:
        raise ValueError('No text provided to extract.')

    first_line = clean.splitlines()[0].strip() or clean
    title = first_line[:TITLE_MAX].rstrip()
    if len(first_line) > TITLE_MAX:
        title += '…'

    return {
        'title': title or 'Pasted text',
        'source': 'Pasted text',
        'text': clean,
        'word_count': len(clean.split()),
        'content_type': 'paste',
        'url': None,
    }
