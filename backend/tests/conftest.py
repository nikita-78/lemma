import io
import pytest
from fastapi.testclient import TestClient
from docx import Document
from backend.app.main import app

@pytest.fixture(scope="module")
def client():
    """Provides a FastAPI TestClient."""
    with TestClient(app) as c:
        yield c

@pytest.fixture
def sample_text():
    """Provides a standard multi-sentence plain text string."""
    return (
        "This is the first sentence. It has some text. "
        "Here is the second sentence, which is longer and contains more details! "
        "And this is the third sentence: does it work correctly?"
    )

@pytest.fixture
def create_docx_bytes():
    """Fixture that returns a function to generate DOCX bytes on-the-fly."""
    def _create(paragraphs: list[str]) -> bytes:
        doc = Document()
        for p in paragraphs:
            doc.add_paragraph(p)
        
        doc_io = io.BytesIO()
        doc.save(doc_io)
        return doc_io.getvalue()
    return _create
