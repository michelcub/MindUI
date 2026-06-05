"""Application configuration."""

from functools import lru_cache
from typing import List, Literal

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AI Studio"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./test.db"

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Cookie settings
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: Literal["lax", "strict", "none"] = "lax"

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
