# extractors/twitter.py — X / Twitter post extractor.
#
# X is a JS-rendered SPA, so a plain requests fetch of the tweet URL returns
# an empty shell with no tweet text. Instead we use Twitter's public oEmbed
# endpoint (publish.twitter.com/oembed), which needs no auth and returns the
# tweet text wrapped in a small blob of HTML that we parse with BeautifulSoup.

import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse

OEMBED_URL = 'https://publish.twitter.com/oembed'

HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/124.0.0.0 Safari/537.36'
    ),
    'Accept': 'application/json',
}
TIMEOUT = 20
TITLE_MAX = 60


def extract_twitter(url):
    """Fetch an X / Twitter post via oEmbed into the normalised extractor dict.

    Raises:
        RuntimeError: the post couldn't be fetched (deleted, protected, or a
                      network error) or contained no readable text.
    """
    params = {
        'url': url,
        'omit_script': 'true',  # we only want the text, not the embed widget
        'dnt': 'true',
    }
    try:
        resp = requests.get(
            OEMBED_URL, params=params, headers=HEADERS, timeout=TIMEOUT
        )
        resp.raise_for_status()
    except requests.RequestException as err:
        # 404 here usually means the tweet is deleted, protected, or the
        # account is suspended — oEmbed only serves public posts.
        raise RuntimeError(
            f'Could not fetch the post (it may be deleted or protected): {err}'
        )

    try:
        payload = resp.json()
    except ValueError as err:
        raise RuntimeError(f'Unexpected response from Twitter oEmbed: {err}')

    text = _extract_text(payload.get('html', ''))
    if not text:
        raise RuntimeError('Could not find any text in the post.')

    author = payload.get('author_name', '').strip()
    handle = _handle_from_author_url(payload.get('author_url', ''))
    source = _format_source(author, handle)

    return {
        'title': _title_from_text(text, author, handle),
        'source': source,
        'text': text,
        'word_count': len(text.split()),
        'content_type': 'tweet',
        'url': url,
    }


def _extract_text(html):
    """Pull the tweet body out of the oEmbed HTML blockquote.

    The payload looks like:
        <blockquote ...><p>tweet text<br>more text <a>link</a></p>
        &mdash; Author (@handle) <a>date</a></blockquote>

    We want only the <p> — the trailing "&mdash; Author …" is attribution,
    which we capture separately as `source`.
    """
    if not html:
        return ''

    soup = BeautifulSoup(html, 'html.parser')
    p = soup.find('p')
    if p is None:
        return ''

    # <br> doesn't survive get_text() as a newline, so swap them in first to
    # preserve the tweet's own line breaks.
    for br in p.find_all('br'):
        br.replace_with('\n')

    return p.get_text().strip()


def _handle_from_author_url(author_url):
    """Pull the @handle out of an author_url like twitter.com/jack."""
    if not author_url:
        return ''
    path = urlparse(author_url).path.strip('/')
    return path.split('/')[0] if path else ''


def _format_source(author, handle):
    """Human-readable author label, e.g. 'Jack (@jack)'."""
    if author and handle:
        return f'{author} (@{handle})'
    if author:
        return author
    if handle:
        return f'@{handle}'
    return 'Unknown author'


def _title_from_text(text, author, handle):
    """Tweets have no title, so use the first line trimmed to ~60 chars."""
    first_line = text.splitlines()[0].strip() if text else ''
    if first_line:
        title = first_line[:TITLE_MAX].rstrip()
        if len(first_line) > TITLE_MAX:
            title += '…'
        return title

    label = handle or author
    return f'Tweet by @{label}' if label else 'Tweet'
