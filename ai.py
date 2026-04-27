import json
from anthropic import Anthropic


SYSTEM_PROMPT = SYSTEM_PROMPT = """You are a note-taking assistant. You will be given a YouTube video's
title, channel, and transcript. Your job is to produce structured,
insightful notes in JSON format.

Return ONLY valid JSON, no markdown fences, no preamble.
The JSON must match this exact structure:

{
  "tags": ["tag1", "tag2"],
  "summary": "narrative summary scaled to video length",
  "keyTakeaways": ["Takeaway 1", "Takeaway 2"],
  "analogies": ["Analogy 1"],
  "actionableSteps": ["Step 1"],
  "chapters": [
    {"title": "Chapter title"}
  ]
}

Rules:
- tags: 2-5 lowercase tags. Choose freely based on the content
  (e.g. python, investing, productivity, health, design).
  The first tag will be used as the folder name so make it
  the broadest category.
- summary: write in flowing prose, not bullet points. Write
  roughly 1 paragraph per 10 minutes of content, minimum 2
  paragraphs, maximum 6.
- keyTakeaways: the 3-7 most important ideas from the video.
- analogies: only include if there are genuinely complex
  concepts that benefit from an analogy to aid understanding.
  If not applicable, return an empty array [].
- actionableSteps: only include if the video contains practical
  advice, tutorials, or project ideas worth acting on.
  If not applicable, return an empty array [].
- chapters: break the video into 5-10 logical topic sections.
  Just the topic name, no timestamps.
"""

def generate_note(api_key, title, channel, transcript, word_count):
    """Send the transcript to Claude and get back structured note data.
 
    Args:
        api_key: Your Anthropic API key string
        title: The video title (from YouTube)
        channel: The channel name (from YouTube)
        transcript: The full transcript text as one string
        word_count: Number of words in the transcript
 
    Returns:
        A parsed dict matching the JSON structure in SYSTEM_PROMPT
 
    Raises:
        RuntimeError: If Claude's response can't be parsed as JSON after a retry
    """
    client = Anthropic(api_key=api_key)

    user_message = f"""Video Title: {title}
Channel: {channel}
Word Count: {word_count}

Transcript:
{transcript}"""
    
    total__input = 0
    total_output = 0

    for attempt in range(2):
        response = client.messages.create(
            model='claude-sonnet-4-6',
            max_tokens=4096,
            system=SYSTEM_PROMPT,
            messages=[
                {'role' : 'user', 'content' : user_message}
            ]
        )

        text = response.content[0].text

        total_input = response.usage.input_tokens
        total_output = response.usage.output_tokens

        text = response.content[0].text

        try:
            note = parse_json_response(text)
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
                    'The transcript may be too long or in an unsupported language.'
                )
 
def parse_json_response(text):
    """Clean up and parse Claude's JSON response.
 
    Sometimes Clau