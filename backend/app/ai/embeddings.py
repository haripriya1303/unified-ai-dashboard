# """Embedding generation using OpenAI-compatible API."""
# from openai import AsyncOpenAI

# from app.config import get_settings

# _settings = get_settings()
# _openai: AsyncOpenAI | None = None


# def _get_client() -> AsyncOpenAI:
#     global _openai
#     if _openai is None:
#         _openai = AsyncOpenAI(
#             api_key=_settings.openai_api_key or "not-set",
#             base_url=_settings.openai_api_base,
#         )
#     return _openai


# async def embed_text(text: str) -> list[float]:
#     """Return embedding vector for text. Uses configured embedding model."""
#     if not text.strip():
#         return [0.0] * _settings.embedding_dimension
#     client = _get_client()
#     # OpenAI embeddings endpoint
#     resp = await client.embeddings.create(
#         model=_settings.embedding_model,
#         input=text.strip(),
#     )
#     if not resp.data:
#         return [0.0] * _settings.embedding_dimension
#     return list(resp.data[0].embedding)
"""Embedding generation using HuggingFace sentence-transformers."""

from sentence_transformers import SentenceTransformer
from app.config import get_settings

_settings = get_settings()

_model: SentenceTransformer | None = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(_settings.embedding_model)
    return _model


async def embed_text(text: str) -> list[float]:
    """Return embedding vector for text."""
    
    if not text.strip():
        return [0.0] * _settings.embedding_dimension

    model = _get_model()

    embedding = model.encode(text.strip())

    return embedding.tolist()