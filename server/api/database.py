"""
Database Models and Connection
==============================

Supabase PostgreSQL database schema for hex-ade using SQLAlchemy.
Includes fallback support for SQLite during local testing.
"""

import os
from datetime import datetime, timezone
from typing import Generator, Optional
import uuid

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    create_engine,
    text,
    JSON,
)
from sqlalchemy.orm import DeclarativeBase, Session, relationship, sessionmaker
from sqlalchemy.dialects.postgresql import JSONB, UUID as pgUUID

def _utc_now() -> datetime:
    """Return current UTC time."""
    return datetime.now(timezone.utc)

class Base(DeclarativeBase):
    """SQLAlchemy 2.0 style declarative base."""
    pass

# Helper to handle UUID and JSONB across Postgres/SQLite
DATABASE_URL = os.getenv("DATABASE_URL")
print(f"DEBUG: DATABASE_URL is {DATABASE_URL}")
IS_SQLITE = DATABASE_URL and DATABASE_URL.startswith("sqlite")

UUID_TYPE = pgUUID(as_uuid=True) if not IS_SQLITE else String(36)
JSON_TYPE = JSONB if not IS_SQLITE else JSON

class Project(Base):
    """Project model."""
    __tablename__ = "projects"

    id = Column(UUID_TYPE, primary_key=True, default=lambda: str(uuid.uuid4()) if IS_SQLITE else uuid.uuid4)
    name = Column(String(255), unique=True, nullable=False)
    path = Column(String(1024), nullable=False)
    has_spec = Column(Boolean, default=False)
    default_concurrency = Column(Integer, default=3)
    created_at = Column(DateTime(timezone=True), default=_utc_now)
    updated_at = Column(DateTime(timezone=True), default=_utc_now, onupdate=_utc_now)
    created_by = Column(UUID_TYPE, nullable=True)

    features = relationship("Feature", back_populates="project", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    agent_logs = relationship("AgentLog", back_populates="project", cascade="all, delete-orphan")

class Feature(Base):
    """Feature model representing a test case/feature to implement."""
    __tablename__ = "features"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(UUID_TYPE, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(50), default='FUNCTIONAL')
    priority = Column(Integer, default=0)
    status = Column(String(50), default='pending')
    passes = Column(Boolean, default=False)
    in_progress = Column(Boolean, default=False)
    steps = Column(JSON_TYPE, default=[])
    created_at = Column(DateTime(timezone=True), default=_utc_now)
    updated_at = Column(DateTime(timezone=True), default=_utc_now, onupdate=_utc_now)

    project = relationship("Project", back_populates="features")
    tasks = relationship("Task", back_populates="feature")

class Task(Base):
    """Execution history task."""
    __tablename__ = "tasks"

    id = Column(UUID_TYPE, primary_key=True, default=lambda: str(uuid.uuid4()) if IS_SQLITE else uuid.uuid4)
    project_id = Column(UUID_TYPE, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    feature_id = Column(Integer, ForeignKey("features.id", ondelete="SET NULL"), nullable=True)
    task_description = Column(Text, nullable=False)
    complexity = Column(String(50))
    role = Column(String(50))
    bias = Column(String(50))
    status = Column(String(50), default='pending')
    result = Column(JSON_TYPE)
    duration_seconds = Column(Integer)
    created_at = Column(DateTime(timezone=True), default=_utc_now)
    executed_at = Column(DateTime(timezone=True))

    project = relationship("Project", back_populates="tasks")
    feature = relationship("Feature", back_populates="tasks")

class AgentLog(Base):
    """Agent logs."""
    __tablename__ = "agent_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(UUID_TYPE, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    agent_name = Column(String(255))
    log_level = Column(String(20))
    message = Column(Text)
    metadata_json = Column(JSON_TYPE, name="metadata")
    created_at = Column(DateTime(timezone=True), default=_utc_now)

    project = relationship("Project", back_populates="agent_logs")

class Schedule(Base):
    """Time-based schedule for automated agent start/stop."""
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_name = Column(String(50), nullable=False, index=True)
    start_time = Column(String(5), nullable=False)  # "HH:MM" format
    duration_minutes = Column(Integer, nullable=False)
    days_of_week = Column(Integer, nullable=False, default=127)
    enabled = Column(Boolean, nullable=False, default=True, index=True)
    yolo_mode = Column(Boolean, nullable=False, default=False)
    model = Column(String(50), nullable=True)
    max_concurrency = Column(Integer, nullable=False, default=3)
    crash_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), default=_utc_now)

    overrides = relationship("ScheduleOverride", back_populates="schedule", cascade="all, delete-orphan")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "project_name": self.project_name,
            "start_time": self.start_time,
            "duration_minutes": self.duration_minutes,
            "days_of_week": self.days_of_week,
            "enabled": self.enabled,
            "yolo_mode": self.yolo_mode,
            "model": self.model,
            "max_concurrency": self.max_concurrency,
            "crash_count": self.crash_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def is_active_on_day(self, weekday: int) -> bool:
        day_bit = 1 << weekday
        return bool(self.days_of_week & day_bit)

class ScheduleOverride(Base):
    """Persisted manual override for a schedule window."""
    __tablename__ = "schedule_overrides"

    id = Column(Integer, primary_key=True, autoincrement=True)
    schedule_id = Column(Integer, ForeignKey("schedules.id", ondelete="CASCADE"), nullable=False)
    override_type = Column(String(10), nullable=False)  # "start" or "stop"
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=_utc_now)

    schedule = relationship("Schedule", back_populates="overrides")

# Connection Setup
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if not IS_SQLITE and DATABASE_URL and "sslmode" not in DATABASE_URL:
    if "?" in DATABASE_URL:
        DATABASE_URL += "&sslmode=require"
    else:
        DATABASE_URL += "?sslmode=require"

engine = create_engine(
    DATABASE_URL or "sqlite:///./hex_ade.db",
    pool_pre_ping=True,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from contextlib import contextmanager

@contextmanager
def atomic_transaction(session_maker):
    """Context manager for atomic database transactions."""
    session = session_maker()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

def dispose_engine(project_dir: Optional[Path] = None):
    """Dispose of the database engine."""
    engine.dispose()

def get_db() -> Generator[Session, None, None]:
    """Dependency for FastAPI to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_database(project_dir: Optional[Path] = None):
    """Create all tables in the database."""
    Base.metadata.create_all(bind=engine)
    return engine, SessionLocal
