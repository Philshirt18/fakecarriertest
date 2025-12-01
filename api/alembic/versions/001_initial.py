"""initial

Revision ID: 001
Revises: 
Create Date: 2025-11-27

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'scans',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('sender', sa.String(255), nullable=False, index=True),
        sa.Column('from_domain', sa.String(255), nullable=False, index=True),
        sa.Column('score', sa.Integer, nullable=False),
        sa.Column('risk_level', sa.String(20), nullable=False, index=True),
        sa.Column('summary', JSONB, nullable=False),
        sa.Column('signals', JSONB, nullable=False),
        sa.Column('recommendations', JSONB, nullable=False),
        sa.Column('headers', sa.Text, nullable=True),
        sa.Column('body', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, index=True),
    )

    op.create_table(
        'reports',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('sender', sa.String(255), nullable=False, index=True),
        sa.Column('from_domain', sa.String(255), nullable=False, index=True),
        sa.Column('user_comment', sa.Text, nullable=True),
        sa.Column('headers', sa.Text, nullable=True),
        sa.Column('body', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, index=True),
    )


def downgrade() -> None:
    op.drop_table('reports')
    op.drop_table('scans')
