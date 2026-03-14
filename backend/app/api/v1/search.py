"""Search endpoint."""
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_user, AsyncSessionDep
from app.db.models.user import User
from app.schemas.search import SearchResultOut
from app.services.search_service import search_workspace

router = APIRouter()


@router.get("", response_model=list[SearchResultOut])
async def search(
    current_user: Annotated[User, Depends(get_current_user)],
    session: AsyncSessionDep,
    q: str = Query("", description="Search query"),
):
    """GET /api/search?q= — search workspace (tasks, messages, documents)."""
    results = await search_workspace(session, current_user.id, q)
    return results
