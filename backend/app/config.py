import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Lemma Plagiarism Analysis Platform"
    
    # Path configuration
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    
    # File limits
    MAX_FILE_SIZE_MB: int = 100
    ALLOWED_EXTENSIONS: set[str] = {"pdf", "docx", "txt"}
    
    # NLP / AI Settings
    SPACY_MODEL: str = "en_core_web_sm"
    
    # Database Settings
    SQLITE_DB_FILE: str = "lemma.db"
    
    # Redis & Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Firebase settings (to be integrated fully in Phase 4)
    FIREBASE_CREDENTIALS_PATH: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()

# Ensure uploads directory exists
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
