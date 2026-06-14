# extractors/ — content extraction for every supported source type.
#
# Every extractor returns the SAME normalised shape so the rest of the
# pipeline (ai.generate_summary, save_content, embeddings) is source-agnostic:
#
#   {
#       "title": str,         # content title, or first ~60 chars for paste
#       "source": str,        # channel / author / domain / "Pasted text"
#       "text": str,          # raw content for Claude to summarise
#       "word_count": int,
#       "content_type": str,  # "youtube" | "tweet" | "article" | "pdf" | "paste"
#       "url": str | None
#   }

from .youtube import extract_youtube
from .paste import extract_paste
from .substack import extract_substack

# Types we intend to support but haven't built extractors for yet.
NOT_IMPLEMENTED_TYPES = {'tweet', 'pdf'}


def extract(content_type, url=None, text=None, file=None):
    """Route to the right extractor and return the normalised dict.

    Args:
        content_type: one of youtube | tweet | article | pdf | paste
        url:  source URL (for youtube / tweet / article)
        text: raw text (for paste)
        file: uploaded file object (for pdf — not implemented yet)

    Raises:
        ValueError: unknown content type or missing required input
        NotImplementedError: a recognised type whose extractor isn't built yet
    """
    if content_type == 'youtube':
        if not url:
            raise ValueError('A url is required to extract a YouTube video.')
        return extract_youtube(url)

    if content_type == 'paste':
        if text is None:
            raise ValueError('text is required for paste content.')
        return extract_paste(text)

    if content_type == 'article':
        if not url:
            raise ValueError('A url is required to extract an article.')
        return extract_substack(url)

    if content_type in NOT_IMPLEMENTED_TYPES:
        raise NotImplementedError(
            f"Extractor for '{content_type}' is not implemented yet."
        )

    raise ValueError(f'Unknown content type: {content_type}')


__all__ = [
    'extract',
    'extract_youtube',
    'extract_paste',
    'extract_substack',
    'NOT_IMPLEMENTED_TYPES',
]
