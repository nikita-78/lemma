# Mission Directive: Plagiarism Analysis & Paraphrasing Platform

You are an expert system-orchestrator agent. Your objective is to build a high-performance, local-first Plagiarism Report Generation and Text Paraphrasing Application. You must implement a strictly decoupled client-server architecture with background workers to optimize long-running AI computations.

## 1. System Architecture & Tech Stack

### Frontend Layer (Client UI)
- **Framework:** React.js + Tailwind CSS.
- **Design Tokens:** Minimalist, high-contrast UI design. Pure pitch-black backgrounds (`#000000`), stark white text, and subtle atmospheric "fog" or soft blur visual overlays for modals/containers. 
- **Core Interfaces:**
  1. A central Dashboard with a multi-format document drag-and-drop ingestion interface (PDF, DOCX, TXT).
  2. An interactive Report Viewer with side-by-side text views displaying original text vs matched source text.
  3. A "Plagiarism-Free Generator" comparison interface featuring clear text diff panels.

### Application & API Layer (Backend)
- **Framework:** Python (FastAPI) leveraging `async/await` structures for routing and Pydantic for request validation.
- **Task Orchestration:** Celery paired with Redis to act as an asynchronous task queue and in-memory cache layer. Long-running document processes must drop a Job ID and return a `202 Accepted` status immediately to the client.

### Data & Intelligence Layer (AI-ML Engine)
- **NLP Preprocessing:** Utilize `spaCy` (optimized by disabling `ner` and `lemmatizer` components) to segment documents into individual sentences while explicitly mapping and preserving absolute character coordinate indices (`start_char`, `end_char`).
- **Lexical Detector:** `scikit-learn` using TF-IDF and Cosine Similarity to execute lightning-fast direct matching loops against an internal document database index.
- **Semantic Detector:** `sentence-transformers` using a local embedding model (such as `all-MiniLM-L6-v2`) to capture deep paraphrased text segments with high vector semantic similarity.
- **Coordinate Mapping:** `difflib.SequenceMatcher` to extract exact matching word-slices within sentences, mapping them directly to JSON coordinates for frontend rendering.
- **Generative Utility:** An integrated local LLM pipeline communicating with a native `Ollama` API wrapper to handle structural text rewriting, maintaining a strict academic and professional tone while eliminating plagiarism markers.

### Document Automation Layer
- **Library:** `WeasyPrint` (HTML-to-PDF engine).
- **Behavior:** Compile a production-grade downloadable PDF document by injecting HTML `<mark>` tags around targeted coordinates to visually highlight plagiarized segments.

---

## 2. Implementation Execution Plan

Please execute this build sequentially across your sub-agents, verifying deliverables via workspace artifacts at every stage:

### Phase 1: Core Parsing & Vector Storage
1. Initialize the FastAPI backend app skeleton.
2. Build the Document Text Extraction Service (handling file parsing to raw strings).
3. Construct the optimized `spaCy` sentence segmentation pipeline to export texts with clear start/end index dictionaries.

### Phase 2: Dual-Tier Matcher Engine
1. Implement the lexical TF-IDF matching matrix.
2. Integrate the `sentence-transformers` bi-encoder script to handle vector-space similarity computation.
3. Establish a mock local dataset JSON file containing reference academic materials to run system matching tests.

### Phase 3: Async Queue Architecture
1. Spin up the Redis task queue structure and write the Celery task definitions for background analysis processing.
2. Build the interactive endpoints (`/api/analyze`, `/api/status/{job_id}`, and `/api/rewrite`).

### Phase 4: Frontend Development
1. Scaffold the React + Tailwind application inside the workspace.
2. Implement the high-contrast visual interface matching the pitch-black and atmospheric fog UI aesthetic constraints.
3. Build the coordinate-based highlighting script to read the backend text indices and map colors smoothly.

### Phase 5: PDF Engine & System Wrap
1. Set up the WeasyPrint rendering logic to turn data arrays into official downloadable reports.
2. Conduct a unified E2E integration verification pass.

Begin execution by initializing the file structures and generating the structural plan artifact for Phase 1.