"""SQLAlchemy models — import all so Base.metadata is complete for Alembic."""
from app.db.base import Base
from app.db.models.user import User
from app.db.models.task import Task
from app.db.models.message import Message
from app.db.models.workspace_activity import WorkspaceActivity
from app.db.models.activity_item import ActivityItem
from app.db.models.integration import Integration
from app.db.models.user_integration import UserIntegration
from app.db.models.event import Event
from app.db.models.document import Document
from app.db.models.document_chunk import DocumentChunk

__all__ = [
    "Base",
    "User",
    "Task",
    "Message",
    "WorkspaceActivity",
    "ActivityItem",
    "Integration",
    "UserIntegration",
    "Event",
    "Document",
    "DocumentChunk",
]
