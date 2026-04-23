from pathlib import Path

from numpy import rint
from transcript import fetch_transcript
from ai import generate_note
from format import format_note
from save import save_note
from cost import record_usage, format_cost_report, estimate_cost
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

    print(f'{PURPLE} Phase 1: Fetching transcripts')
    fetched = []
    fetch_errors = []

    for i, url in enumerate(urls, stats=1):
        print(f'{PURPLE}[{i}/{len(urls)}]{RESET}{url}')
        try:
            with Spinner('Fetching...' colour = RED) as sp:
                data = fetch_transcript(url, config['youtube_api_key'])
                sp.stop(f'{data["title"]} ({data["word_count"]} words)')
                fetched.append({'url' : url, 'data' : data})
        except Exception as err:
             print(f'{RED}❌ Failed to fetch {url}: {err}{RESET}')
             fetch_errors.append({'url': url, 'error': str(err)})

        if not fetched:
             print(f'\n{RED} No transcripts fetched. Nothing to procecss. Exiting.{RESET}')
             return _empty_results(len(urls), fetch_errors)
        
        total_est = sum(
             estimate_cost(f['data']['transcript'])['estimated_cost']
               for f in fetched
        )

        print(f'\n{PURPLE}══════════════════════════════════════{RESET}')
        print(f'📋 {len(fetched)} videos ready, {len(fetch_errors)} failed to fetch')
        print(f'💰 Estimated total cost: ~${total_est:.4f}')
        print(f'{PURPLE}══════════════════════════════════════{RESET}')

        confirm = input(f'\n   Continue with {len(fetched)} videos? [Y/n] ').strip().lower()
        if confirm == 'n':
            print('👋 Cancelled')
            return _empty_results(len(urls), fetch_errors)

    print(f'\n{PURPLE} Phase 2: Generating notes... {RESET}\n')
    results = {
        'success' : 0,
        'failed' : 0,
        'total' : len(urls),
        'errors' : [],
        'saved' : []
     }
    
    for i, item in enumerate(urls, start=1):
        url = item['url']
        data = item['data']
        print(f'{PURPLE}{i}/{len(fetched)}{RESET} {data["title"]}')

        try:
            #with Spinner('Generating note..', colour=RED) as sp:
                        #data = fetch_transcript(url, config['youtube_api_key'])
                        #sp.stop(f'Transcript fetched ({data["word_count"]} words)')
            
            with Spinner('Generating note...', colour=PURPLE) as sp:
                        result = generate_note(
                            api_key = config['api_key'],
                            title = data['title'],
                            channel = data['channel'],
                            transcript = data['transcript'],
                            word_count = data['word_count']
                            )

                        note = result['note']
                        usage = result['usage']
                        sp.stop('Note generated')

                        markdown = format_note(
                            title = data['title'],
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
                    
                        stats = record_usage(usage['input_tokens'], usage['output_tokens'])
                        results['batch_cost'] += stats['call_cost']
                        print(f'{GREEN}✅{RESET} Saved to: {filepath}')
                        print(f'💰 ${stats["call_cost"]:.4f}')
                        results['success'] += 1
                        results['saved'].append(filepath)

                        results['success'] += 1
                        results['saved'].append(filepath)

        except Exception as err:
              print(f'{RED}❌ Failed to process {err}{RESET}')
              results['failed'] += 1
              results['errors'].append({'url': url, 'error': str(err)})
    return results

def _empty_results(total, errors):
    return {
        'success' : 0,
        'failed' : total,
        'total' : total,
        'errors' : errors,
        'saved' : [],
        'batch_cost' : 0.0
    }

def print_batch_summary(results):
    print(f'\n{PURPLE}══════════════════════════════════════{RESET}')
    print(f'Batch complete: {GREEN}{results["success"]}{RESET}/{results["total"]} succeeded')
    print(f'💰 Batch cost: ${results["batch_cost"]:.4f}')
 
    if results['errors']:
        print(f'{RED}❌ {results["failed"]} failed:{RESET}')
        for err in results['errors']:
            print(f'  - {err["url"]} → {err["error"]}')
 
    if results['saved']:
        print(f'\n{GREEN}📁 Notes saved:{RESET}')
        for path in results['saved']:
            print(f'  - {path}')
 
    print(f'{PURPLE}══════════════════════════════════════{RESET}\n')