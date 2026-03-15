"""add_url_to_workspace_activity

Revision ID: 59ff0c3c8bbb
Revises: 002
Create Date: 2026-03-15 08:35:15.690777

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '59ff0c3c8bbb'
down_revision: Union[str, None] = '002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('workspace_activities', sa.Column('url', sa.String(length=1024), nullable=True))


def downgrade() -> None:
    op.drop_column('workspace_activities', 'url')
