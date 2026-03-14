"""Recent workspace events for sidebar."""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.event import Event


async def get_events(session: AsyncSession, user_id: str, limit: int = 50) -> list[dict]:
    """Return recent events (id, source, event, timestamp as string)."""
    r = await session.execute(
        select(Event).where(Event.user_id == user_id).order_by(Event.event_at.desc()).limit(limit)
    )
    events = r.scalars().all()
    return [
        {
            "id": e.id,
            "source": e.source,
            "event": e.event,
            "timestamp": e.event_at.strftime("%Y-%m-%d %H:%M") if e.event_at else "",
        }
        for e in events
    ]
