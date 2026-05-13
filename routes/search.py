# routes/search.py
# Search across all saved content using semantic embeddings
# and optionally synthesise an answer from the top matches.

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
 
from config import load_config
from embedder import search_embeddings, get_embedding_count
from ai import synthesise_answer
from cost import record_usage

router = APIRouter()

class SearchRequest(BaseModel):
    query: str
    top_n: int = 5
    synthesise: bool = False

@router.post('/search')
def search_knowledge_base(request: SearchRequest):
    """Search across all embedded content.
 
    If synthesise=False: returns matched notes with relevance scores.
    If synthesise=True: also sends top matches to Claude for a
    synthesised answer with source citations.
    """
    note_count = get_embedding_count()

    if note_count == 0:
        return {
            'results': [],
            'note_count': 0,
            'message' : 'No content embedded yet, process some content first.'
        }
    

    results = search_embeddings(request.query, top_n=request.top_n)

    formatted_results = [
        {
            'title' : r['title'],
            'summary' : r['summary'],
            'score' : round(r['score'] * 100),
            'note_patch' : r['note_patch']
        }
        for r in results
    ]

    response = {
        'query' : request.query,
        'results' : formatted_results,
        'note_count' : note_count,
        'synthesis' : None,
        'cost' : 0.0
    }

    # ? Add as a (paid, optional feature)
    if request.synthesise and results:
        try:
            config = load_config()

            # Build up context from top results
            context_parts = []
            for i, r in enumerate(results, start=1):

                context_parts.append(f'Note {i}: "{r["title"]}"\nsummary: {r["summary"]}')
            
            context = '\n\n---\n\n'.join(context_parts)
            source_titles = [r['title'] for r in results]

            synthesis = synthesise_answer(
                api_key=config['api_key'],
                query=request.query,
                context=context,
                source_titles=source_titles
            )

            # Record cost
            stats = record_usage(
                synthesis['usage']['input_tokens'],
                synthesis['usage']['output_tokens']
            )
 
            response['synthesis'] = {
                'answer': synthesis['answer'],
                'sources': synthesis['sources']
            }
            response['cost'] = stats['call_cost']
 
        except Exception as err:
            response['synthesis'] = {
                'answer': f'Synthesis failed: {str(err)}',
                'sources': []
            }
 
    return response