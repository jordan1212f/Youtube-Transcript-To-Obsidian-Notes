import argparse
import sys
from config import config_exists, load_config, prompt_for_config
from transcript import fetch_transcript
from ai import generate_note
from format import format_note
from save import save_note
from batch import load_urls, process_batch, print_batch_summary
from ui import Spinner, print_banner, RED, PURPLE, GREEN, RESET

def parse_args():
    parser = argparse.ArgumentParser(Description = 'Turn Youtube videos into Obisdian notes')

    parser.add_argument(
        'url',
        nargs = '?',
        help = 'Youtube video URL'
    )

    parser.add_argument(
        '--batch',
        help = 'Path to a text file containing multiple Youtube URLs (one per line)'
    )

    args = parser.parse_args()

    if not args.url and not args.batch:
        parser.print_help()
        print(f'\n{RED}Error: Provide a single URL or use --batch <file>{RESET}')
        sys.exit(1)
    
    return args


def main():
    """Main function — runs the full pipeline from URL to saved note."""

    print_banner()

    if len(sys.argv) < 2:
        print(f'Usage: python main.py {RED}<youtube-url>{RESET}')
        print(f'Example: python main.py "https://www.youtube.com/watch?v=abc123"')
        sys.exit(1)

    url = sys.argv[1]

    if config_exists():
        config = load_config()
    else:
        config = prompt_for_config()

    with Spinner('Fetching transcript...', colour=RED) as sp:
        data = fetch_transcript(url, config['youtube_api_key'])
        sp.stop(f'Transcript fetched ({data["word_count"]} words)')

    with Spinner('Generating note with Claude...', colour=PURPLE) as sp:
        note = generate_note(
            api_key=config['api_key'],
            title=data['title'],
            channel=data['channel'],
            transcript=data['transcript'],
            word_count=data['word_count']
        )
        sp.stop('Note generated')

    markdown = format_note(
        title=data['title'],
        channel=data['channel'],
        url=url,
        note=note
    )

    with Spinner('Saving to vault...', colour=PURPLE) as sp:
        filepath = save_note(
            vault_path=config['vault_path'],
            title=data['title'],
            tags=note['tags'],
            markdown=markdown
        )
        sp.stop(f'Done! Saved to: {filepath}')


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print(f'\n👋 Cancelled')
        sys.exit(0)
    except Exception as err:
        print(f'\n{RED}❌ Error: {err}{RESET}')
        sys.exit(1)