"""LLM calls (OpenAI-compatible)."""
from openai import AsyncOpenAI

from app.config import get_settings

_settings = get_settings()
_openai: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _openai
    if _openai is None:
        _openai = AsyncOpenAI(
            api_key=_settings.openai_api_key or "not-set",
            base_url=_settings.openai_api_base,
        )
    return _openai


async def chat_completion(system: str, user_message: str) -> str:
    """Single turn: system + user message, return assistant content."""
    client = _get_client()
    resp = await client.chat.completions.create(
        model=_settings.openai_model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user_message},
        ],
        max_tokens=1024,
    )
    if not resp.choices:
        return ""
    return (resp.choices[0].message.content or "").strip()
