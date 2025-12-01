from sqlalchemy import Column, String, Integer, Text, DateTime, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.database import Base


class AdminPassword(Base):
    __tablename__ = "admin_password"
    
    id = Column(Integer, primary_key=True, default=1)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


class Scan(Base):
    __tablename__ = "scans"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sender = Column(String(255), nullable=False, index=True)
    from_domain = Column(String(255), nullable=False, index=True)
    score = Column(Integer, nullable=False)
    risk_level = Column(String(20), nullable=False, index=True)
    summary = Column(JSON, nullable=False)
    signals = Column(JSON, nullable=False)
    recommendations = Column(JSON, nullable=False)
    headers = Column(Text, nullable=True)
    body = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)


class Report(Base):
    __tablename__ = "reports"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sender = Column(String(255), nullable=False, index=True)
    from_domain = Column(String(255), nullable=False, index=True)
    user_comment = Column(Text, nullable=True)
    headers = Column(Text, nullable=True)
    body = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
