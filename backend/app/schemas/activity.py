"""Activity board schemas — match frontend ActivityItem."""
from pydantic import BaseModel


class ActivityItemOut(BaseModel):
    id: str
    title: str
    description: str
    status: str  # pending | in-progress | completed
    priority: str
    assignee: str | None = None
    source: str
    createdAt: str  # frontend camelCase
    updatedAt: str
