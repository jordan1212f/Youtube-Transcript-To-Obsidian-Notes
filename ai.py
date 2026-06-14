import json
from anthropic import Anthropic


# How each content type is described to the model, and the label used for the
# body of the user message.
CONTENT_FRAMING = {
    'youtube': "a YouTube video's title, channel, and transcript",
    'tweet': 'a tweet',
    'article': 'an article',
    'pdf': 'a PDF document',
    'paste': 'pasted text',
}
CONTENT_BODY_LABEL = {
    'youtube': 'Transcript',
    'tweet': 'Tweet',
    'article': 'Article',
    'pdf': 'Document',
    'paste': 'Text',
}
# Short formats get a one-paragraph summary and no chapters.
SHORT_CONTENT_TYPES = {'tweet', 'paste'}


def build_system_prompt(content_type='youtube'):
    """Build the note-taking system prompt, framed for the content type.

    The JSON output structure is identical across every type; only the
    framing line and the summary/chapters rules change.
    """
    framing = CONTENT_FRAMING.get(content_type, 'some text content')

    if content_type in SHORT_CONTENT_TYPES:
        summary_rule = (
            'summary: write 1 short paragraph at most (a few sentences) in '
            'flowing prose, not bullet points.'
        )
        chapters_rule = (
            'chapters: return an empty array []. Short content has no chapters.'
        )
    else:
        summary_rule = (
            'summary: write in flowing prose, not bullet points. Write roughly '
            '1 paragraph per 10 minutes of content (or per ~1500 words), '
            'minimum 2 paragraphs, maximum 6.'
        )
        chapters_rule = (
            'chapters: break the content into 5-10 logical topic sections. '
            'Just the topic name, no timestamps.'
        )

    return f"""You are a note-taking assistant. You will be given {framing}. Your job is to produce structured,
insightful notes in JSON format.

Return ONLY valid JSON, no markdown fences, no preamble.
The JSON must match this exact structure:

{{
  "tags": ["tag1", "tag2"],
  "summary": "narrative summary scaled to content length",
  "keyTakeaways": ["Takeaway 1", "Takeaway 2"],
  "analogies": ["Analogy 1"],
  "actionableSteps": ["Step 1"],
  "chapters": [
    {{"title": "Chapter title"}}
  ]
}}

Rules:
- tags: 2-5 lowercase tags, use hyphens for multi-word tags
  (e.g. "quantitative-finance" not "quantitative finance").
  Choose freely based on the content
  (e.g. python, investing, productivity, health, design).
  The first tag will be used as the folder name so make it
  the broadest category.
- {summary_rule}
- keyTakeaways: the 3-7 most important ideas from the content.
- analogies: only include if there are genuinely complex
  concepts that benefit from an analogy to aid understanding.
  If not applicable, return an empty array [].
- actionableSteps: only include if the content contains practical
  advice, tutorials, or project ideas worth acting on.
  If not applicable, return an empty array [].
- {chapters_rule}
"""


# Backwards-compatible default (YouTube) — kept for any external reference.
SYSTEM_PROMPT = build_system_prompt('youtube')


def generate_summary(api_key, title, source, text, word_count, content_type='youtube'):
    """Send any content to Claude and get back structured note data.

    Args:
        api_key: Your Anthropic API key string
        title: The content title
        source: Channel / author / domain / "Pasted text"
        text: The raw content (transcript, article body, tweet, etc.)
        word_count: Number of words in the content
        content_type: youtube | tweet | article | pdf | paste

    Returns:
        {'note': <parsed dict>, 'usage': {'input_tokens', 'output_tokens'}}

    Raises:
        RuntimeError: If Claude's response can't be parsed as JSON after a retry
    """
    client = Anthropic(api_key=api_key)

    system_prompt = build_system_prompt(content_type)
    body_label = CONTENT_BODY_LABEL.get(content_type, 'Content')

    user_message = f"""Title: {title}
Source: {source}
Content type: {content_type}
Word Count: {word_count}

{body_label}:
{text}"""

    total_input = 0
    total_output = 0

    for attempt in range(2):
        response = client.messages.create(
            model='claude-sonnet-4-6',
            max_tokens=4096,
            system=system_prompt,
            messages=[
                {'role' : 'user', 'content' : user_message}
            ]
        )

        text_out = response.content[0].text

        total_input = response.usage.input_tokens
        total_output = response.usage.output_tokens

        try:
            note = parse_json_response(text_out)
            return {
                'note' : note,
                'usage' : {
                    'input_tokens' : total_input,
                    'output_tokens' : total_output
                }
            }
        except json.JSONDecodeError:
            if attempt == 0:
                print('⚠️  Claude returned invalid JSON, retrying...')
                continue
            else:
                raise RuntimeError(
                    'Claude returned invalid JSON twice. '
                    'The content may be too long or in an unsupported language.'
                )


def generate_note(api_key, title, channel, transcript, word_count):
    """Backwards-compatible YouTube wrapper around generate_summary().

    Existing callers (main.py, batch.py, routes/digest.py) still pass a
    channel + transcript; this maps them onto the generalised signature.
    """
    return generate_summary(
        api_key=api_key,
        title=title,
        source=channel,
        text=transcript,
        word_count=word_count,
        content_type='youtube',
    )
 
def parse_json_response(text):
    """Clean up and parse Claude's JSON response.
 
    Sometimes Claude wraps the JSON in ```json ... ``` fences
    even when told not to. This function strips those out
    before parsing.
 
    Args:
        text: The raw text from Claude's response
 
    Returns:
        Parsed Python dict
    """
    cleaned = text.strip()
    if cleaned.startswith('```'):
        lines = cleaned.split('\n')
        cleaned = '\n'.join(lines[1:-1])
 
    return json.loads(cleaned)

LINKING_PROMPT = """You are a knowledge-linking assistant. You will be given:
1. A new note's title, tags, and summary
2. A list of existing notes with their titles and tags
 
Your job is to identify which existing notes are conceptually related
to the new note. Not just keyword matches — think about whether someone
studying the new note's topic would benefit from reading the existing note.
 
Return ONLY valid JSON, no markdown fences, no preamble.
The JSON must be an array of objects:
 
[
  {"index": 1, "reason": "both cover long-term investing strategies"},
  {"index": 3, "reason": "directly explains a concept mentioned in this video"}
]
 
Rules:
- Return at most 5 related notes
- Only include notes that are genuinely related — don't force connections
- If no notes are related, return an empty array []
- The "reason" should be a short phrase explaining the connection
- "index" refers to the number in the candidate list provided"""

def rank_related_notes(api_key, new_note_summary, new_note_title, new_note_tags, candidates):

    client = Anthropic(api_key=api_key)

    candidate_list = '\n'.join(
        f'{i}. "{c["title"]}" (tags: {", ".join(c.get("tags", []))})'
        for i, c in enumerate(candidates, start=1)
    )

    user_message = f"""New Note Title: {new_note_title}
New Note Tags: {", ".join(new_note_tags)}     
New Note Summary: {new_note_summary}

Existing Notes:
{candidate_list}"""
    
    response = client.messages.create(
        model = 'claude-sonnet-4-6',
        max_tokens = 1024,
        system = LINKING_PROMPT,
        messages = [
            {'role' : 'user', 'content' : user_message}
        ]
    )

    text = response.content[0].text

    try:
        matches = parse_json_response(text)
    except json.JSONDecodeError:
        matches = []

    #Map the indicies back to actual note data

    links = []
    for match in matches:
        idx = match.get('index', 0) - 1

        if 0 <= idx < len(candidates):
            links.append({
                'index': match['index'],
                'title': candidates[idx]['title'],
                'reason': match.get('reason', 'related content'),
                'path': candidates[idx].get('path', '')
            })

    return {
        'links' : links[:5],
        'usage' : {
            'input_tokens' : response.usage.input_tokens,
            'output_tokens' : response.usage.output_tokens
        } 
    }

SYNTHESIS_PROMPT = """You are a knowledge synthesis assistant. The user will ask a question
and provide summaries from their personal notes as context.
 
Your job is to answer the question using ONLY the information in the provided notes.
Write as if you're helping a friend understand a topic using their own study materials.
 
Rules:
- Only use information from the provided notes. Do not add external knowledge.
- Reference which notes your answer draws from by their titles.
- Write in clear, flowing prose — not bullet points.
- If the notes don't contain enough information to fully answer the question, say so.
- Keep your answer concise — 2-4 paragraphs maximum.
- End with a list of the note titles you referenced."""

def synthesise_answer(api_key, query, context, source_titles):
    client = Anthropic(api_key=api_key)

    user_message = f"""Question: {query}

Here are relevant notes from my knowledge base:
 
{context}"""
    
    response = client.messages.create(
        model='claude-sonnet-4-6',
        max_tokens=2048,
        system=SYNTHESIS_PROMPT,
        messages=[
            {'role': 'user', 'content': user_message}
        ]
    )
 
    answer = response.content[0].text

    referenced = [t for t in source_titles if t.lower() in answer.lower()]

    if not referenced:
        referenced = source_titles

    return {
        'answer' : answer,
        'sources' : referenced, 
        'usage' : {
            'input_tokens' : response.usage.input_tokens,
            'output_tokens' : response.usage.output_tokens
        }
    }