# Lemma: Plagiarism Analysis & Academic Text Rewriting Platform

Lemma is a high-performance, production-grade plagiarism analysis and academic text rewriting platform. It features a decoupled client-server architecture, local vector-based NLP pipelines, asynchronous worker queues, and professional report automation.

## 🚀 Key Features (System Overview)
*   **Dual-Tier Plagiarism Matcher**: Combines lexical comparison (TF-IDF + Cosine Similarity) with semantic indexing (Sentence-Transformers) to catch direct copying and paraphrasing.
*   **Precision Coordinate Mapping**: Utilizes spaCy for optimized sentence segmentation, explicitly mapping and tracking absolute character positions (`start_char`, `end_char`) for exact frontend highlights.
*   **Local Generative Rewriter**: Integrates with local Ollama instances (targeting Llama 3) for academic, technical, and professional text paraphrasing.
*   **HTML-to-PDF Report Automation**: Generates publication-ready PDF reports with color-coded plagiarism highlighting using WeasyPrint.
*   **Decoupled Async Architecture**: Implements Celery and Redis to handle long-running document analyses in background workers.

---

## 🛠️ Technology Stack
*   **Frontend**: React (JavaScript), Tailwind CSS (Minimally-designed high-contrast dark theme)
*   **API Service**: FastAPI (Python) using asynchronous patterns
*   **Workers & Cache**: Celery + Redis
*   **Storage**: SQLite (Primary SQL DB and embedding vector index)
*   **NLP & ML Pipelines**: spaCy (optimized), scikit-learn, sentence-transformers
*   **Report Generation**: WeasyPrint (HTML-to-PDF engine)

---

## 📂 Repository Directory Structure

```
lemma/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py         # Pydantic Settings
│   │   ├── main.py           # API entry point & exception handlers
│   │   ├── schemas/          # Pydantic validation schemas
│   │   │   ├── __init__.py
│   │   │   └── document.py
│   │   └── services/         # Core business logic / services
│   │       ├── __init__.py
│   │       ├── extractor.py  # TXT, DOCX, and PDF text extraction service
│   │       └── segmenter.py  # Optimized spaCy sentence segmenter
│   ├── tests/                # Test suite
│   │   ├── __init__.py
│   │   ├── conftest.py       # Shared pytest fixtures
│   │   ├── test_extractor.py # Document extractor unit tests
│   │   ├── test_main.py      # FastAPI endpoint integration tests
│   │   └── test_segmenter.py # Sentence segmenter unit tests
│   └── requirements.txt      # Python dependencies
├── .gitignore                # Git ignore configuration
├── requirements.txt          # Root Python dependencies (symlink-equivalent)
└── README.md                 # Project documentation (this file)
```

---

## ⚙️ Quick Start (Local Backend Setup)

### Prerequisites
*   **Python**: Version `3.10` or higher (successfully tested on Python `3.14.3`)
*   **Operating System**: Windows / Linux / macOS

### 1. Initialize Virtual Environment & Dependencies
From the repository root, run:

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell)
.\venv\Scripts\Activate.ps1
# Windows (CMD)
.\venv\Scripts\activate.bat
# Linux/macOS
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

### 2. Download spaCy NLP Model
Download the optimized English tokenizer pipeline:

```bash
python -m spacy download en_core_web_sm
```

### 3. Run the Development Server
Launch FastAPI using Uvicorn:

```bash
python -m uvicorn backend.app.main:app --reload --port 8000
```

Once running, access the interactive Swagger API documentation at:
👉 **[http://localhost:8000/docs](http://localhost:8000/docs)**

---

## 📡 API Documentation (Implemented Endpoints)

### `GET /health`
Returns the operational status of the API.
*   **Response**:
    ```json
    {
      "status": "ok",
      "project": "Lemma Plagiarism Analysis Platform"
    }
    ```

### `POST /api/v1/documents/upload`
Uploads a document, extracts the raw text, validates constraints (e.g., maximum 100MB limit, file type check), and returns sentence segments with absolute start/end coordinates.
*   **Content-Type**: `multipart/form-data`
*   **Body Parameters**:
    *   `file`: The document file (`.txt`, `.docx`, or `.pdf`)
*   **Success Response (200 OK)**:
    ```json
    {
      "filename": "essay.txt",
      "text": "This is the first sentence. And this is the second.",
      "char_count": 51,
      "sentence_count": 2,
      "sentences": [
        {
          "text": "This is the first sentence.",
          "start_char": 0,
          "end_char": 27
        },
        {
          "text": "And this is the second.",
          "start_char": 28,
          "end_char": 51
        }
      ]
    }
    ```
*   **Error Mappings**:
    *   `413 Payload Too Large`: Upload exceeds 100MB
    *   `400 Bad Request`: Unsupported file extension
    *   `422 Unprocessable Entity`: Corrupt document or decryption failure (password-protected PDFs)

---

## 🧪 Running the Test Suite

We use `pytest` for unit and integration testing. Run the test suite with:

```bash
python -m pytest backend/tests/
```

All 15 core tests verify:
1.  **Extraction Integrity**: Successful parsing of TXT, DOCX, and PDFs; handling of password protection and format violations.
2.  **Segmentation Correctness**: Character coordinates bounds slicing correctness.
3.  **API Handler Routes**: Normal health response and file post route code assertions.

---

## 🗺️ Build Roadmap
- [x] **Phase 1**: Core Ingestion, Parsing Service & spaCy Coordinate Segmenter
- [ ] **Phase 2**: TF-IDF Matrix & Semantic Embeddings Dual Matching Engine
- [ ] **Phase 3**: Celery Asynchronous Job Queues & Redis Integration
- [ ] **Phase 4**: React + Tailwind stark high-contrast dark theme Frontend
- [ ] **Phase 5**: WeasyPrint PDF Generation & End-to-End Verification
