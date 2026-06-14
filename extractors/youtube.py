# extractors/youtube.py — YouTube extractor.
#
# Thin wrapper over transcript.fetch_transcript that reshapes the result
# into the normalised extractor dict. transcript.py is left untouched so
# the CLI (main.py, batch.py) keeps using it directly.

from config import load_config
from transcript import fetch_transcript


def extract_youtube(url, youtube_api_key=None):
    """Fetch a YouTube transcript and return the normalised extractor dict.

    Args:
        url: full YouTube URL
        youtube_api_key: optional; loaded from config when omitted

    Returns the normalised shape described in extractors/__init__.py.
    """
    if youtube_api_key is None:
        youtube_api_key = load_config()['youtube_api_key']

    data = fetch_transcript(url, youtube_api_key)

    return {
        'title': data['title'],
        'source': data['channel'],
        'text': data['transcript'],
        'word_count': data['word_count'],
        'content_type': 'youtube',
        'url': url,
    }
