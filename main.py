import sys
from config import config_exists, load_config, prompt_for_config
from transcript import fetch_transcript
from ai import generate_note
from format import format_note
from save import save_note

# Step 1: Get the YouTube URL from command line arguments
def main():
    if len(sys.argv) < 2:
        print('Usage: python main.py <youtube-url>')
        print('Example: python main.py https://www.youtube.com/watch?v=abc123')
        sys.exit(1)
 
    url = sys.argv[1]

    if config_exists():
        config = load_config()
    else:
        config = prompt_for_config()

# Step 2: Load and create config

    if config_exists():
        config = load_config()
    else:
        config = prompt_for_config()

    print(f'Fetching transcript for: {url}')
    data = fetch_transcript(url, config['youtube_api_key'])
    print(f'Transcript fetched ({data["word_count"]} words)')

    print('Generating note with Claude...')
    note = generate_note(
        api_key=config['api_key'],
        title=data['title'],
        channel=data['channel'],
        transcript=data['transcript'],
        word_count=data['word_count']
    )
    print('Note generated')
 
    markdown = format_note(
        title=data['title'],
        channel=data['channel'],
        url=url,
        note=note
    )
 
    # Step 6: Save to the Obsidian vault
    print('💾 Saving to vault...')
    filepath = save_note(
        vault_path=config['vault_path'],
        title=data['title'],
        tags=note['tags'],
        markdown=markdown
    )
    print(f'Done! Saved to: {filepath}')

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        # User pressed Ctrl+C — exit quietly, no ugly traceback
        print('\n👋 Cancelled')
        sys.exit(0)
    except Exception as err:
        # Catch any error from any module and print it cleanly
        print(f'Error: {err}')
        sys.exit(1)

        
 