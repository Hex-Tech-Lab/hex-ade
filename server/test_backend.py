"""
Test Backend for E2E Testing
Simple API to test frontend wiring
"""

from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
from datetime import datetime, timezone
from typing import List, Dict, Any
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Hex-Ade Test API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data
MOCK_PROJECTS = [
    {
        "name": "demo",
        "path": "/test/demo",
        "has_spec": True,
        "stats": {"passing": 3, "in_progress": 2, "total": 10, "percentage": 30},
        "default_concurrency": 2,
    },
    {
        "name": "test-project",
        "path": "/home/user/test",
        "has_spec": False,
        "stats": {"passing": 0, "in_progress": 0, "total": 0, "percentage": 0},
        "default_concurrency": 1,
    },
]

MOCK_FEATURES = {
    "demo": {
        "pending": [
            {
                "id": 1,
                "priority": 1,
                "category": "api",
                "name": "User Auth",
                "description": "Implement user authentication",
                "steps": ["Add auth routes", "Add JWT"],
                "passes": False,
                "in_progress": False,
            },
            {
                "id": 2,
                "priority": 2,
                "category": "ui",
                "name": "Dashboard",
                "description": "Build dashboard UI",
                "steps": ["Create layout", "Add charts"],
                "passes": False,
                "in_progress": False,
            },
        ],
        "in_progress": [
            {
                "id": 3,
                "priority": 1,
                "category": "db",
                "name": "Database Schema",
                "description": "Design database schema",
                "steps": ["Create tables", "Add indexes"],
                "passes": False,
                "in_progress": True,
            },
        ],
        "done": [
            {
                "id": 4,
                "priority": 3,
                "category": "setup",
                "name": "Project Setup",
                "description": "Initialize project structure",
                "steps": ["Create dirs", "Install deps"],
                "passes": True,
                "in_progress": False,
            },
        ],
    },
    "test-project": {"pending": [], "in_progress": [], "done": []},
}

# WebSocket connections
websocket_manager = set()


@app.get("/")
async def root():
    return {
        "status": "running",
        "service": "Hex-Ade Test API",
        "time": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/health")
async def health():
    return {"status": "healthy"}


@app.get("/api/projects")
async def get_projects():
    return {
        "status": "success",
        "data": MOCK_PROJECTS,
        "meta": {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "version": "1.0",
            "count": len(MOCK_PROJECTS),
        },
    }


@app.get("/api/projects/{project_name}/features")
async def get_features(project_name: str):
    features = MOCK_FEATURES.get(
        project_name, {"pending": [], "in_progress": [], "done": []}
    )
    return {
        "status": "success",
        "data": features,
        "meta": {"timestamp": datetime.now(timezone.utc).isoformat(), "version": "1.0"},
    }


@app.post("/api/projects")
async def create_project(project: Dict[str, Any]):
    project_name = project.get("name", f"project-{len(MOCK_PROJECTS)}")
    new_project = {
        "name": project_name,
        "path": project.get("path", f"/projects/{project_name}"),
        "has_spec": False,
        "stats": {"passing": 0, "in_progress": 0, "total": 0, "percentage": 0},
        "default_concurrency": project.get("default_concurrency", 1),
    }
    MOCK_PROJECTS.append(new_project)
    MOCK_FEATURES[project_name] = {"pending": [], "in_progress": [], "done": []}
    return {
        "status": "success",
        "data": new_project,
        "meta": {"timestamp": datetime.now(timezone.utc).isoformat(), "version": "1.0"},
    }


@app.delete("/api/projects/{project_name}")
async def delete_project(project_name: str):
    global MOCK_PROJECTS
    MOCK_PROJECTS = [p for p in MOCK_PROJECTS if p["name"] != project_name]
    if project_name in MOCK_FEATURES:
        del MOCK_FEATURES[project_name]
    return {
        "status": "success",
        "data": {"deleted": project_name},
        "meta": {"timestamp": datetime.now(timezone.utc).isoformat(), "version": "1.0"},
    }


# WebSocket endpoint
@app.websocket("/ws/project/{project_name}")
async def project_websocket(websocket: WebSocket, project_name: str):
    await websocket.accept()
    websocket_manager.add(websocket)

    # Send initial connection message
    await websocket.send_json(
        {
            "type": "log",
            "line": f"Connected to project: {project_name}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    )

    # Simulate progress updates
    await asyncio.sleep(1)
    await websocket.send_json({"type": "progress", "feature_id": 1, "progress": 25})

    await asyncio.sleep(2)
    await websocket.send_json(
        {
            "type": "log",
            "line": "Agent started: GPT-4o-mini",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "feature_id": 1,
        }
    )

    try:
        while True:
            await asyncio.sleep(5)
            # Keep connection alive
            await websocket.send_json(
                {"type": "ping", "timestamp": datetime.now(timezone.utc).isoformat()}
            )
    except Exception:
        pass
    finally:
        websocket_manager.discard(websocket)


# Assistant chat endpoint
@app.websocket("/ws/assistant/chat/{project_name}")
async def assistant_chat(websocket: WebSocket, project_name: str):
    await websocket.accept()

    await websocket.send_json(
        {
            "id": "1",
            "role": "assistant",
            "content": f"Hello! I'm your assistant for project {project_name}. How can I help?",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    )

    try:
        while True:
            data = await websocket.receive_json()
            message = data.get("message", "")

            # Echo back with assistant response
            await websocket.send_json(
                {
                    "id": "2",
                    "role": "assistant",
                    "content": f"I received: '{message}'. This is a mock response from the assistant.",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }
            )
    except Exception:
        pass


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
