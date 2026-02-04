"""
Standard Response Wrapper
=========================

Provides a consistent response format for all API endpoints.
"""

from datetime import datetime, timezone
from typing import Any, Optional


def success_response(data: Any, meta: Optional[dict] = None) -> dict:
    """Wrap successful response data."""
    response = {
        "status": "success",
        "data": data,
        "meta": {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "version": "1.0"
        }
    }
    if meta:
        response["meta"].update(meta)
    return response


def error_response(code: str, message: str, details: Optional[dict] = None) -> dict:
    """Wrap error response data."""
    return {
        "status": "error",
        "error": {
            "code": code,
            "message": message,
            "details": details or {}
        },
        "meta": {
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    }
