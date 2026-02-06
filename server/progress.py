"""
Progress Tracking Utilities
===========================

Functions for tracking and displaying progress of the autonomous coding agent.
Now queries Supabase Postgres Features table.
"""

import json
import os
import urllib.request
import logging
from datetime import datetime, timezone
from pathlib import Path

WEBHOOK_URL = os.environ.get("PROGRESS_N8N_WEBHOOK_URL")
PROGRESS_CACHE_FILE = ".progress_cache"

logger = logging.getLogger(__name__)

def has_features(project_dir: Path) -> bool:
    """
    Check if the project has features in the database.
    
    Features are now stored in Supabase Postgres, not per-project SQLite.
    """
    from .api.database import Feature, create_database
    from .agents.registry import get_project_id_from_name

    try:
        project_name = project_dir.name
        project_id = get_project_id_from_name(project_name)
        if not project_id:
            return False

        _, SessionLocal = create_database(project_dir)
        with SessionLocal() as session:
            from sqlalchemy import func
            count = session.query(func.count(Feature.id)).filter(
                Feature.project_id == project_id
            ).scalar()
            return bool(count > 0)
    except Exception:
        return False


def count_passing_tests(project_dir: Path) -> tuple[int, int, int]:
    """
    Count passing, in_progress, and total tests for a project.
    
    Now queries Supabase Postgres Features table filtered by project_id.
    """
    from .api.database import Feature, create_database
    from .agents.registry import get_project_id_from_name

    try:
        project_name = project_dir.name
        project_id = get_project_id_from_name(project_name)
        if not project_id:
            return 0, 0, 0

        _, SessionLocal = create_database(project_dir)
        with SessionLocal() as session:
            from sqlalchemy import func, case
            result = session.query(
                func.count(Feature.id).label('total'),
                func.sum(case((Feature.passes == True, 1), else_=0)).label('passing'),
                func.sum(case((Feature.in_progress == True, 1), else_=0)).label('in_progress')
            ).filter(Feature.project_id == project_id).first()

            total = result.total or 0
            passing = int(result.passing or 0)
            in_progress = int(result.in_progress or 0)
            return passing, in_progress, total
    except Exception as e:
        logger.error(f"Database error in count_passing_tests: {e}")
        return 0, 0, 0


def get_all_passing_features(project_dir: Path) -> list[dict]:
    """
    Get all passing features for webhook notifications.
    """
    from .api.database import Feature, create_database
    from .agents.registry import get_project_id_from_name

    try:
        project_name = project_dir.name
        project_id = get_project_id_from_name(project_name)
        if not project_id:
            return []

        _, SessionLocal = create_database(project_dir)
        with SessionLocal() as session:
            features = session.query(Feature).filter(
                Feature.project_id == project_id,
                Feature.passes == True
            ).order_by(Feature.priority.asc()).all()
            return [
                {"id": f.id, "category": f.category, "name": f.name}
                for f in features
            ]
    except Exception as e:
        logger.error(f"Error in get_all_passing_features: {e}")
        return []


def send_progress_webhook(passing: int, total: int, project_dir: Path) -> None:
    """Send webhook notification when progress increases."""
    if not WEBHOOK_URL:
        return  # Webhook not configured

    from .autocoder_paths import get_progress_cache_path
    cache_file = get_progress_cache_path(project_dir)
    previous = 0
    previous_passing_ids = set()

    # Read previous progress and passing feature IDs
    if cache_file.exists():
        try:
            cache_data = json.loads(cache_file.read_text())
            previous = cache_data.get("count", 0)
            previous_passing_ids = set(cache_data.get("passing_ids", []))
        except Exception:
            previous = 0

    # Only notify if progress increased
    if passing > previous:
        # Find which features are now passing via API
        completed_tests = []
        current_passing_ids = []

        # Detect transition from old cache format (had count but no passing_ids)
        is_old_cache_format = len(previous_passing_ids) == 0 and previous > 0

        # Get all passing features via direct database access
        all_passing = get_all_passing_features(project_dir)
        for feature in all_passing:
            feature_id = feature.get("id")
            current_passing_ids.append(feature_id)
            # Only identify individual new tests if we have previous IDs to compare
            if not is_old_cache_format and feature_id not in previous_passing_ids:
                # This feature is newly passing
                name = feature.get("name", f"Feature #{feature_id}")
                category = feature.get("category", "")
                if category:
                    completed_tests.append(f"{category} {name}")
                else:
                    completed_tests.append(name)

        payload = {
            "event": "test_progress",
            "passing": passing,
            "total": total,
            "percentage": round((passing / total) * 100, 1) if total > 0 else 0,
            "previous_passing": previous,
            "tests_completed_this_session": passing - previous,
            "completed_tests": completed_tests,
            "project": project_dir.name,
            "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        }

        try:
            req = urllib.request.Request(
                WEBHOOK_URL,
                data=json.dumps([payload]).encode("utf-8"),  # n8n expects array
                headers={"Content-Type": "application/json"},
            )
            urllib.request.urlopen(req, timeout=5)
        except Exception as e:
            print(f"[Webhook notification failed: {e}]")

        # Update cache with count and passing IDs
        cache_file.write_text(
            json.dumps({"count": passing, "passing_ids": current_passing_ids})
        )
    else:
        # Update cache even if no change (for initial state)
        if not cache_file.exists():
            all_passing = get_all_passing_features(project_dir)
            current_passing_ids = [f.get("id") for f in all_passing]
            cache_file.write_text(
                json.dumps({"count": passing, "passing_ids": current_passing_ids})
            )


def print_session_header(session_num: int, is_initializer: bool) -> None:
    """Print a formatted header for the session."""
    session_type = "INITIALIZER" if is_initializer else "CODING AGENT"

    print("\n" + "=" * 70)
    print(f"  SESSION {session_num}: {session_type}")
    print("=" * 70)
    print()


def print_progress_summary(project_dir: Path) -> None:
    """Print a summary of current progress."""
    passing, in_progress, total = count_passing_tests(project_dir)

    if total > 0:
        percentage = (passing / total) * 100
        status_parts = [f"{passing}/{total} tests passing ({percentage:.1f}%)"]
        if in_progress > 0:
            status_parts.append(f"{in_progress} in progress")
        print(f"\nProgress: {', '.join(status_parts)}")
        send_progress_webhook(passing, total, project_dir)
    else:
        print("\nProgress: No features in database yet")