"""Integrations list and connect/disconnect."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user, AsyncSessionDep
from app.db.models.user import User
from app.schemas.integrations import IntegrationOut, IntegrationConnectIn, IntegrationDisconnectIn
from app.services.integrations_service import (
    list_integrations,
    connect_integration,
    disconnect_integration,
)

router = APIRouter()


@router.get("", response_model=list[IntegrationOut])
async def integrations_list(
    current_user: Annotated[User, Depends(get_current_user)],
    session: AsyncSessionDep,
):
    """GET /api/integrations — list integrations with connection status."""
    items = await list_integrations(session, current_user.id)
    return items


@router.post("/connect")
async def integrations_connect(
    current_user: Annotated[User, Depends(get_current_user)],
    session: AsyncSessionDep,
    body: IntegrationConnectIn,
):
    """POST /api/integrations/connect — connect an integration."""
    features = body.enabled_features or body.connectedApps
    try:
        await connect_integration(
            session,
            current_user.id,
            body.integration_id,
            enabled_features=features,
            email=body.email,
            domain=body.domain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return {"ok": True}


@router.post("/disconnect")
async def integrations_disconnect(
    current_user: Annotated[User, Depends(get_current_user)],
    session: AsyncSessionDep,
    body: IntegrationDisconnectIn,
):
    """POST /api/integrations/disconnect — disconnect an integration."""
    await disconnect_integration(session, current_user.id, body.integration_id)
    return {"ok": True}
