"""Application configuration."""
import os
from typing import Optional


class Settings:
    """Application settings."""

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://altx:altx_password@localhost:5432/altx_db"
    )

    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

    # Seed data
    SEED_USER_EMAIL: Optional[str] = os.getenv("SEED_USER_EMAIL")
    SEED_USER_PASSWORD: Optional[str] = os.getenv("SEED_USER_PASSWORD")

    # Backend
    BACKEND_HOST: str = os.getenv("BACKEND_HOST", "0.0.0.0")
    BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", "8000"))


settings = Settings()
