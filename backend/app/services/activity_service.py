"""Activity board: activity items with status pending / in-progress / completed."""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.activity_item import ActivityItem


async def get_activity_list(session: AsyncSession, user_id: str) -> list[dict]:
    """Return activity items for Activity page (camelCase for frontend)."""
    r = await session.execute(
        select(ActivityItem).where(ActivityItem.user_id == user_id).order_by(ActivityItem.updated_at.desc())
    )
    items = r.scalars().all()
    return [
        {
            "id": i.id,
            "title": i.title,
            "description": i.description or "",
            "status": i.status,
            "priority": i.priority,
            "assignee": i.assignee,
            "source": i.source,
            "createdAt": i.created_at.isoformat() if i.created_at else "",
            "updatedAt": i.updated_at.isoformat() if i.updated_at else "",
        }
        for i in items
    ]
