"""Seed integrations catalog.

Revision ID: 002
Revises: 001
Create Date: 2025-01-01 00:01:00

"""
from typing import Sequence, Union
import uuid

from alembic import op
import sqlalchemy as sa

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Fixed UUIDs so they are stable across envs
NS = uuid.UUID("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")
INTEGRATIONS = [
    ("Slack", "Team communication and messaging", "slack", "communication"),
    ("GitHub", "Code repository and version control", "github", "development"),
    ("Notion", "Documentation and knowledge base", "notebook", "productivity"),
    ("Jira", "Project tracking and management", "kanban", "project-management"),
    ("Google Workspace", "Email, calendar, and documents", "mail", "productivity"),
    ("Microsoft Workspace", "Email, meetings, chats, and calendar from Microsoft services.", "microsoft", "communication"),
]


def _id(name: str) -> str:
    return str(uuid.uuid5(NS, name))


def upgrade() -> None:
    conn = op.get_bind()
    for name, description, icon, category in INTEGRATIONS:
        conn.execute(
            sa.text(
                "INSERT INTO integrations (id, name, description, icon, category) VALUES (:id, :name, :description, :icon, :category)"
            ),
            {
                "id": _id(name),
                "name": name,
                "description": description,
                "icon": icon,
                "category": category,
            },
        )


def downgrade() -> None:
    op.execute(sa.text("DELETE FROM integrations"))
