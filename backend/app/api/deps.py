"""Shared dependencies: DB session, current user."""
from typing import Annotated

from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.models.user import User
from app.services.auth import get_current_user_from_request

AsyncSessionDep = Annotated[AsyncSession, Depends(get_db)]


async def get_current_user(
    request: Request,
    session: AsyncSessionDep,
) -> User:
    """Resolve current user from JWT (or dev bypass). Raises 401 if not authenticated."""
    user = await get_current_user_from_request(request, session)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    return user
