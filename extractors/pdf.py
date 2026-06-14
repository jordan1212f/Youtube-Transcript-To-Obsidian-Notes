# extractors/pdf.py — PDF file extractor.
#
# Uses pdfplumber (over pdfminer.six) to pull the text layer out of an
# uploaded PDF. No OCR — image-only / scanned PDFs have no text layer and
# are rejected with a clear message.

import os
import pdfplumber

# Below this, the PDF almost certainly has no real text layer (scanned image).
MIN_WORDS = 50


def extract_pdf(file, filename=None):
    """Extract text from a PDF into the normalised extractor dict.

    Args:
        file: a filesystem path (str) or a binary file-like object
        filename: original filename for the title; falls back to the path's
                  basename, then "Untitled PDF"

    Raises:
        RuntimeError: encrypted/corrupt/unreadable PDF, or too little text
                      (likely an image-only PDF)
    """
    name = filename
    if not name and isinstance(file, str):
        name = file
    title = _title_from_name(name)

    try:
        with pdfplumber.open(file) as pdf:
            pages_text = []
            for page in pdf.pages:
                page_text = page.extract_text() or ''
                if page_text.strip():
                    pages_text.append(page_text)
    except Exception as err:
        # encrypted, password-protected, corrupt, or not a real PDF
        raise RuntimeError(f'Could not read the PDF: {err}')

    text = '\n\n'.join(pages_text).strip()
    word_count = len(text.split())

    if word_count < MIN_WORDS:
        raise RuntimeError(
            'This PDF has little or no extractable text. It may be image-based '
            '(a scan) — try a PDF with a real text layer, or run OCR on it first.'
        )

    return {
        'title': title,
        'source': 'PDF upload',
        'text': text,
        'word_count': word_count,
        'content_type': 'pdf',
        'url': None,
    }


def _title_from_name(name):
    """Title = filename with its extension stripped."""
    if not name:
        return 'Untitled PDF'
    stem, _ext = os.path.splitext(os.path.basename(name))
    return stem.strip() or 'Untitled PDF'
