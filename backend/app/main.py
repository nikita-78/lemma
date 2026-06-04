from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.config import settings
from backend.app.schemas.document import DocumentUploadResponse, SentenceCoordinate
from backend.app.services.extractor import (
    DocumentExtractorService,
    FileSizeExceededError,
    UnsupportedFileTypeError,
    ExtractionError,
)
from backend.app.services.segmenter import SentenceSegmenterService

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for Plagiarism Detection and Text Rewriting",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, we would restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handlers
@app.exception_handler(FileSizeExceededError)
async def file_size_exceeded_handler(request, exc: FileSizeExceededError):
    return JSONResponse(
        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
        content={"detail": str(exc)},
    )

@app.exception_handler(UnsupportedFileTypeError)
async def unsupported_file_type_handler(request, exc: UnsupportedFileTypeError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exc)},
    )

@app.exception_handler(ExtractionError)
async def extraction_error_handler(request, exc: ExtractionError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": str(exc)},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc: Exception):
    # Log this in a production app
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"An unexpected error occurred: {str(exc)}"},
    )

@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs": "/docs",
        "status": "online",
    }

@app.get("/health")
@app.get(f"{settings.API_V1_STR}/health")
async def health():
    return {"status": "ok", "project": settings.PROJECT_NAME}

@app.post(
    f"{settings.API_V1_STR}/documents/upload",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_200_OK,
    summary="Upload and segment a document",
    description="Ingests a PDF, DOCX, or TXT file, validates constraints, extracts plain text, and segments it into sentences with absolute character indices."
)
async def upload_document(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided in upload request."
        )

    # Read content
    content = await file.read()
    
    # Extract text (validations are performed internally)
    text = DocumentExtractorService.extract_text(file.filename, content)
    
    # Segment sentences with coordinates
    sentences_data = SentenceSegmenterService.segment(text)
    
    # Format response
    sentences = [
        SentenceCoordinate(
            text=s["text"],
            start_char=s["start_char"],
            end_char=s["end_char"]
        )
        for s in sentences_data
    ]
    
    return DocumentUploadResponse(
        filename=file.filename,
        text=text,
        char_count=len(text),
        sentence_count=len(sentences),
        sentences=sentences
    )
