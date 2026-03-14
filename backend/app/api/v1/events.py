"""Recent events endpoint."""
from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user, AsyncSessionDep
from app.db.models.user import User
from app.schemas.events import WorkspaceEventOut
from app.services.events_service import get_events

router = APIRouter()


@router.get("", response_model=list[WorkspaceEventOut])
async def events_list(
    current_user: Annotated[User, Depends(get_current_user)],
    session: AsyncSessionDep,
):
    """GET /api/events — recent workspace events for sidebar."""
    events = await get_events(session, current_user.id)
    return events
