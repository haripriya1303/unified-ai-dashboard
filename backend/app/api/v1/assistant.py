"""AI assistant query endpoint."""
from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user, AsyncSessionDep
from app.db.models.user import User
from app.schemas.assistant import AssistantQueryIn, AssistantQueryOut, AssistantSource
from app.ai.rag import rag_query

router = APIRouter()


@router.post("/query", response_model=AssistantQueryOut)
async def assistant_query(
    current_user: Annotated[User, Depends(get_current_user)],
    session: AsyncSessionDep,
    body: AssistantQueryIn,
):
    """POST /api/assistant/query — RAG: embed, retrieve, LLM, return answer + sources."""
    answer, sources = await rag_query(session, current_user.id, body.query)
    return AssistantQueryOut(
        answer=answer,
        sources=[AssistantSource(title=s["title"], url=s["url"]) for s in sources],
    )
