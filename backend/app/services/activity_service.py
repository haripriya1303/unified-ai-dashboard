"""Activity board: activity items with status pending / in-progress / completed."""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.activity_item import ActivityItem

from app.db.models.workspace_activity import WorkspaceActivity

async def get_activity_list(session: AsyncSession, user_id: str) -> list[dict]:
    """Return activity items for Activity page (camelCase for frontend)."""
    r = await session.execute(
        select(ActivityItem).where(ActivityItem.user_id == user_id).order_by(ActivityItem.updated_at.desc())
    )
    items = r.scalars().all()
    
    r_ws = await session.execute(
        select(WorkspaceActivity).where(WorkspaceActivity.user_id == user_id).order_by(WorkspaceActivity.created_at.desc())
    )
    ws_items = r_ws.scalars().all()
    
    result = [
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
    
    for w in ws_items:
        result.append({
            "id": w.id,
            "title": w.title,
            "description": w.description or "",
            "status": "completed",
            "priority": "medium",
            "assignee": w.actor,
            "source": w.source,
            "createdAt": w.created_at.isoformat() if w.created_at else "",
            "updatedAt": w.created_at.isoformat() if w.created_at else "",
        })
        
    # Sort combined result by createdAt descending
    result.sort(key=lambda x: x["createdAt"], reverse=True)
    return result
