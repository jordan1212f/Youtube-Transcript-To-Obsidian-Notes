# test_search.py
# Tests for the embedding and search infrastructure.
# These test the free, local parts only — no Claude API calls.
# Run with: python -m unittest test_search.py -v

import unittest
import tempfile
import sqlite3
import numpy as np
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from unittest.mock import patch

# We need to override the DB_PATH before importing embedder
# so tests use a temporary database, not your real one
import embedder


class TestEmbedText(unittest.TestCase):
    """Tests for converting text to embedding vectors."""

    def test_returns_numpy_array(self):
        """Should return a numpy array."""
        result = embedder.embed_text('hello world')
        self.assertIsInstance(result, np.ndarray)

    def test_correct_dimensions(self):
        """all-MiniLM-L6-v2 produces 384-dimensional vectors."""
        result = embedder.embed_text('test sentence')
        self.assertEqual(result.shape, (384,))

    def test_similar_texts_have_high_similarity(self):
        """Semantically similar texts should have high cosine similarity."""
        a = embedder.embed_text('compound interest grows wealth over time')
        b = embedder.embed_text('your money grows exponentially with interest')
        score = embedder.cosine_similarity(a, b)
        # Should be reasonably similar — above 0.5
        self.assertGreater(score, 0.5)

    def test_different_texts_have_low_similarity(self):
        """Unrelated texts should have low cosine similarity."""
        a = embedder.embed_text('compound interest grows wealth over time')
        b = embedder.embed_text('python decorators wrap functions')
        score = embedder.cosine_similarity(a, b)
        # Should be quite different — below 0.3
        self.assertLess(score, 0.3)


class TestCosineSimilarity(unittest.TestCase):
    """Tests for the cosine similarity function."""

    def test_identical_vectors(self):
        """Identical vectors should return 1.0."""
        a = np.array([1.0, 2.0, 3.0], dtype=np.float32)
        score = embedder.cosine_similarity(a, a)
        self.assertAlmostEqual(score, 1.0, places=5)

    def test_opposite_vectors(self):
        """Opposite vectors should return -1.0."""
        a = np.array([1.0, 0.0, 0.0], dtype=np.float32)
        b = np.array([-1.0, 0.0, 0.0], dtype=np.float32)
        score = embedder.cosine_similarity(a, b)
        self.assertAlmostEqual(score, -1.0, places=5)

    def test_orthogonal_vectors(self):
        """Perpendicular vectors should return 0.0."""
        a = np.array([1.0, 0.0], dtype=np.float32)
        b = np.array([0.0, 1.0], dtype=np.float32)
        score = embedder.cosine_similarity(a, b)
        self.assertAlmostEqual(score, 0.0, places=5)

    def test_zero_vector_returns_zero(self):
        """A zero vector should return 0.0, not crash."""
        a = np.array([1.0, 2.0, 3.0], dtype=np.float32)
        b = np.array([0.0, 0.0, 0.0], dtype=np.float32)
        score = embedder.cosine_similarity(a, b)
        self.assertEqual(score, 0.0)


class TestStoreAndSearch(unittest.TestCase):
    """Tests for storing embeddings and searching them.

    Uses a temporary database so we never touch the real one.
    The setUp method patches the DB_PATH before each test,
    and tearDown cleans up after.
    """

    def setUp(self):
        """Create a temporary database for each test."""
        self.tmp_dir = tempfile.mkdtemp()
        self.tmp_db = Path(self.tmp_dir) / 'test_embeddings.db'
        # Patch the module-level DB_PATH to use our temp database
        self.patcher = patch.object(embedder, 'DB_PATH', self.tmp_db)
        self.patcher.start()

    def tearDown(self):
        """Clean up the temporary database."""
        self.patcher.stop()
        if self.tmp_db.exists():
            self.tmp_db.unlink()

    def test_store_and_retrieve(self):
        """Should store an embedding and find it via search."""
        embedder.store_embedding(
            '/fake/path/investing.md',
            'Index Fund Investing',
            'Index funds are a great way to invest passively'
        )

        results = embedder.search_embeddings('how should I invest my money', top_n=3)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['title'], 'Index Fund Investing')
        self.assertGreater(results[0]['score'], 0.3)

    def test_search_returns_most_relevant_first(self):
        """Results should be sorted by relevance — best match first."""
        embedder.store_embedding(
            '/fake/path/investing.md',
            'Index Fund Investing',
            'Passive investing with index funds for long term wealth'
        )
        embedder.store_embedding(
            '/fake/path/python.md',
            'Python Decorators',
            'Decorators are functions that wrap other functions in Python'
        )
        embedder.store_embedding(
            '/fake/path/wealth.md',
            'Building Wealth in Your 20s',
            'Start investing early compound interest retirement savings'
        )

        results = embedder.search_embeddings('how to grow wealth with investing', top_n=3)

        # The investing-related notes should rank higher than Python
        titles = [r['title'] for r in results]
        python_index = titles.index('Python Decorators')
        # Python should be last (least relevant)
        self.assertEqual(python_index, len(titles) - 1)

    def test_respects_top_n(self):
        """Should return at most top_n results."""
        for i in range(10):
            embedder.store_embedding(
                f'/fake/path/note{i}.md',
                f'Note {i}',
                f'This is test note number {i} about various topics'
            )

        results = embedder.search_embeddings('test query', top_n=3)
        self.assertEqual(len(results), 3)

    def test_empty_database(self):
        """Should return empty list when no notes are embedded."""
        results = embedder.search_embeddings('anything', top_n=5)
        self.assertEqual(results, [])

    def test_update_existing_embedding(self):
        """Re-embedding the same note path should update, not duplicate."""
        embedder.store_embedding(
            '/fake/path/note.md',
            'My Note',
            'Original summary about cooking'
        )
        embedder.store_embedding(
            '/fake/path/note.md',
            'My Note Updated',
            'Updated summary about investing'
        )

        # Should only have 1 entry, not 2
        count = embedder.get_embedding_count()
        self.assertEqual(count, 1)

        # Search should find the updated version
        results = embedder.search_embeddings('investing', top_n=1)
        self.assertEqual(results[0]['title'], 'My Note Updated')

    def test_get_embedding_count(self):
        """Should return correct count of embedded notes."""
        self.assertEqual(embedder.get_embedding_count(), 0)

        embedder.store_embedding('/a.md', 'Note A', 'Summary A')
        embedder.store_embedding('/b.md', 'Note B', 'Summary B')

        self.assertEqual(embedder.get_embedding_count(), 2)


if __name__ == '__main__':
    unittest.main()