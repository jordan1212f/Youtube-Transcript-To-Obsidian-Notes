# extractors/substack.py — Substack (and generic) article extractor.
#
# Substack posts are server-rendered HTML, so a plain requests fetch +
# BeautifulSoup parse is enough — no JS rendering required. The same logic
# works reasonably well for other simple article pages.

import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse

# A browser-like UA — some hosts return a stripped page (or block) the
# default python-requests agent.
HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/124.0.0.0 Safari/537.36'
    ),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}
TIMEOUT = 20

# Block-level tags whose text we keep, in document order, to preserve the
# article's paragraph structure.
BLOCK_TAGS = ['h1', 'h2', 'h3', 'h4', 'p', 'li', 'blockquote']


def extract_substack(url):
    """Fetch and parse a Substack article into the normalised extractor dict."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
    except requests.RequestException as err:
        raise RuntimeError(f'Could not fetch article: {err}')

    soup = BeautifulSoup(resp.text, 'html.parser')

    title = _extract_title(soup)
    source = _extract_author(soup, url)
    text = _extract_body(soup)

    if not text:
        raise RuntimeError('Could not find article body text on the page.')

    return {
        'title': title,
        'source': source,
        'text': text,
        'word_count': len(text.split()),
        'content_type': 'article',
        'url': url,
    }


def _extract_title(soup):
    """Prefer the og:title meta tag, fall back to <h1>, then <title>."""
    og = soup.find('meta', property='og:title')
    if og and og.get('content', '').strip():
        return og['content'].strip()

    h1 = soup.find('h1')
    if h1 and h1.get_text(strip=True):
        return h1.get_text(strip=True)

    if soup.title and soup.title.get_text(strip=True):
        return soup.title.get_text(strip=True)

    return 'Untitled article'


def _extract_author(soup, url):
    """Author from the <meta name="author"> tag, else the subdomain."""
    meta = soup.find('meta', attrs={'name': 'author'})
    if meta and meta.get('content', '').strip():
        return meta['content'].strip()

    # Fallback: the publication subdomain (e.g. platformer.substack.com).
    host = urlparse(url).hostname or ''
    labels = [label for label in host.split('.') if label and label != 'www']
    if labels:
        return labels[0].replace('-', ' ').title()

    return 'Unknown author'


def _extract_body(soup):
    """Pull the article body text, preserving paragraph breaks.

    Substack renders the post inside `div.body` (often `div.body.markup`),
    with `div.available-content` wrapping it; fall back to <article>.
    """
    container = (
        soup.select_one('div.body.markup')
        or soup.select_one('div.available-content')
        or soup.select_one('div.body')
        or soup.find('article')
    )
    if container is None:
        return ''

    blocks = []
    for el in container.find_all(BLOCK_TAGS):
        chunk = el.get_text(' ', strip=True)
        if chunk:
            blocks.append(chunk)

    if blocks:
        return '\n\n'.join(blocks)

    # Last resort: the whole container's text.
    return container.get_text('\n\n', strip=True)
