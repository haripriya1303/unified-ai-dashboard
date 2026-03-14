"""User and profile endpoints."""
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, AsyncSessionDep
from app.db.models.user import User
from app.schemas.user import UserMe, UserMeUpdate

router = APIRouter()


@router.get("/me", response_model=UserMe)
async def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Return current user profile."""
    return current_user


@router.patch("/me", response_model=UserMe)
async def update_me(
    current_user: Annotated[User, Depends(get_current_user)],
    session: AsyncSessionDep,
    body: UserMeUpdate,
) -> User:
    """Update current user profile (e.g. name)."""
    if body.name is not None:
        current_user.name = body.name
    session.add(current_user)
    await session.flush()
    await session.refresh(current_user)
    return current_user
