"""Recent events schema — match frontend WorkspaceEvent."""
from pydantic import BaseModel


class WorkspaceEventOut(BaseModel):
    id: str
    source: str
    event: str
    timestamp: str
