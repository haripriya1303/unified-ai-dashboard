"""Activity board endpoint."""
from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user, AsyncSessionDep
from app.db.models.user import User
from app.schemas.activity import ActivityItemOut
from app.services.activity_service import get_activity_list

router = APIRouter()


@router.get("", response_model=list[ActivityItemOut])
async def activity_list(
    current_user: Annotated[User, Depends(get_current_user)],
    session: AsyncSessionDep,
):
    """GET /api/activity — activity items for board (pending / in-progress / completed)."""
    items = await get_activity_list(session, current_user.id)
    return items
