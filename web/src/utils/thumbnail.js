// Construct a YouTube thumbnail URL from a video URL, entirely on the
// frontend — no backend call. Handles the two common URL shapes:
//   https://www.youtube.com/watch?v=VIDEO_ID  → query param "v"
//   https://youtu.be/VIDEO_ID                  → path after "/"
// Returns null for anything malformed or non-YouTube so callers can fall
// back to a placeholder header.
export function getYouTubeThumbnail(url) {
  if (!url) return null
  try {
    const parsed = new URL(url)
    let videoId = null
    if (parsed.hostname.includes('youtube.com')) {
      videoId = parsed.searchParams.get('v')
    } else if (parsed.hostname.includes('youtu.be')) {
      videoId = parsed.pathname.slice(1)
    }
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null
  } catch {
    return null
  }
}
