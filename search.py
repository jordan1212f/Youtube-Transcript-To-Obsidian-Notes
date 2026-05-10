from embedder import search_embeddings, get_embedding_count
from ai import synthesise_answer
from cost import record_usage, estimate_cost
from ui import Spinner, PURPLE, GREEN, RED, RESET

def run_search(query, config):
    """
    Runs full search pipleine: Find --> Rank --> Synthesise. 

    Args: 
        Query: Users question as a string
        Config: Config dict with api_key + search_results setting

    Returns: 
        None - Prints results directly to the console
    """

    top_n = config.get('search_results', 5)
    note_count = get_embedding_count()

    if note_count == 0:
        print(f'{RED} No notes embedded yet. Process some vidoes first. {RESET}')
        return
    
    with Spinner(f'Searchong across {note_count} notes...', colour=PURPLE) as sp:
        results = search_embeddings(query, top_n=top_n)
        sp.stop(f'Found {len(results)} relevant notes')

    if not results:
        print(f'{RED} No matching notes found. Try rephrasing your question. {RESET}')
        return 
    
    print(f'\n{PURPLE} Top Matches: {RESET}\n')
    for i, result in enumerate(results, start = 1):

        pct = int(result['score'] * 100)
        print(f' {i}. {result["title"]} (relevance {pct}%)')

    context = build_synthesis_context(results)
    est = estimate_cost(context)
    print(f'\n Synthesis cost: ~${est["estimated_cost"]:.4f}')
    confirm = input(' Synthesise answer? [Y/n]').strip().lower()
    if confirm == 'n':
        print('Showing results only')
        return
    print('DEBUG: Passed the check, preparing to synth')
    
    with Spinner('Synthesising answer from your notes...', colour = PURPLE) as sp:
        synthesis = synthesise_answer(
            api_key=config['api_key'],
            query=query,
            context=context,
            source_titles=[r['title'] for r in results]
        )
        sp.stop('Answer ready')
    
    stats = record_usage(
        synthesis['usage']['input_tokens'],
        synthesis['usage']['output_tokens']
    )

    print(f'\n{PURPLE}💡 Based on your notes:{RESET}\n')
    print(f'  {synthesis["answer"]}')
    print(f'\n  {PURPLE}Sources:{RESET} {format_sources(synthesis["sources"])}')
    print(f'\n💰 Search cost: ${stats["call_cost"]:.4f}')

def build_synthesis_context(results):
    """Build the context string that gets sent to Claude.
 
    Combines the summaries of the top matching notes into a single
    string, with clear separators so Claude can distinguish between
    different notes.
 
    Args:
        results: List of search result dicts from search_embeddings()
 
    Returns:
        A formatted string with all note summaries
    """
    sections = []
    for i, result in enumerate(results, start=1):
        sections.append(
            f'Note {i}: "{result["title"]}"\n'
            f'Summary: {result["summary"]}'
        )
    return '\n\n---\n\n'.join(sections)

def format_sources(titles):
    """Format source titles as Obsidian wiki links.
 
    ['Note A', 'Note B'] → '[[Note A]], [[Note B]]'
    """
    return ', '.join(f'[[{title}]]' for title in titles)
