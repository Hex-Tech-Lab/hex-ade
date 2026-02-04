"""
FastAPI Main Application
========================

Main entry point for the Autonomous Coding UI server.
Provides REST API, WebSocket, and static file serving.
"""

import asyncio
import logging
import os
import shutil
import sys
from contextlib import asynccontextmanager
from pathlib import Path

# Fix for Windows subprocess support in asyncio
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from dotenv import load_dotenv

# Load environment variables from server/.env
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

from fastapi import FastAPI, HTTPException, Request, WebSocket
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from .utils.response import error_response
from .routers import (
    agent_router,
    assistant_chat_router,
    devserver_router,
    expand_project_router,
    features_router,
    filesystem_router,
    projects_router,
    schedules_router,
    settings_router,
    spec_creation_router,
    terminal_router,
)
from .schemas import SetupStatus
from .services.assistant_chat_session import (
    cleanup_all_sessions as cleanup_assistant_sessions,
)
from .services.chat_constants import ROOT_DIR
from .services.dev_server_manager import (
    cleanup_all_devservers,
    cleanup_orphaned_devserver_locks,
)
from .services.expand_chat_session import cleanup_all_expand_sessions
from .services.process_manager import cleanup_all_managers, cleanup_orphaned_locks
from .services.scheduler_service import cleanup_scheduler, get_scheduler
from .services.terminal_manager import cleanup_all_terminals
from .websocket import project_websocket

# Module logger
logger = logging.getLogger(__name__)

# Paths
UI_DIST_DIR = ROOT_DIR / "ui" / "dist"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown."""
    # Startup - clean up orphaned lock files from previous runs
    cleanup_orphaned_locks()
    cleanup_orphaned_devserver_locks()

    # Start the scheduler service
    scheduler = get_scheduler()
    await scheduler.start()

    yield

    # Shutdown - cleanup scheduler first to stop triggering new starts
    await cleanup_scheduler()
    # Then cleanup all running agents, sessions, terminals, and dev servers
    await cleanup_all_managers()
    await cleanup_assistant_sessions()
    await cleanup_all_expand_sessions()
    await cleanup_all_terminals()
    await cleanup_all_devservers()


# Create FastAPI app
app = FastAPI(
    title="Autonomous Coding UI",
    description="Web UI for the Autonomous Coding Agent",
    version="1.0.0",
    lifespan=lifespan,
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "error": {"code": str(exc.status_code), "message": exc.detail},
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "status": "error",
            "error": {
                "code": "422",
                "message": str(exc.errors()),
                "details": exc.errors(),
            },
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception")
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "error": {
                "code": "500",
                "message": "Internal Server Error",
                "details": str(exc),
            },
        },
    )


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers - Prefixes are defined within the routers themselves
app.include_router(projects_router)
app.include_router(features_router)
app.include_router(agent_router)
app.include_router(filesystem_router)
app.include_router(terminal_router)
app.include_router(devserver_router)
app.include_router(spec_creation_router)
app.include_router(expand_project_router)
app.include_router(assistant_chat_router)
app.include_router(settings_router)
app.include_router(schedules_router)


# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# Static files
# Order matters: check for UI files, then catch-all for Next.js routing
if UI_DIST_DIR.exists():
    app.mount("/static", StaticFiles(directory=UI_DIST_DIR / "static"), name="static")

    @app.get("/{path:path}")
    async def serve_ui(path: str):
        # Try to serve specific file
        file_path = UI_DIST_DIR / path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)

        # Fallback to index.html for SPA routing
        index_path = UI_DIST_DIR / "index.html"
        if index_path.exists():
            return FileResponse(index_path)

        raise HTTPException(status_code=404, detail="Not found")


# Main execution
if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
