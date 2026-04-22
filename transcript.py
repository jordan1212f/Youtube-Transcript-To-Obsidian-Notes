from urllib.parse import parse_qs, urlparse
from youtube_transcript_api import YouTubeTranscriptApi
from googleapiclient.discovery import build

def extract_video_id(url):
    """Pull the video ID out of any common YouTube URL format.
 
    Handles:
      - https://www.youtube.com/watch?v=abc123
      - https://youtu.be/abc123
      - https://youtube.com/watch?v=abc123&t=120
 
    Returns just the ID string, e.g. 'abc123'
    Raises ValueError if the URL doesn't look like a YouTube link.
    """

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
    
    raise ValueError(f' Could not extract video ID from url {url}')

def fetch_video_metadata(video_id, youtube_api_key):
    """
    Fetches title + channel from YT API
    
    ARGS:
        video_id : YT video ID string
        youtube_api_key : Your own Google API key

    
    Returns:
        A dict with 'title' and 'channel' keys
    """
    youtube = build('youtube', 'v3', developerKey=youtube_api_key)


    request = youtube.videos().list(
        part = 'snippet',
        id = video_id
    )
    response = request.execute()

    if not response.get('items'):
        raise RuntimeError(f'Video not found for ID {video_id}')
    
    snippet = response['items'][0]['snippet']

    return {
        'title': snippet['title'],
        'channel': snippet['channelTitle']
    }

def fetch_transcript(url, youtube_api_key):
    """
    Fetches both full transcript + metadata from the video.
    Main function called from main.py:
        Returns --> Transcript text + Metadata

    Args:
        url: Full YT URL
        yt_api_key : Your OWN google api key for fetching meta data

    Returns a dict: 
    {
        'video_id': 'e.g. abc123',
        'title': 'Vid title',
        'channel': 'Channel name',
        'transcript': 'Full transcript text as one string',
        'segments' : [{'text' : ..., 'start' : ..., 'duration': ...}, ...],
        'word_count': 1234
    }
    """
    video_id = extract_video_id(url)
    
    metadata = fetch_video_metadata(video_id, youtube_api_key)

    try:
        ytt = YouTubeTranscriptApi()
        segments = ytt.fetch(video_id)
    except Exception:
        raise RuntimeError('Transcript not available for this video.'
        '\n Subtitles may be disabled or video is private.')
    
    #Join all segments text into one continous string

    full_text = ''.join(segment.text for segment in segments)
    word_count = len(full_text.split())

    return {
        'video_id': video_id,
        'title': metadata['title'],
        'channel': metadata['channel'],
        'transcript': full_text,
        'segments': segments,
        'word_count': word_count
    }
