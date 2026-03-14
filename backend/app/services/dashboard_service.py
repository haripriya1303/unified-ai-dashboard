"""Dashboard aggregation: tasks, messages, workspace_activity, ai_summary, connected_apps. Optional Redis cache."""
import json
from datetime import datetime, date, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.task import Task
from app.db.models.message import Message
from app.db.models.workspace_activity import WorkspaceActivity
from app.db.models.integration import Integration
from app.db.models.user_integration import UserIntegration

DASHBOARD_CACHE_TTL = 120  # seconds
CACHE_KEY_PREFIX = "dashboard:"


def _format_due(d: date | None) -> str | None:
    if d is None:
        return None
    today = date.today()
    if d == today:
        return "Today"
    if d == today - timedelta(days=1):
        return "Yesterday"
    delta = (d - today).days
    if delta == 1:
        return "Tomorrow"
    if -1 <= delta <= 7:
        return d.isoformat()
    return d.strftime("%Y-%m-%d")


def _format_ts(dt: datetime | None) -> str:
    if dt is None:
        return ""
    return dt.isoformat() if dt else ""


async def get_dashboard(session: AsyncSession, user_id: str) -> dict:
    """Build dashboard payload for one user."""
    # Tasks (limit 20)
    r = await session.execute(
        select(Task).where(Task.user_id == user_id).order_by(Task.updated_at.desc()).limit(20)
    )
    tasks = r.scalars().all()
    task_out = [
        {
            "id": t.id,
            "title": t.title,
            "status": t.status,
            "priority": t.priority,
            "assignee": t.assignee,
            "dueDate": _format_due(t.due_date),
        }
        for t in tasks
    ]

    # Messages (limit 10)
    r = await session.execute(
        select(Message).where(Message.user_id == user_id).order_by(Message.created_at.desc()).limit(10)
    )
    messages = r.scalars().all()
    message_out = [
        {
            "id": m.id,
            "sender": m.sender,
            "avatar": m.avatar_url,
            "content": m.content,
            "source": m.source,
            "timestamp": _format_ts(m.created_at),
            "unread": m.unread,
        }
        for m in messages
    ]

    # Workspace activity (limit 15)
    r = await session.execute(
        select(WorkspaceActivity)
        .where(WorkspaceActivity.user_id == user_id)
        .order_by(WorkspaceActivity.event_at.desc())
        .limit(15)
    )
    activities = r.scalars().all()
    activity_out = [
        {
            "id": a.id,
            "type": a.type,
            "title": a.title,
            "description": a.description or "",
            "source": a.source,
            "timestamp": _format_ts(a.event_at),
            "actor": a.actor,
        }
        for a in activities
    ]

    # Connected apps from user_integrations
    r = await session.execute(
        select(UserIntegration, Integration)
        .join(Integration, UserIntegration.integration_id == Integration.id)
        .where(UserIntegration.user_id == user_id, UserIntegration.status == "connected")
    )
    rows = r.all()
    connected_apps = []
    for ui, integ in rows:
        last_sync = None
        if ui.last_sync_at:
            last_sync = ui.last_sync_at.strftime("%Y-%m-%d %H:%M")
        connected_apps.append({
            "id": integ.id,
            "name": integ.name,
            "icon": integ.icon,
            "status": ui.status,
            "lastSync": last_sync,
        })

    # Placeholder AI summary (Phase 9 will add real generation + cache)
    ai_summary = "Connect integrations and add tasks to see your personalized AI summary here."

    return {
        "tasks": task_out,
        "messages": message_out,
        "workspace_activity": activity_out,
        "ai_summary": ai_summary,
        "connected_apps": connected_apps,
    }


async def get_dashboard_cached(session: AsyncSession, user_id: str) -> dict:
    """Get dashboard, using Redis cache when available."""
    from app.services.queue import get_redis
    r = get_redis()
    if r:
        try:
            key = CACHE_KEY_PREFIX + user_id
            raw = r.get(key)
            if raw:
                return json.loads(raw)
        except Exception:
            pass
    data = await get_dashboard(session, user_id)
    if r:
        try:
            r.setex(
                CACHE_KEY_PREFIX + user_id,
                DASHBOARD_CACHE_TTL,
                json.dumps(data),
            )
        except Exception:
            pass
    return data
