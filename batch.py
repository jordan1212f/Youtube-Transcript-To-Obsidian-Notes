from pathlib import Path
from transcript import fetch_transcript
from ai import generate_note
from format import format_note
from save import save_note
from ui import Spinner, print_banner, RED, PURPLE, GREEN, RESET

def load_urls(filepath):
    """
    Read a text file and return a list of Youtube urls

    Expects one URL per line ignores:
    1. empty lines
    2. lines starting with #
    3. any whitespace

    You can orgnanise a file like: 
    # Playlist: Python tutorials
    https://youtube.com/watch?v=abc123
    https://youtube.com/watch?v=def456

    args: 
    Path to the text file containing the urls

    Raises: 
    FileNotFoundError: If the file does not exist
    """

    path = Path(filepath)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {filepath}")
    
    lines = path.read_text().splitlines()
    urls = [line.strip() for line in lines if line.strip() and not line.startswith('#')]

    if not urls:
        raise ValueError(f"No valid URLs found in the file: {filepath}")
    
    return urls

def process_batch(urls, config):
    """
    Process a list of urls one by one.

    If one url fails it does not crash the whole batch
    """

    results = {
        'success' : 0,
        'failed' : 0,
        'total' : len(urls),
        'errors' : [],
        'saved' : []
     }
    
    for i, url in enumerate(urls, start=1):
        #Show progress: [2/5] Processing "https..."

        print(f"{PURPLE}[{i}]/{len(urls)}]{RESET} Processing {url}")
    
        try:
            with Spinner('Fetching transcript...', colour=RED) as sp:
                         data = fetch_transcript(url, config['youtube_api_key'])
                         sp.stop(f'Transcript fetched ({data["word_count"]} words)')
            
            with Spinner('Generating note...', colour=PURPLE) as sp:
                        note = generate_note(
                            api_key = config['api_key'],
                            title = data['title'],
                            channel = data['channel'],
                            transcript = data['transcript'],
                            word_count = data['word_count'])

                        sp.stop('Note generated')

                        markdown = format_note(
                             title = data['title']
                             channel = data['channel'],
                             url = url,
                             note = note
                        )

                        filepath = save_note(
                              vault_path = config['vault_path'],
                              title = data['title'],
                              tags = note['tags'],
                              markdown = markdown
                        )

                        print(f'{GREEN}✅{RESET} Saved to: {filepath}')
                        results['success'] += 1
                        results['saved'].append(filepath)

        except Exception as err:
              print(f'{RED}❌ Failed to process {err}{RESET}')
              results['failed'] += 1
              results['errors'].append({'url': url, 'error': str(err)})
    return results

def print_batch_summary(results):
    print(f'\n{PURPLE}══════════════════════════════════════{RESET}')
    print(f'Batch complete: {GREEN}{results["success"]}{RESET}/{results["total"]} succeeded')
 
    if results['errors']:
        print(f'{RED}❌ {results["failed"]} failed:{RESET}')
        for err in results['errors']:
            print(f'  - {err["url"]} → {err["error"]}')
 
    if results['saved']:
        print(f'\n{GREEN}📁 Notes saved:{RESET}')
        for path in results['saved']:
            print(f'  - {path}')
 
    print(f'{PURPLE}══════════════════════════════════════{RESET}\n')