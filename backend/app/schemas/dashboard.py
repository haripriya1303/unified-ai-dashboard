"""Dashboard response schemas — match frontend types."""
from pydantic import BaseModel


class TaskOut(BaseModel):
    id: str
    title: str
    status: str  # todo | in-progress | completed
    priority: str
    assignee: str | None = None
    dueDate: str | None = None  # frontend camelCase


class MessageOut(BaseModel):
    id: str
    sender: str
    avatar: str | None = None
    content: str
    source: str  # slack | email | github
    timestamp: str
    unread: bool


class WorkspaceActivityOut(BaseModel):
    id: str
    type: str  # commit | pr | comment | deploy | message
    title: str
    description: str
    source: str
    timestamp: str
    actor: str


class ConnectedAppOut(BaseModel):
    id: str
    name: str
    icon: str
    status: str  # connected | disconnected | syncing
    lastSync: str | None = None  # frontend camelCase


class DashboardDataOut(BaseModel):
    tasks: list[TaskOut]
    messages: list[MessageOut]
    workspace_activity: list[WorkspaceActivityOut]
    ai_summary: str
    connected_apps: list[ConnectedAppOut]
