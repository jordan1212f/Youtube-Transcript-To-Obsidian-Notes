from urllib.parse import parse_qs, urlparse
from youtube_transcript_api import YouTubeTranscriptApi

def extract_video_id(url):
    parsed = urlparse(url)
    hostname = parsed.hostname or ''

    if 'youtube.com' in hostname:
        params = parse_qs(parsed.query)
        if 'v' in params:
            return params['v'][0]
    
    if 'youtu.be' in hostname:
        video_id = parsed.path.lstrip('/')
        if video_id:
            return video_id
    
    raise ValueError(f'Could not extract video ID from URL: {url}')
        
def fetch_transcript(url):
    
    video_id = extract_video_id(url)
    
    try:
        segments = YouTubeTranscriptApi.get_transcript(video_id)
    except Exception:
        raise RuntimeError(
            'No transcript available for this video. '
            'Subtitles may be disabled or the video may be private.'
        )
    
    full_text = ' '.join(segment['text'] for segment in segments)
    word_count = len(full_text.split())

    return {
        'video_id': video_id,
        'transcript': full_text,
        'segments': segments,
        'word_count': word_count
    }