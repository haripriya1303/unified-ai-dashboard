"""Dashboard overview endpoint."""
from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user, AsyncSessionDep
from app.db.models.user import User
from app.schemas.dashboard import DashboardDataOut
from app.services.dashboard_service import get_dashboard_cached

router = APIRouter()


@router.get("", response_model=DashboardDataOut)
async def dashboard_overview(
    current_user: Annotated[User, Depends(get_current_user)],
    session: AsyncSessionDep,
):
    """GET /api/dashboard — tasks, messages, workspace_activity, ai_summary, connected_apps."""
    data = await get_dashboard_cached(session, current_user.id)
    return data
