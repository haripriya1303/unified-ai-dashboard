"""Search: keyword + semantic (pgvector) over tasks, messages, documents."""
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.task import Task
from app.db.models.message import Message
from app.db.models.activity_item import ActivityItem
from app.db.models.document import Document
from app.db.models.document_chunk import DocumentChunk


async def _vector_search(
    session: AsyncSession, user_id: str, query_embedding: list[float], limit: int
) -> list[dict]:
    """Semantic search over document_chunks (pgvector). Returns SearchResultOut-shaped dicts."""
    if not query_embedding:
        return []
    stmt = (
        select(DocumentChunk)
        .join(Document, DocumentChunk.document_id == Document.id)
        .where(Document.user_id == user_id, DocumentChunk.embedding.isnot(None))
        .order_by(DocumentChunk.embedding.cosine_distance(query_embedding))
        .limit(limit)
    )
    result = await session.execute(stmt)
    chunks = result.scalars().all()
    return [
        {
            "id": c.id,
            "title": (c.content[:60] + "…") if c.content and len(c.content) > 60 else (c.content or "Document"),
            "description": (c.content[:200] if c.content else "") or "",
            "source": c.source,
            "sourceIcon": "file",
            "url": c.url or "#",
            "type": "document",
        }
        for c in chunks
    ]


async def search_workspace(
    session: AsyncSession, user_id: str, q: str, limit: int = 20
) -> list[dict]:
    """
    Keyword + optional semantic search. Returns SearchResultOut-shaped dicts.
    """
    if not q or not q.strip():
        return []
    term = f"%{q.strip()}%"
    results = []
    seen_ids: set[str] = set()

    # Optional: add semantic results (requires embedding; skip if no API key to avoid failure)
    try:
        from app.ai.embeddings import embed_text
        query_embedding = await embed_text(q.strip())
        vector_results = await _vector_search(session, user_id, query_embedding, limit=10)
        for r in vector_results:
            if r["id"] not in seen_ids:
                seen_ids.add(r["id"])
                results.append(r)
    except Exception:
        pass

    # Tasks
    r = await session.execute(
        select(Task)
        .where(Task.user_id == user_id, Task.title.ilike(term))
        .limit(limit)
    )
    for t in r.scalars().all():
        if t.id not in seen_ids:
            seen_ids.add(t.id)
            results.append({
                "id": t.id,
                "title": t.title,
                "description": t.status or "",
                "source": "Tasks",
                "sourceIcon": "list",
                "url": "#",
                "type": "task",
            })

    # Messages
    r = await session.execute(
        select(Message).where(Message.user_id == user_id, Message.content.ilike(term)).limit(limit)
    )
    for m in r.scalars().all():
        if m.id not in seen_ids:
            seen_ids.add(m.id)
            results.append({
                "id": m.id,
                "title": m.sender,
                "description": m.content[:200] if m.content else "",
                "source": m.source.capitalize(),
                "sourceIcon": "mail" if m.source == "email" else "message",
                "url": "#",
                "type": "message",
            })

    # Activity items
    r = await session.execute(
        select(ActivityItem).where(
            ActivityItem.user_id == user_id,
            or_(ActivityItem.title.ilike(term), ActivityItem.description.ilike(term)),
        ).limit(limit)
    )
    for a in r.scalars().all():
        if a.id not in seen_ids:
            seen_ids.add(a.id)
            results.append({
                "id": a.id,
                "title": a.title,
                "description": a.description or "",
                "source": a.source,
                "sourceIcon": "activity",
                "url": "#",
                "type": "task",
            })

    # Documents
    r = await session.execute(
        select(Document).where(
            Document.user_id == user_id,
            or_(Document.title.ilike(term), Document.content.ilike(term)),
        ).limit(limit)
    )
    for d in r.scalars().all():
        if d.id not in seen_ids:
            seen_ids.add(d.id)
            results.append({
                "id": d.id,
                "title": d.title or "Untitled",
                "description": (d.content[:200] if d.content else "") or "",
                "source": d.source,
                "sourceIcon": "file",
                "url": d.url or "#",
                "type": "document",
            })

    return results[:limit]
