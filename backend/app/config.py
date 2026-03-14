"""Application configuration from environment."""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Settings loaded from .env."""

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/unified_ai_dashboard"

    # Supabase
    supabase_url: str = "https://placeholder.supabase.co"
    supabase_jwt_secret: str = "placeholder-secret"
    supabase_anon_key: str = ""

    # Dev auth bypass (local only)
    dev_auth_bypass: bool = False

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # LLM
    openai_api_key: str = ""
    openai_api_base: str = "https://api.openai.com/v1"
    openai_model: str = "gpt-4o-mini"

    # Embeddings
    embedding_model: str = "text-embedding-3-small"
    embedding_dimension: int = 1536

    # Webhooks
    slack_signing_secret: str = ""
    github_webhook_secret: str = ""
    jira_webhook_secret: str = ""
    notion_webhook_secret: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()
