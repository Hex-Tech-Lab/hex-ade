"""
Project Registry Module
=======================

Cross-platform project registry for storing project name to path mappings.
Uses SQLite database stored at ~/.autocoder/registry.db by default,
or the global DATABASE_URL (Supabase) if available.
"""

import logging
import os
import re
import threading
import time
import uuid
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path
from typing import Any

from sqlalchemy import Boolean, Column, DateTime, Integer, String, create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.dialects.postgresql import UUID as pgUUID

# Module logger
logger = logging.getLogger(__name__)


# =============================================================================
# Model Configuration (Single Source of Truth)
# =============================================================================

# Available models with display names
AVAILABLE_MODELS = [
    {"id": "claude-opus-4-5-20251101", "name": "Claude Opus 4.5"},
    {"id": "claude-sonnet-4-5-20250929", "name": "Claude Sonnet 4.5"},
]

VALID_MODELS = [m["id"] for m in AVAILABLE_MODELS]

_env_default_model = os.getenv("ANTHROPIC_DEFAULT_OPUS_MODEL")
if _env_default_model is not None:
    _env_default_model = _env_default_model.strip()
DEFAULT_MODEL = _env_default_model or "claude-opus-4-5-20251101"

if DEFAULT_MODEL and DEFAULT_MODEL not in VALID_MODELS:
    VALID_MODELS.append(DEFAULT_MODEL)
DEFAULT_YOLO_MODE = False

# SQLite connection settings
SQLITE_TIMEOUT = 30
SQLITE_MAX_RETRIES = 3


# =============================================================================
# Exceptions
# =============================================================================

class RegistryError(Exception):
    """Base registry exception."""
    pass


class RegistryNotFound(RegistryError):
    """Registry file doesn't exist."""
    pass


class RegistryCorrupted(RegistryError):
    """Registry database is corrupted."""
    pass


class RegistryPermissionDenied(RegistryError):
    """Can't read/write registry file."""
    pass


# =============================================================================
# SQLAlchemy Model
# =============================================================================

class Base(DeclarativeBase):
    """SQLAlchemy 2.0 style declarative base."""
    pass

# Helper to handle UUID across Postgres/SQLite
_db_url_for_type_check = os.getenv("DATABASE_URL")
_IS_SQLITE = not _db_url_for_type_check or _db_url_for_type_check.startswith("sqlite")
UUID_TYPE = pgUUID(as_uuid=True) if not _IS_SQLITE else String(36)

class Project(Base):
    """SQLAlchemy model for registered projects."""
    __tablename__ = "projects"

    id = Column(UUID_TYPE, primary_key=True, default=lambda: uuid.uuid4() if not _IS_SQLITE else str(uuid.uuid4()))
    name = Column(String(255), unique=True, index=True, nullable=False)
    path = Column(String(1024), nullable=False)
    has_spec = Column(Boolean, default=False)
    default_concurrency = Column(Integer, nullable=False, default=3)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
    created_by = Column(UUID_TYPE, nullable=True)


class Settings(Base):
    """SQLAlchemy model for global settings (key-value store)."""
    __tablename__ = "settings"

    key = Column(String(50), primary_key=True)
    value = Column(String(500), nullable=False)
    updated_at = Column(DateTime, nullable=False)


# =============================================================================
# Database Connection
# =============================================================================

_engine = None
_SessionLocal = None
_engine_lock = threading.Lock()


def get_config_dir() -> Path:
    config_dir = Path.home() / ".autocoder"
    config_dir.mkdir(parents=True, exist_ok=True)
    return config_dir


def get_registry_path() -> Path:
    return get_config_dir() / "registry.db"


def _get_engine():
    global _engine, _SessionLocal

    # Double-checked locking for thread safety
    if _engine is None:
        with _engine_lock:
            if _engine is None:
                # Check for global DATABASE_URL (e.g. Supabase)
                db_url = os.getenv("DATABASE_URL")
                if db_url:
                    # Fix for postgres:// vs postgresql://
                    if db_url.startswith("postgres://"):
                        db_url = db_url.replace("postgres://", "postgresql://", 1)
                    # Add sslmode if not sqlite
                    if not db_url.startswith("sqlite") and "sslmode" not in db_url:
                        if "?" in db_url:
                            db_url += "&sslmode=require"
                        else:
                            db_url += "?sslmode=require"
                    
                    _engine = create_engine(db_url, pool_pre_ping=True)
                    logger.info("Initialized registry using DATABASE_URL")
                else:
                    db_path = get_registry_path()
                    db_url = f"sqlite:///{db_path.as_posix()}"
                    _engine = create_engine(
                        db_url,
                        connect_args={
                            "check_same_thread": False,
                            "timeout": SQLITE_TIMEOUT,
                        }
                    )
                    logger.debug("Initialized local registry database at: %s", db_path)

                Base.metadata.create_all(bind=_engine)
                _migrate_add_default_concurrency(_engine)
                _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)

    return _engine, _SessionLocal


def _migrate_add_default_concurrency(engine) -> None:
    # Only for SQLite
    if engine.url.drivername == "sqlite":
        with engine.connect() as conn:
            result = conn.execute(text("PRAGMA table_info(projects)"))
            columns = [row[1] for row in result.fetchall()]
            if "default_concurrency" not in columns:
                conn.execute(text(
                    "ALTER TABLE projects ADD COLUMN default_concurrency INTEGER DEFAULT 3"
                ))
                conn.commit()
                logger.info("Migrated projects table: added default_concurrency column")


@contextmanager
def _get_session():
    _, SessionLocal = _get_engine()
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def _with_retry(func, *args, **kwargs):
    last_error = None
    for attempt in range(SQLITE_MAX_RETRIES):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            last_error = e
            error_str = str(e).lower()
            if "database is locked" in error_str or "sqlite_busy" in error_str:
                if attempt < SQLITE_MAX_RETRIES - 1:
                    wait_time = (2 ** attempt) * 0.1
                    time.sleep(wait_time)
                    continue
            raise
    raise last_error


# =============================================================================
# Project CRUD Functions
# =============================================================================

def register_project(name: str, path: Path) -> None:
    if not re.match(r'^[a-zA-Z0-9_-]{1,50}$', name):
        raise ValueError("Invalid project name.")

    path = Path(path).resolve()

    with _get_session() as session:
        existing = session.query(Project).filter(Project.name == name).first()
        if existing:
            raise RegistryError(f"Project '{name}' already exists in registry")

        project = Project(
            name=name,
            path=path.as_posix(),
            created_at=datetime.now()
        )
        session.add(project)

    logger.info("Registered project '%s' at path: %s", name, path)


def unregister_project(name: str) -> bool:
    with _get_session() as session:
        project = session.query(Project).filter(Project.name == name).first()
        if not project:
            return False

        session.delete(project)

    logger.info("Unregistered project: %s", name)
    return True


def get_project_path(name: str) -> Path | None:
    _, SessionLocal = _get_engine()
    session = SessionLocal()
    try:
        project = session.query(Project).filter(Project.name == name).first()
        if project is None:
            return None
        return Path(project.path)
    finally:
        session.close()


def list_registered_projects() -> dict[str, dict[str, Any]]:
    _, SessionLocal = _get_engine()
    session = SessionLocal()
    try:
        projects = session.query(Project).all()
        return {
            p.name: {
                "path": p.path,
                "created_at": p.created_at.isoformat() if p.created_at else None,
                "default_concurrency": getattr(p, 'default_concurrency', 3) or 3
            }
            for p in projects
        }
    finally:
        session.close()


def get_project_info(name: str) -> dict[str, Any] | None:
    _, SessionLocal = _get_engine()
    session = SessionLocal()
    try:
        project = session.query(Project).filter(Project.name == name).first()
        if project is None:
            return None
        return {
            "path": project.path,
            "created_at": project.created_at.isoformat() if project.created_at else None,
            "default_concurrency": getattr(project, 'default_concurrency', 3) or 3
        }
    finally:
        session.close()


def update_project_path(name: str, new_path: Path) -> bool:
    new_path = Path(new_path).resolve()

    with _get_session() as session:
        project = session.query(Project).filter(Project.name == name).first()
        if not project:
            return False

        project.path = new_path.as_posix()

    return True


def get_project_concurrency(name: str) -> int:
    _, SessionLocal = _get_engine()
    session = SessionLocal()
    try:
        project = session.query(Project).filter(Project.name == name).first()
        if project is None:
            return 3
        return getattr(project, 'default_concurrency', 3) or 3
    finally:
        session.close()


def set_project_concurrency(name: str, concurrency: int) -> bool:
    if concurrency < 1 or concurrency > 5:
        raise ValueError("concurrency must be between 1 and 5")

    with _get_session() as session:
        project = session.query(Project).filter(Project.name == name).first()
        if not project:
            return False

        project.default_concurrency = concurrency

    return True


# =============================================================================
# Validation Functions
# =============================================================================

def validate_project_path(path: Path) -> tuple[bool, str]:
    path = Path(path).resolve()
    if not path.exists():
        return False, f"Path does not exist: {path}"
    if not path.is_dir():
        return False, f"Path is not a directory: {path}"
    if not os.access(path, os.R_OK):
        return False, f"No read permission: {path}"
    if not os.access(path, os.W_OK):
        return False, f"No write permission: {path}"
    return True, ""


def cleanup_stale_projects() -> list[str]:
    removed = []
    with _get_session() as session:
        projects = session.query(Project).all()
        for project in projects:
            path = Path(project.path)
            if not path.exists():
                session.delete(project)
                removed.append(project.name)
    return removed


def list_valid_projects() -> list[dict[str, Any]]:
    _, SessionLocal = _get_engine()
    session = SessionLocal()
    try:
        projects = session.query(Project).all()
        valid = []
        for p in projects:
            path = Path(p.path)
            is_valid, _ = validate_project_path(path)
            if is_valid:
                valid.append({
                    "name": p.name,
                    "path": p.path,
                    "created_at": p.created_at.isoformat() if p.created_at else None
                })
        return valid
    finally:
        session.close()


# =============================================================================
# Settings CRUD Functions
# =============================================================================

def get_setting(key: str, default: str | None = None) -> str | None:
    try:
        _, SessionLocal = _get_engine()
        session = SessionLocal()
        try:
            setting = session.query(Settings).filter(Settings.key == key).first()
            return setting.value if setting else default
        finally:
            session.close()
    except Exception as e:
        logger.warning("Failed to read setting '%s': %s", key, e)
        return default


def set_setting(key: str, value: str) -> None:
    with _get_session() as session:
        setting = session.query(Settings).filter(Settings.key == key).first()
        if setting:
            setting.value = value
            setting.updated_at = datetime.now()
        else:
            setting = Settings(
                key=key,
                value=value,
                updated_at=datetime.now()
            )
            session.add(setting)


def get_all_settings() -> dict[str, str]:
    try:
        _, SessionLocal = _get_engine()
        session = SessionLocal()
        try:
            settings = session.query(Settings).all()
            return {s.key: s.value for s in settings}
        finally:
            session.close()
    except Exception as e:
        logger.warning("Failed to read settings: %s", e)
        return {}