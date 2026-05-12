# server.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import settings, goals, process, actions, digest, search, library

app = FastAPI(
    title='Obsiditube API',
    description='Turn what you consume into what you become.',
    version='1.0.0'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],          # accept requests from any origin
    allow_credentials=True,
    allow_methods=['*'],          # accept any HTTP method (GET, POST, PUT, DELETE)
    allow_headers=['*'],          # accept any headers
)

app.include_router(settings.router, prefix='/api')
app.include_router(goals.router, prefix='/api')
app.include_router(process.router, prefix='/api')
app.include_router(actions.router, prefix='/api')
app.include_router(digest.router, prefix='/api')
app.include_router(search.router, prefix='/api')
app.include_router(library.router, prefix='/api')


@app.get('/')
def root():
    """Health check — confirms the API is running."""
    return {
        'app': 'Obsiditube',
        'status': 'running',
        'docs': 'http://localhost:8000/docs'
    }