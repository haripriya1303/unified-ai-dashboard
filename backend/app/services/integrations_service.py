"""Integrations: list, connect, disconnect."""
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.integration import Integration
from app.db.models.user_integration import UserIntegration


async def list_integrations(session: AsyncSession, user_id: str) -> list[dict]:
    """
    Return all integrations with per-user status (connected/disconnected/pending).
    Frontend expects: id, name, description, icon, status, category, lastSync?, eventsCount?
    """
    r = await session.execute(select(Integration).order_by(Integration.name))
    integrations = r.scalars().all()
    r2 = await session.execute(select(UserIntegration).where(UserIntegration.user_id == user_id))
    by_integration = {ui.integration_id: ui for ui in r2.scalars().all()}

    out = []
    for i in integrations:
        ui = by_integration.get(i.id)
        status = ui.status if ui else "disconnected"
        last_sync = None
        if ui and ui.last_sync_at:
            last_sync = ui.last_sync_at.strftime("%Y-%m-%d %H:%M")
        events_count = ui.events_count if ui else None
        out.append({
            "id": i.id,
            "name": i.name,
            "description": i.description or "",
            "icon": i.icon,
            "status": status,
            "category": i.category,
            "lastSync": last_sync,
            "eventsCount": events_count,
        })
    return out


async def connect_integration(
    session: AsyncSession,
    user_id: str,
    integration_id: str,
    enabled_features: list[str] | None = None,
    email: str | None = None,
    domain: str | None = None,
) -> None:
    """Create or update user_integration to connected."""
    r = await session.execute(select(Integration).where(Integration.id == integration_id))
    integ = r.scalar_one_or_none()
    if not integ:
        raise ValueError("Integration not found")

    r = await session.execute(
        select(UserIntegration).where(
            UserIntegration.user_id == user_id,
            UserIntegration.integration_id == integration_id,
        )
    )
    ui = r.scalar_one_or_none()
    config = {}
    if enabled_features is not None:
        config["enabled_features"] = enabled_features
    if email is not None:
        config["email"] = email
    if domain is not None:
        config["domain"] = domain

    if ui:
        ui.status = "connected"
        ui.config = config
        ui.last_sync_at = datetime.utcnow()
        session.add(ui)
    else:
        ui = UserIntegration(
            user_id=user_id,
            integration_id=integration_id,
            status="connected",
            config=config or None,
            last_sync_at=datetime.utcnow(),
        )
        session.add(ui)
    await session.commit()
    await session.refresh(ui)


async def disconnect_integration(
    session: AsyncSession, user_id: str, integration_id: str
) -> None:
    """Set user_integration status to disconnected (or delete)."""
    r = await session.execute(
        select(UserIntegration).where(
            UserIntegration.user_id == user_id,
            UserIntegration.integration_id == integration_id,
        )
    )
    ui = r.scalar_one_or_none()
    if ui:
        ui.status = "disconnected"
        await session.commit()
        await session.refresh(ui)
