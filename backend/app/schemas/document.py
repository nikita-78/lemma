from pydantic import BaseModel, Field

class SentenceCoordinate(BaseModel):
    text: str = Field(..., description="The raw text of the segmented sentence.")
    start_char: int = Field(..., description="The 0-based start character offset in the document.")
    end_char: int = Field(..., description="The 0-based end character offset in the document.")

class DocumentUploadResponse(BaseModel):
    filename: str = Field(..., description="The name of the uploaded file.")
    text: str = Field(..., description="The full extracted text of the document.")
    char_count: int = Field(..., description="Total characters in the document.")
    sentence_count: int = Field(..., description="Total segmented sentences in the document.")
    sentences: list[SentenceCoordinate] = Field(..., description="List of sentence coordinate objects.")
